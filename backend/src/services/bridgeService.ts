import { encodeFunctionData, parseUnits, decodeEventLog } from 'viem';
import { baseClient } from '../utils/rpc';
import { startBridgeRelay } from './stellarBridgeRelay';

const IS_MAINNET = process.env.NODE_ENV === 'production';

const TOKEN_MESSENGER: Record<string, `0x${string}`> = IS_MAINNET
  ? {
      base:     '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
      celo:     '0x2B4069517957735bE00ceE0fadAE88a26365528f',
      ethereum: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
    }
  : {
      base:     '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
      celo:     '0x877B0900F3c46d91CDBDB76E4a0C7B67B1640E13',
      ethereum: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    };

const USDC_ADDRESS: Record<string, `0x${string}`> = IS_MAINNET
  ? {
      base:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      celo:     '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    }
  : {
      base:     '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      celo:     '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
      ethereum: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    };

const CCTP_DOMAIN: Record<string, number> = {
  ethereum: 0,
  base:     6,
  celo:     7,
  stellar:  4,
};

const ERC20_APPROVE_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const DEPOSIT_FOR_BURN_ABI = [
  {
    name: 'depositForBurn',
    type: 'function',
    inputs: [
      { name: 'amount',            type: 'uint256' },
      { name: 'destinationDomain', type: 'uint32'  },
      { name: 'mintRecipient',     type: 'bytes32' },
      { name: 'burnToken',         type: 'address' },
    ],
    outputs: [{ name: 'nonce', type: 'uint64' }],
  },
] as const;

const MESSAGE_SENT_ABI = [
  {
    name: 'MessageSent',
    type: 'event',
    inputs: [{ name: 'message', type: 'bytes', indexed: false }],
  },
] as const;

function addressToBytes32(address: string): `0x${string}` {
  const clean = address.toLowerCase().replace('0x', '');
  return `0x${clean.padStart(64, '0')}`;
}

// Stellar recipient address → bytes32 using raw public key bytes
function stellarAddressToBytes32(stellarAddress: string): `0x${string}` {
  const { StrKey } = require('@stellar/stellar-sdk');
  const rawBytes = StrKey.decodeEd25519PublicKey(stellarAddress) as Buffer;
  return `0x${rawBytes.toString('hex').padStart(64, '0')}`;
}

// ---------------------------------------------------------------------------
// Called by the frontend after burn tx confirms — extracts message and starts relay
// ---------------------------------------------------------------------------

export async function handleBurnConfirmed(params: {
  burnTxHash:       string;
  recipientAddress: string;
  amount:           string;
  onSuccess?: (txHash: string) => void;
  onError?:   (err: Error)     => void;
}): Promise<void> {
  try {
    const receipt = await baseClient.getTransactionReceipt({
      hash: params.burnTxHash as `0x${string}`,
    });

    // Find the MessageSent event log from the Message Transmitter contract
    let message: string | null = null;
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: MESSAGE_SENT_ABI,
          data: log.data,
          topics: log.topics,
        });
        message = (decoded.args as any).message as string;
        break;
      } catch {
        continue;
      }
    }

    if (!message) {
      throw new Error('MessageSent event not found in burn transaction logs');
    }

    const { keccak256 } = await import('viem');
    const messageHash = keccak256(message as `0x${string}`);

    await startBridgeRelay({
      messageHash,
      message,
      recipientAddress: params.recipientAddress,
      amount:           params.amount,
      onSuccess:        params.onSuccess,
      onError:          params.onError,
    });

  } catch (err: any) {
    console.error('[Bridge] handleBurnConfirmed error:', err);
    params.onError?.(err);
  }
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export async function buildBridgeTx(params: {
  fromChain:        string;
  toChain:          string;
  amount:           string;
  walletAddress:    string;
  recipientAddress: string;
}): Promise<any> {

  const { fromChain, toChain, amount, walletAddress, recipientAddress } = params;

  if (!TOKEN_MESSENGER[fromChain]) {
    return {
      error: true,
      message: `Bridging from "${fromChain}" is not supported. Supported: base, celo, ethereum.`,
    };
  }

  if (CCTP_DOMAIN[toChain] === undefined) {
    return {
      error: true,
      message: `Bridging to "${toChain}" is not supported.`,
    };
  }

  if (fromChain === toChain) {
    return {
      error: true,
      message: `Source and destination are both "${fromChain}". Choose two different chains.`,
    };
  }

  let amountInUnits: bigint;
  try {
    amountInUnits = parseUnits(amount, 6);
  } catch {
    return {
      error: true,
      message: `Invalid amount: "${amount}".`,
    };
  }

  // ── Approve tx ────────────────────────────────────────────────────────────

  const approveData = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [TOKEN_MESSENGER[fromChain], amountInUnits],
  });

  const approveTx = {
    to:          USDC_ADDRESS[fromChain],
    data:        approveData,
    value:       '0',
    chainId:     fromChain,
    description: `Authorise ${amount} USDC to move from ${fromChain}`,
    txType:      'approve',
  };

  // ── Burn tx ───────────────────────────────────────────────────────────────
  // For Stellar recipients, encode the Stellar public key as bytes32.
  // For EVM recipients, left-pad the EVM address as bytes32.

  const mintRecipient = toChain === 'stellar'
    ? stellarAddressToBytes32(recipientAddress)
    : addressToBytes32(recipientAddress);

  const destinationDomain = CCTP_DOMAIN[toChain];

  const burnData = encodeFunctionData({
    abi: DEPOSIT_FOR_BURN_ABI,
    functionName: 'depositForBurn',
    args: [
      amountInUnits,
      destinationDomain,
      mintRecipient as `0x${string}`,
      USDC_ADDRESS[fromChain],
    ],
  });

  const burnTx = {
    to:               TOKEN_MESSENGER[fromChain],
    data:             burnData,
    value:            '0',
    chainId:          fromChain,
    description:      `Send ${amount} USDC from ${fromChain} to ${toChain}`,
    txType:           'burn',
    // Metadata the frontend passes back to /api/bridge/relay after burn confirms
    bridgeMeta: {
      recipientAddress,
      amount,
      toChain,
    },
  };

  return {
    description: `Move ${amount} USDC from ${fromChain} to ${toChain}`,
    unsignedTx:  approveTx,
    unsignedTxs: [approveTx, burnTx],
    summary: {
      fromChain,
      toChain,
      amount,
      estimatedTimeSeconds: 90,
      estimatedFeeUSD:      '< $0.01',
      note: toChain === 'stellar'
        ? `Your USDC will arrive on Stellar automatically in about 90 seconds after you confirm.`
        : `Two steps: first authorise, then send. Your USDC arrives in about 90 seconds.`,
    },
  };
}
