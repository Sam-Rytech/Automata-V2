// backend/src/services/yieldService.ts
// Phase 2 — LI.FI Earn API integration + existing Aave V3 APY reads

import { createPublicClient, http, parseAbi } from 'viem'
import { base, baseSepolia, mainnet, sepolia } from 'viem/chains'

const IS_MAINNET = process.env.NODE_ENV === 'production'
const LIFI_INTEGRATOR_ID = process.env.LIFI_INTEGRATOR_ID ?? ''
const LIFI_BASE_URL = 'https://li.fi/v1'

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
// LI.FI Earn API — shared fetch helper
// ---------------------------------------------------------------------------

async function lifiFetch(
  path: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${LIFI_BASE_URL}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-lifi-integrator': LIFI_INTEGRATOR_ID,
      ...(options.headers ?? {}),
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`LI.FI API error ${res.status}: ${body}`)
  }

  return res.json()
}

// ---------------------------------------------------------------------------
// getYieldOpportunities — GET /v1/opportunities
// ---------------------------------------------------------------------------

export async function getYieldOpportunities(
  chain?: string,
  token?: string,
  protocol?: string
): Promise<any[]> {
  const params = new URLSearchParams()
  if (chain) params.set('chain', chain)
  if (token) params.set('token', token)
  if (protocol) params.set('protocol', protocol)

  const query = params.toString() ? `?${params.toString()}` : ''
  const data = await lifiFetch(`/opportunities${query}`)

  const opportunities: any[] = data.opportunities ?? data ?? []

  // Sort by APY descending
  return opportunities.sort((a, b) => {
    const apyA = parseFloat(a.apy ?? a.apyBase ?? '0')
    const apyB = parseFloat(b.apy ?? b.apyBase ?? '0')
    return apyB - apyA
  })
}

// ---------------------------------------------------------------------------
// buildEarnDepositTx — POST /v1/quote
// Quotes expire in ~60s. We stamp expiresAt and refuse stale quotes.
// ---------------------------------------------------------------------------

export async function buildEarnDepositTx(
  opportunityId: string,
  walletAddress: string,
  amountHuman: number,
  tokenDecimals: number
): Promise<{ approvalTx: any; depositTx: any; expiresAt: number }> {
  // Convert human-readable amount to smallest unit
  // USDC = 6 decimals, ETH = 18 — never hardcode 18 for USDC
  const amountSmallest = BigInt(
    Math.round(amountHuman * 10 ** tokenDecimals)
  ).toString()

  const body = {
    opportunityId,
    walletAddress,
    amount: amountSmallest,
  }

  const data = await lifiFetch('/quote', {
    method: 'POST',
    body: JSON.stringify(body),
  })

  // Quotes expire in ~60s — stamp our own deadline 55s from now as a safety margin
  const expiresAt = Date.now() + QUOTE_TTL_MS

  return {
    approvalTx: data.approvalTx ?? null,
    depositTx: data.depositTx ?? data.transactionRequest ?? null,
    expiresAt,
  }
}

// ---------------------------------------------------------------------------
// getEarnPositions — GET /v1/positions
// ---------------------------------------------------------------------------

export async function getEarnPositions(walletAddress: string): Promise<any[]> {
  const data = await lifiFetch(
    `/positions?walletAddress=${encodeURIComponent(walletAddress)}`
  )
  return data.positions ?? data ?? []
}

// ---------------------------------------------------------------------------
// formatOpportunitiesForAgent — top 5 as a clean agent-readable string
// ---------------------------------------------------------------------------

export function formatOpportunitiesForAgent(opportunities: any[]): string {
  if (!opportunities || opportunities.length === 0) {
    return 'No yield opportunities found for the requested criteria.'
  }

  const top5 = opportunities.slice(0, 5)

  return top5
    .map((op, i) => {
      const apy = parseFloat(op.apy ?? op.apyBase ?? '0').toFixed(2)
      const tvl = op.tvlUsd
        ? `$${(Number(op.tvlUsd) / 1_000_000).toFixed(1)}M TVL`
        : 'TVL unknown'
      const proto = op.protocol?.name ?? op.protocol ?? 'Unknown protocol'
      const chain = op.chain?.name ?? op.chainId ?? 'Unknown chain'
      const token = op.token?.symbol ?? op.symbol ?? 'Unknown token'

      return `${i + 1}. ${proto} on ${chain} — ${token} — ${apy}% per year — ${tvl}`
    })
    .join('\n')
}
