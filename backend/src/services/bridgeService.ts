// backend/src/services/bridgeService.ts
// Step 4.2 — Circle CCTP V2 real bridge transactions
// Builds approve + depositForBurn unsigned calldata for EVM-to-EVM USDC bridging.
// Stellar bridging deferred to Phase 5.

import { encodeFunctionData, parseUnits } from 'viem';

// ---------------------------------------------------------------------------
// Contract addresses — mainnet and testnet sets.
// Toggle via NODE_ENV: 'production' = mainnet, anything else = testnet.
// ---------------------------------------------------------------------------

const IS_MAINNET = process.env.NODE_ENV === 'production';

const TOKEN_MESSENGER: Record<string, `0x${string}`> = IS_MAINNET
  ? {
      // Mainnet TokenMessenger addresses
      base:     '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
      celo:     '0x2B4069517957735bE00ceE0fadAE88a26365528f',
      ethereum: '0xBd3fa81B58Ba92a82136038B25aDec7066af3155',
    }
  : {
      // Testnet TokenMessenger addresses (Base Sepolia / Celo Alfajores / Eth Sepolia)
      base:     '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
      celo:     '0x877B0900F3c46d91CDBDB76E4a0C7B67B1640E13',
      ethereum: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
    };

const USDC_ADDRESS: Record<string, `0x${string}`> = IS_MAINNET
  ? {
      // Mainnet USDC addresses
      base:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      celo:     '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    }
  : {
      // Testnet USDC addresses
      base:     '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      celo:     '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
      ethereum: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    };

// CCTP domain IDs — same on mainnet and testnet
const CCTP_DOMAIN: Record<string, number> = {
  ethereum: 0,
  base:     6,
  celo:     7,
  stellar:  4, // reserved — EVM flow not applicable
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

// ---------------------------------------------------------------------------
// Helper: EVM address → bytes32 (left-padded with zeros to 32 bytes)
// ---------------------------------------------------------------------------

function addressToBytes32(address: string): `0x${string}` {
  const clean = address.toLowerCase().replace('0x', '');
  return `0x${clean.padStart(64, '0')}`;
}

// ---------------------------------------------------------------------------
// Main exported function — signature must match toolExecutor.ts expectations
// ---------------------------------------------------------------------------

export async function buildBridgeTx(params: {
  fromChain:        string;
  toChain:          string;
  amount:           string;
  walletAddress:    string;
  recipientAddress: string;
}): Promise<any> {

  const { fromChain, toChain, amount, walletAddress, recipientAddress } = params;

  // ── Validation ────────────────────────────────────────────────────────────

  if (toChain === 'stellar') {
    return {
      error: true,
      message:
        'Bridging to Stellar uses a different flow that is not yet live. ' +
        'You can bridge USDC between Base, Celo, and Ethereum today.',
    };
  }

  if (!TOKEN_MESSENGER[fromChain]) {
    return {
      error: true,
      message: `Bridging from "${fromChain}" is not supported. Supported: base, celo, ethereum.`,
    };
  }

  if (CCTP_DOMAIN[toChain] === undefined) {
    return {
      error: true,
      message: `Bridging to "${toChain}" is not supported. Supported: base, celo, ethereum.`,
    };
  }

  if (fromChain === toChain) {
    return {
      error: true,
      message: `Source and destination are both "${fromChain}". Choose two different chains.`,
    };
  }

  // ── Parse amount ──────────────────────────────────────────────────────────

  let amountInUnits: bigint;
  try {
    amountInUnits = parseUnits(amount, 6); // USDC = 6 decimals
  } catch {
    return {
      error: true,
      message: `Invalid amount: "${amount}". Use a number like "10" or "50.5".`,
    };
  }

  // ── Transaction 1: approve ────────────────────────────────────────────────
  // User approves TokenMessenger to pull their USDC before the burn.

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

  // ── Transaction 2: depositForBurn ─────────────────────────────────────────
  // Burns the USDC on the source chain. Circle attests the burn, then the
  // frontend builds the mint tx on the destination chain (Phase B — Phase 5).

  const mintRecipient    = addressToBytes32(recipientAddress);
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
    to:          TOKEN_MESSENGER[fromChain],
    data:        burnData,
    value:       '0',
    chainId:     fromChain,
    description: `Send ${amount} USDC from ${fromChain} to ${toChain}`,
    txType:      'burn',
  };

  // ── Return both transactions + metadata ───────────────────────────────────

  return {
    unsignedTxs: [approveTx, burnTx],
    summary: {
      fromChain,
      toChain,
      amount,
      fromToken:              'USDC',
      toToken:                'USDC',
      estimatedTimeSeconds:   90,
      estimatedFeeUSD:        '< $0.01', // CCTP has no bridge fee — user pays gas only
      note:
        `Two steps: first authorise, then send. ` +
        `Your USDC will arrive on ${toChain} in about 90 seconds.`,
    },
    // Stored for the frontend to build the mint tx (Phase B) after burn confirms
    cctpMintInfo: {
      destinationChain:   toChain,
      recipientAddress,
      destinationDomain,
    },
  };
}