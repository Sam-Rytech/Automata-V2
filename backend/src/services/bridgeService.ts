import { encodeFunctionData, parseUnits, decodeEventLog } from 'viem';
import { baseClient, celoClient, ethClient } from '../utils/rpc';
import { startBridgeRelay } from './stellarBridgeRelay';

// ---------------------------------------------------------------------------
// CCTP V2 contract addresses — identical across all chains via CREATE2
// Verified on Basescan and Etherscan April 2026
// ---------------------------------------------------------------------------

const TOKEN_MESSENGER_V2: Record<string, `0x${string}`> = {
  base:     '0x28b5a0e9C621a5BADaa536219b3a228C8168cF5d',
  celo:     '0x28b5a0e9C621a5BADaa536219b3a228C8168cF5d',
  ethereum: '0x28b5a0e9C621a5BADaa536219b3a228C8168cF5d',
};

const MESSAGE_TRANSMITTER_V2: Record<string, `0x${string}`> = {
  base:     '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
  celo:     '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
  ethereum: '0x81D40F21F12A8F0E3252Bccb954D722d4c464B64',
};

const USDC_ADDRESS: Record<string, `0x${string}`> = {
  base:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  celo:     '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
};

const CCTP_DOMAIN: Record<string, number> = {
  ethereum: 0,
  base:     6,
  celo:     7,
  stellar:  27,
};

// ---------------------------------------------------------------------------
// ABI fragments
// ---------------------------------------------------------------------------

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

const RECEIVE_MESSAGE_ABI = [
  {
    name: 'receiveMessage',
    type: 'function',
    inputs: [
      { name: 'message',     type: 'bytes' },
      { name: 'attestation', type: 'bytes' },
    ],
    outputs: [{ name: 'success', type: 'bool' }],
  },
] as const;

const MESSAGE_SENT_ABI = [
  {
    name: 'MessageSent',
    type: 'event',
    inputs: [{ name: 'message', type: 'bytes', indexed: false }],
  },
] as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function addressToBytes32(address: string): `0x${string}` {
  const clean = address.toLowerCase().replace('0x', '');
  return `0x${clean.padStart(64, '0')}`;
}

function stellarAddressToBytes32(stellarAddress: string): `0x${string}` {
  const { StrKey } = require('@stellar/stellar-sdk');
  const rawBytes = StrKey.decodeEd25519PublicKey(stellarAddress) as Buffer;
  return `0x${rawBytes.toString('hex').padStart(64, '0')}`;
}

function getEvmClientForChain(chain: string) {
  switch (chain) {
    case 'base':     return baseClient;
    case 'celo':     return celoClient;
    case 'ethereum': return ethClient;
    default: throw new Error(`Unsupported chain: ${chain}`);
  }
}

// ---------------------------------------------------------------------------
// Circle Iris V2 attestation polling
// GET https://iris-api.circle.com/v2/messages/{sourceDomain}?transactionHash={burnTxHash}
// ---------------------------------------------------------------------------

const IRIS_API = 'https://iris-api.circle.com/v2/messages';
const POLL_INTERVAL_MS  = 5_000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

export async function pollAttestation(
  sourceDomain: number,
  burnTxHash: string
): Promise<{ message: string; attestation: string }> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    try {
      const url = `${IRIS_API}/${sourceDomain}?transactionHash=${burnTxHash}`;
      const res  = await fetch(url);
      const json = await res.json() as any;

      if (
        json?.messages?.[0]?.status === 'complete' &&
        json?.messages?.[0]?.attestation &&
        json?.messages?.[0]?.message
      ) {
        console.log(`[Bridge] Attestation complete for ${burnTxHash}`);
        return {
          message:     json.messages[0].message     as string,
          attestation: json.messages[0].attestation as string,
        };
      }

      console.log(`[Bridge] Awaiting attestation (attempt ${attempt + 1})...`);
    } catch (err) {
      console.error('[Bridge] Attestation poll error:', err);
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(`Attestation timed out after ${MAX_POLL_ATTEMPTS} attempts for ${burnTxHash}`);
}

// ---------------------------------------------------------------------------
// Build the receiveMessage (mint) tx for the destination chain
// Called after attestation is complete
// ---------------------------------------------------------------------------

export function buildReceiveMessageTx(params: {
  destinationChain: string;
  message:          string;
  attestation:      string;
  amount:           string;
}): any {
  const { destinationChain, message, attestation, amount } = params;

  const data = encodeFunctionData({
    abi: RECEIVE_MESSAGE_ABI,
    functionName: 'receiveMessage',
    args: [message as `0x${string}`, attestation as `0x${string}`],
  });

  return {
    to:          MESSAGE_TRANSMITTER_V2[destinationChain],
    data,
    value:       '0',
    chainId:     destinationChain,
    description: `Claim ${amount} USDC on ${destinationChain}`,
    txType:      'mint',
  };
}

// ---------------------------------------------------------------------------
// Called by the frontend after burn tx confirms — for Stellar relay only
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
// Main exported function — builds approve + burn txs
// ---------------------------------------------------------------------------

export async function buildBridgeTx(params: {
  fromChain:        string;
  toChain:          string;
  amount:           string;
  walletAddress:    string;
  recipientAddress: string;
}): Promise<any> {

  const { fromChain, toChain, amount, walletAddress, recipientAddress } = params;

  if (!TOKEN_MESSENGER_V2[fromChain]) {
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

  if (toChain === 'stellar') {
    return {
      error: true,
      message: 'Native USDC bridging to Stellar via Circle CCTP V2 is coming soon. In the meantime I can bridge your USDC to Celo or Ethereum, or swap it to XLM on Stellar\'s DEX. Which would you prefer?',
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

  // ── TX 1: approve ─────────────────────────────────────────────────────────

  const approveData = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [TOKEN_MESSENGER_V2[fromChain], amountInUnits],
  });

  const approveTx = {
    to:          USDC_ADDRESS[fromChain],
    data:        approveData,
    value:       '0',
    chainId:     fromChain,
    description: `Authorise ${amount} USDC to move from ${fromChain}`,
    txType:      'approve',
  };

  // ── TX 2: depositForBurn ──────────────────────────────────────────────────

  const mintRecipient     = addressToBytes32(recipientAddress);
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
    to:          TOKEN_MESSENGER_V2[fromChain],
    data:        burnData,
    value:       '0',
    chainId:     fromChain,
    description: `Send ${amount} USDC from ${fromChain} to ${toChain}`,
    txType:      'burn',
    bridgeMeta: {
      sourceChain:      fromChain,
      destinationChain: toChain,
      sourceDomain:     CCTP_DOMAIN[fromChain],
      recipientAddress,
      amount,
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
      note: `Two steps: first authorise, then send. Your USDC arrives on ${toChain} in about 90 seconds.`,
    },
  };
}
