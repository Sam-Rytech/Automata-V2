// backend/src/services/yieldService.ts
// Phase 2 — LI.FI Earn API integration + existing Aave V3 APY reads

import { createPublicClient, http, parseAbi } from 'viem'
import { base, baseSepolia, mainnet, sepolia } from 'viem/chains'

const IS_MAINNET = process.env.NODE_ENV === 'production'
const LIFI_INTEGRATOR_ID = process.env.LIFI_INTEGRATOR_ID ?? ''
const LIFI_BASE_URL = 'https://li.quest/v1'

// ---------------------------------------------------------------------------
// In-memory cache — 5 minutes TTL for yield rates
// Quote cache uses 55-second TTL (quotes expire in ~60s)
// ---------------------------------------------------------------------------

type CacheEntry = { data: any; expiresAt: number }
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000
const QUOTE_TTL_MS = 55 * 1000

function getCached(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

function setCache(key: string, data: any, ttl = CACHE_TTL_MS): void {
  cache.set(key, { data, expiresAt: Date.now() + ttl })
}

// ---------------------------------------------------------------------------
// Aave V3 Pool ABI
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
])

const AAVE_POOLS: Record<
  string,
  { poolAddress: `0x${string}`; usdcAddress: `0x${string}`; chain: any }
> = IS_MAINNET
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
    }

function rayToAPY(ray: bigint): number {
  const rateDecimal = Number(ray) / 1e27
  return parseFloat((rateDecimal * 100).toFixed(2))
}

async function getAaveAPY(
  chainKey: string
): Promise<{
  protocol: string
  chain: string
  token: string
  apy: number
  tvlNote: string
} | null> {
  const cacheKey = `aave_${chainKey}`
  const cached = getCached(cacheKey)
  if (cached) return cached

  const config = AAVE_POOLS[chainKey]
  if (!config) return null

  try {
    const client = createPublicClient({
      chain: config.chain,
      transport: http(
        chainKey === 'base' ? process.env.BASE_RPC_URL : process.env.ETH_RPC_URL
      ),
    })

    const reserveData = (await client.readContract({
      address: config.poolAddress,
      abi: AAVE_POOL_ABI,
      functionName: 'getReserveData',
      args: [config.usdcAddress],
    })) as any

    const liquidityRate: bigint =
      (reserveData as any).currentLiquidityRate ??
      (reserveData as any)[2] ??
      BigInt(0)

    const apy = rayToAPY(liquidityRate)

    const result = {
      protocol: 'Aave V3',
      chain: chainKey,
      token: 'USDC',
      apy,
      tvlNote: 'Battle-tested. Largest DeFi lending protocol.',
    }

    setCache(cacheKey, result)
    return result
  } catch (err) {
    console.error(
      `[yieldService] Failed to read Aave APY for ${chainKey}:`,
      err
    )
    return null
  }
}

export async function getYieldRates(params: {
  chain?: string
  token?: string
}): Promise<any> {
  const chain = typeof params === 'object' ? params.chain : (params as any)

  const results: any[] = []

  const chainsToCheck =
    chain && chain !== 'all' ? [chain] : ['base', 'ethereum', 'celo']

  for (const c of chainsToCheck) {
    if (c === 'base' || c === 'ethereum') {
      const aaveData = await getAaveAPY(c)
      if (aaveData) results.push(aaveData)
    }

    if (c === 'celo') {
      results.push({
        protocol: 'Mento',
        chain: 'celo',
        token: 'cUSD',
        apy: 4.5,
        tvlNote: "Celo's native stablecoin protocol.",
        isEstimate: true,
      })
    }
  }

  if (results.length === 0) {
    return {
      error: true,
      message: `No yield rates available for ${chain ?? 'any chain'} right now. Try again in a moment.`,
    }
  }

  results.sort((a, b) => b.apy - a.apy)

  return {
    rates: results,
    topRecommendation: results[0],
    note: results.some((r) => r.isEstimate)
      ? 'Mento rate is estimated. Aave rates are live from the blockchain.'
      : 'All rates are live from the blockchain.',
    cachedUntil: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
  }
}

// ---------------------------------------------------------------------------
// LI.FI Earn API — Dual Service Architecture
// ---------------------------------------------------------------------------

const EARN_API = 'https://earn.li.fi';
const COMPOSER_API = 'https://li.quest';

// Service 1: Earn Data API (No auth required)
async function earnFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${EARN_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Accept': 'application/json', ...(options.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Earn API error ${res.status}: ${body}`);
  }
  return res.json();
}

// Service 2: Composer (API Key required)
async function composerFetch(path: string, options: RequestInit = {}): Promise<any> {
  const url = `${COMPOSER_API}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'x-lifi-integrator': LIFI_INTEGRATOR_ID,
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Composer API error ${res.status}: ${body}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// getYieldOpportunities — GET earn.li.fi/v1/earn/vaults
// ---------------------------------------------------------------------------
export async function getYieldOpportunities(chain?: string, token?: string, protocol?: string): Promise<any[]> {
  const params = new URLSearchParams();
  if (chain) {
    const chainId = chain.toLowerCase().includes('eth') ? '1' : '8453';
    params.set('chainId', chainId);
  }
  
  const query = params.toString() ? `?${params.toString()}` : '';
  const data = await earnFetch(`/v1/earn/vaults${query}`);
  
  const opportunities = data.data ?? [];
  
  // Sort by APY descending and only return transactional vaults
  return opportunities
    .filter((v: any) => v.isTransactional)
    .sort((a: any, b: any) => {
      const apyA = a.analytics?.apy?.total ?? 0;
      const apyB = b.analytics?.apy?.total ?? 0;
      return apyB - apyA;
    });
}

// ---------------------------------------------------------------------------
// buildEarnDepositTx — GET li.quest/v1/quote
// ---------------------------------------------------------------------------
export async function buildEarnDepositTx(
  opportunityId: string, 
  walletAddress: string, 
  amountHuman: number, 
  tokenDecimals: number
): Promise<{ approvalTx: any; depositTx: any; expiresAt: number }> {
  
  // opportunityId is the vault slug (e.g. "8453-0xbeef...")
  const parts = opportunityId.split('-');
  const chainIdStr = parts[0];
  const vaultAddress = parts.slice(1).join('-');
  
  // Fetch vault details to get the underlying token required for the quote
  const vaultsData = await earnFetch(`/v1/earn/vaults?chainId=${chainIdStr}`);
  const vault = (vaultsData.data ?? []).find((v: any) => v.address.toLowerCase() === vaultAddress.toLowerCase());
  
  if (!vault) throw new Error(`Vault ${opportunityId} not found`);
  
  const fromToken = vault.underlyingTokens?.[0]?.address;
  if (!fromToken) throw new Error('No underlying token found for vault');

  const amountSmallest = BigInt(Math.round(amountHuman * (10 ** tokenDecimals))).toString();

  // GET request to Composer
  const quoteParams = new URLSearchParams({
    fromChain: chainIdStr,
    toChain: chainIdStr,
    fromToken: fromToken,
    toToken: vault.address,
    fromAddress: walletAddress,
    toAddress: walletAddress,
    fromAmount: amountSmallest
  });

  const data = await composerFetch(`/v1/quote?${quoteParams.toString()}`);
  
  // Build raw approval tx if LI.FI indicates allowance is needed
  let approvalTx = null;
  if (data.estimate?.approvalAddress) {
    approvalTx = {
      to: fromToken,
      data: '0x095ea7b3' + data.estimate.approvalAddress.replace('0x', '').padStart(64, '0') + BigInt(amountSmallest).toString(16).padStart(64, '0')
    };
  }

  return {
    approvalTx,
    depositTx: data.transactionRequest ?? null,
    expiresAt: Date.now() + QUOTE_TTL_MS,
  };
}

// ---------------------------------------------------------------------------
// getEarnPositions — GET earn.li.fi/v1/earn/portfolio
// ---------------------------------------------------------------------------
export async function getEarnPositions(walletAddress: string): Promise<any[]> {
  try {
    const data = await earnFetch(`/v1/earn/portfolio/${walletAddress}/positions`);
    return data.positions ?? [];
  } catch (e: any) {
    console.error('Failed to fetch positions:', e.message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// formatOpportunitiesForAgent
// ---------------------------------------------------------------------------
export function formatOpportunitiesForAgent(opportunities: any[]): string {
  if (!opportunities || opportunities.length === 0) {
    return 'No yield opportunities found for the requested criteria.';
  }

  return opportunities.slice(0, 5).map((op: any, i: number) => {
    const apy = (op.analytics?.apy?.total ?? 0).toFixed(2);
    const tvlUsd = op.analytics?.tvl?.usd;
    const tvl = tvlUsd ? `$${(Number(tvlUsd) / 1000000).toFixed(1)}M TVL` : 'Unknown TVL';
    const proto = op.protocol?.name ?? 'Unknown protocol';
    const network = op.network ?? 'Unknown network';
    const token = op.underlyingTokens?.[0]?.symbol ?? 'Unknown token';
    
    // We pass the API's native "slug" as the opportunityId
    return `${i + 1}. [ID: ${op.slug}] ${proto} on ${network} — ${token} — ${apy}% per year — ${tvl}`;
  }).join('\n');
}
