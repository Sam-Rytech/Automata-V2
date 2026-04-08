// backend/src/services/yieldService.ts
// Step 4.3 — Real Aave V3 APY reads + Mento estimated rate
// Reads currentLiquidityRate from Aave V3 Pool contract via viem.
// Mento rate is a calibrated estimate (TODO Phase 5: replace with real read).

import { createPublicClient, http, parseAbi } from 'viem';
import { base, baseSepolia, mainnet, sepolia } from 'viem/chains';

const IS_MAINNET = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// In-memory cache — 5 minutes TTL.
// Aave rates change slowly. Caching avoids hammering RPC on every agent call.
// ---------------------------------------------------------------------------

type CacheEntry = { data: any; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCached(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ---------------------------------------------------------------------------
// Aave V3 Pool ABI — only the getReserveData function we need
// ---------------------------------------------------------------------------

const AAVE_POOL_ABI = parseAbi([
  'function getReserveData(address asset) view returns (' +
    'uint256 configuration, ' +
    'uint128 liquidityIndex, ' +
    'uint128 currentLiquidityRate, ' +
    'uint128 variableBorrowIndex, ' +
    'uint128 currentVariableBorrowRate, ' +
    'uint128 currentStableBorrowRate, ' +
    'uint40 lastUpdateTimestamp, ' +
    'uint16 id, ' +
    'address aTokenAddress, ' +
    'address stableDebtTokenAddress, ' +
    'address variableDebtTokenAddress, ' +
    'address interestRateStrategyAddress, ' +
    'uint128 accruedToTreasury, ' +
    'uint128 unbacked, ' +
    'uint128 isolationModeTotalDebt' +
  ')',
]);

// ---------------------------------------------------------------------------
// Aave V3 contract addresses — mainnet and testnet
// ---------------------------------------------------------------------------

const AAVE_POOLS: Record<string, { poolAddress: `0x${string}`; usdcAddress: `0x${string}`; chain: any }> = IS_MAINNET
  ? {
      base: {
        poolAddress: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5',
        usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        chain: base,
      },
      ethereum: {
        poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
        usdcAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        chain: mainnet,
      },
    }
  : {
      base: {
        poolAddress: '0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b',
        usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        chain: baseSepolia,
      },
      ethereum: {
        poolAddress: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951',
        usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        chain: sepolia,
      },
    };

// ---------------------------------------------------------------------------
// Helper: convert Aave ray-scaled rate to APY percentage
// ray = 1e27. Simplified formula: accurate to ±0.1% for display.
// ---------------------------------------------------------------------------

function rayToAPY(ray: bigint): number {
  const rateDecimal = Number(ray) / 1e27;
  return parseFloat((rateDecimal * 100).toFixed(2));
}

// ---------------------------------------------------------------------------
// Read Aave V3 APY for one chain
// ---------------------------------------------------------------------------

async function getAaveAPY(
  chainKey: string
): Promise<{ protocol: string; chain: string; token: string; apy: number; tvlNote: string } | null> {

  const cacheKey = `aave_${chainKey}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const config = AAVE_POOLS[chainKey];
  if (!config) return null;

  try {
    const client = createPublicClient({
      chain: config.chain,
      transport: http(chainKey === 'base' ? process.env.BASE_RPC_URL : process.env.ETH_RPC_URL),
    });

    const reserveData = await client.readContract({
      address: config.poolAddress,
      abi: AAVE_POOL_ABI,
      functionName: 'getReserveData',
      args: [config.usdcAddress],
    }) as any;

    // currentLiquidityRate is the 3rd field in the tuple (index 2).
    // Handle both named-object and positional-array return shapes across viem versions.
    const liquidityRate: bigint =
      (reserveData as any).currentLiquidityRate ??
      (reserveData as any)[2] ??
      BigInt(0);

    const apy = rayToAPY(liquidityRate);

    const result = {
      protocol: 'Aave V3',
      chain:    chainKey,
      token:    'USDC',
      apy,
      tvlNote:  'Battle-tested. Largest DeFi lending protocol.',
    };

    setCache(cacheKey, result);
    return result;

  } catch (err) {
    console.error(`[yieldService] Failed to read Aave APY for ${chainKey}:`, err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main exported function
// toolExecutor calls: getYieldRates({ chain, token })
// ---------------------------------------------------------------------------

export async function getYieldRates(params: {
  chain?: string;
  token?: string;
}): Promise<any> {

  // Support both object params (new) and positional args (legacy stub signature)
  const chain = typeof params === 'object' ? params.chain : (params as any);
  const token = typeof params === 'object' ? params.token : (arguments as any)[1];

  const results: any[] = [];

  const chainsToCheck = chain && chain !== 'all'
    ? [chain]
    : ['base', 'ethereum', 'celo'];

  for (const c of chainsToCheck) {
    if (c === 'base' || c === 'ethereum') {
      const aaveData = await getAaveAPY(c);
      if (aaveData) results.push(aaveData);
    }

    if (c === 'celo') {
      // TODO Phase 5: Replace with real Mento protocol read.
      // Mento's yield comes from holding cUSD — the exact rate is not queryable
      // via a single contract call without multi-step BiPoolManager reads.
      results.push({
        protocol:  'Mento',
        chain:     'celo',
        token:     'cUSD',
        apy:       4.50,
        tvlNote:   "Celo's native stablecoin protocol.",
        isEstimate: true,
      });
    }
  }

  if (results.length === 0) {
    return {
      error:   true,
      message: `No yield rates available for ${chain ?? 'any chain'} right now. Try again in a moment.`,
    };
  }

  // Best rate first
  results.sort((a, b) => b.apy - a.apy);

  return {
    rates:             results,
    topRecommendation: results[0],
    note: results.some(r => r.isEstimate)
      ? 'Mento rate is estimated. Aave rates are live from the blockchain.'
      : 'All rates are live from the blockchain.',
    cachedUntil: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
  };
}