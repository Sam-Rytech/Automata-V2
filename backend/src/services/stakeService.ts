// backend/src/services/stakeService.ts
// Step 4.4 — Real Aave V3 supply + Mento approve calldata
// Builds approve + supply unsigned transactions for Aave V3 (Base/Ethereum).
// Builds approve + placeholder swap for Mento on Celo (swap completes Phase 5).

import { encodeFunctionData, parseUnits } from 'viem';

const IS_MAINNET = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Contract addresses — mainnet and testnet
// ---------------------------------------------------------------------------

const AAVE_POOL: Record<string, `0x${string}`> = IS_MAINNET
  ? {
      base:     '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
      ethereum: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
    }
  : {
      base:     '0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b',
      ethereum: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
    };

const USDC_ADDRESS: Record<string, `0x${string}`> = IS_MAINNET
  ? {
      base:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      celo:     '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    }
  : {
      base:     '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      ethereum: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      celo:     '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B',
    };

// Mento Broker on Celo (testnet and mainnet share the same address pattern)
const MENTO_BROKER: `0x${string}` = IS_MAINNET
  ? '0x777A8255cA72412f0d706dc03C9d1987306B4CaD'  // Celo mainnet
  : '0x626F97a2B0A9c50919e26F05B7Fce0AbCe18bf54';  // Celo Alfajores

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

const AAVE_SUPPLY_ABI = [
  {
    name: 'supply',
    type: 'function',
    inputs: [
      { name: 'asset',        type: 'address' },
      { name: 'amount',       type: 'uint256' },
      { name: 'onBehalfOf',   type: 'address' },
      { name: 'referralCode', type: 'uint16'  },
    ],
    outputs: [],
  },
] as const;

// ---------------------------------------------------------------------------
// Aave V3 supply builder
// Returns approve + supply transactions.
// ---------------------------------------------------------------------------

function buildAaveSupply(params: {
  chain:         string;
  amount:        string;
  walletAddress: string;
}): { unsignedTxs: any[]; summary: any } | { error: true; message: string } {

  const { chain, amount, walletAddress } = params;

  if (!AAVE_POOL[chain]) {
    return {
      error:   true,
      message: `Aave V3 is not available on ${chain}. Supported: base, ethereum.`,
    };
  }

  let amountInUnits: bigint;
  try {
    amountInUnits = parseUnits(amount, 6); // USDC = 6 decimals
  } catch {
    return { error: true, message: `Invalid amount: "${amount}"` };
  }

  // Transaction 1: approve Aave Pool to spend USDC
  const approveData = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [AAVE_POOL[chain], amountInUnits],
  });

  const approveTx = {
    to:          USDC_ADDRESS[chain],
    data:        approveData,
    value:       '0',
    chainId:     chain,
    description: `Authorise Aave to use your USDC on ${chain}`,
    txType:      'approve',
  };

  // Transaction 2: supply USDC to Aave Pool
  const supplyData = encodeFunctionData({
    abi: AAVE_SUPPLY_ABI,
    functionName: 'supply',
    args: [
      USDC_ADDRESS[chain],
      amountInUnits,
      walletAddress as `0x${string}`,
      0, // referralCode — always 0
    ],
  });

  const supplyTx = {
    to:          AAVE_POOL[chain],
    data:        supplyData,
    value:       '0',
    chainId:     chain,
    description: `Deposit ${amount} USDC into Aave V3 on ${chain}`,
    txType:      'supply',
  };

  return {
    unsignedTxs: [approveTx, supplyTx],
    summary: {
      protocol:   'Aave V3',
      chain,
      token:      'USDC',
      amount,
      action:     'supply',
      youReceive: 'aUSDC — earns yield automatically in your wallet',
      note:       'Two steps: first authorise, then deposit.',
    },
  };
}

// ---------------------------------------------------------------------------
// Mento swap builder (Celo only)
// Transaction 1: real approve. Transaction 2: placeholder until Phase 5.
// ---------------------------------------------------------------------------

function buildMentoSwap(params: {
  amount:        string;
  walletAddress: string;
}): { unsignedTxs: any[]; summary: any } {

  const { amount } = params;

  let amountInUnits: bigint;
  try {
    amountInUnits = parseUnits(amount, 6);
  } catch {
    amountInUnits = BigInt(0);
  }

  // Transaction 1: approve Mento Broker to spend USDC — REAL
  const approveData = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [MENTO_BROKER, amountInUnits],
  });

  const approveTx = {
    to:          USDC_ADDRESS['celo'],
    data:        approveData,
    value:       '0',
    chainId:     'celo',
    description: 'Authorise Mento to use your USDC on Celo',
    txType:      'approve',
  };

  // Transaction 2: swapIn — PLACEHOLDER
  // TODO Phase 5: Replace with real swapIn() calldata.
  // The Mento BiPoolManager exchangeId for USDC→cUSD must be fetched at
  // runtime — it is not a static value. The full swap will be completed in
  // Phase 5 testnet integration work.
  const swapTx = {
    to:              MENTO_BROKER,
    data:            '0x',
    value:           '0',
    chainId:         'celo',
    description:     `Swap ${amount} USDC to cUSD via Mento`,
    txType:          'mento_swap',
    isPlaceholder:   true,
    placeholderNote: 'Mento swap calldata will be completed in Phase 5.',
  };

  return {
    unsignedTxs: [approveTx, swapTx],
    summary: {
      protocol:   'Mento',
      chain:      'celo',
      token:      'USDC',
      toToken:    'cUSD',
      amount,
      action:     'swap',
      youReceive: "cUSD — Celo's native dollar stablecoin",
      note:       'Approve transaction is real. Swap completes in Phase 5.',
    },
  };
}

// ---------------------------------------------------------------------------
// Main exported function — signature must stay as buildStakeTx
// ---------------------------------------------------------------------------

export async function buildStakeTx(params: {
  chain:         string;
  protocol:      string;
  token:         string;
  amount:        string;
  walletAddress: string;
}): Promise<any> {

  const { chain, protocol, token, amount, walletAddress } = params;

  // Normalise protocol name — Gemini may send "Aave" or "aave"
  const normalizedProtocol = protocol.toLowerCase().trim();

  if (normalizedProtocol === 'aave') {
    const result = buildAaveSupply({ chain, amount, walletAddress });
    if ('error' in result) {
      return { error: result.message };
    }
    return result;
  }

  if (normalizedProtocol === 'mento') {
    if (chain !== 'celo') {
      return { error: `Mento is only available on Celo. You requested: ${chain}.` };
    }
    return buildMentoSwap({ amount, walletAddress });
  }

  return {
    error: `Protocol "${protocol}" is not supported. Available: aave (Base, Ethereum), mento (Celo).`,
  };
}