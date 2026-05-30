import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = { title: 'Swaps & Routing' }

export default function SwapsPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>08 ——</p>
      <h1>Swaps & Routing</h1>
      <p>
        Automata uses two swap mechanisms: <strong>LI.FI SDK</strong> for EVM cross-chain swaps and
        bridges, and the <strong>Stellar DEX path payment</strong> for on-Stellar token swaps. The
        agent selects between them based on the source chain.
      </p>

      <h2>LI.FI SDK (EVM)</h2>
      <p>
        LI.FI aggregates 14+ bridges and 34+ DEXs across 60+ chains into a single SDK call. Automata
        uses it for all non-USDC token movements on EVM chains (CCTP V2 handles USDC).
      </p>

      <h3>Route Fetching</h3>
      <p>
        The <code>routeService.ts</code> wraps the LI.FI SDK <code>getRoutes()</code> call and caches
        the result for 2 minutes. The cache key is the combination of all route parameters.
      </p>
      <CodeBlock language="typescript" filename="backend/src/services/routeService.ts">
{`import { getRoutes, ChainId, CoinKey } from '@lifi/sdk'

const routeCache = new Map<string, { route: any; expiresAt: number }>()
const CACHE_TTL_MS = 2 * 60 * 1000  // 2 minutes

export async function getRoute(args: {
  fromChain: string; toChain: string;
  fromToken: string; toToken: string;
  amount: string;    walletAddress: string;
}): Promise<any> {

  const cacheKey = JSON.stringify(args)
  const cached = routeCache.get(cacheKey)
  if (cached && Date.now() < cached.expiresAt) return cached.route

  const { fromChain, toChain, fromToken, toToken, amount, walletAddress } = args

  // Map chain names to LI.FI chain IDs
  const CHAIN_ID: Record<string, number> = { base: 8453, celo: 42220, ethereum: 1 }

  const routesResult = await getRoutes({
    fromChainId:    CHAIN_ID[fromChain],
    toChainId:      CHAIN_ID[toChain],
    fromTokenAddress: TOKEN_ADDRESSES[fromChain]?.[fromToken],
    toTokenAddress:   TOKEN_ADDRESSES[toChain]?.[toToken],
    fromAmount:     (parseFloat(amount) * 1e6).toString(),  // USDC: 6 decimals
    fromAddress:    walletAddress,
  })

  const best = routesResult.routes[0]
  if (!best) throw new Error('No route found')

  const routeId = \`\${fromChain}-\${toChain}-\${Date.now()}\`
  routeCache.set(cacheKey, { route: { ...best, routeId }, expiresAt: Date.now() + CACHE_TTL_MS })

  return { ...best, routeId }
}

export function getCachedRoute(routeId: string): any | null {
  for (const entry of routeCache.values()) {
    if (entry.route?.routeId === routeId && Date.now() < entry.expiresAt) {
      return entry.route
    }
  }
  return null
}`}
      </CodeBlock>

      <h3>Swap Transaction Building</h3>
      <p>
        Once the agent has a <code>routeId</code> from <code>get_route</code>, it calls{' '}
        <code>build_swap_tx</code>. The service retrieves the cached route and calls{' '}
        <code>getStepTransaction(step)</code> to fetch the live transaction request from LI.FI:
      </p>
      <CodeBlock language="typescript" filename="backend/src/services/swapService.ts">
{`import { getStepTransaction } from '@lifi/sdk'
import { getCachedRoute } from './routeService.js'

export async function buildSwapTx(params: any): Promise<any> {
  // ── EVM swap via LI.FI ──────────────────────────────────────────────────
  const route = getCachedRoute(params.routeId)
  if (!route) {
    return { error: 'Route not found in cache or expired. Please generate a new route first.' }
  }

  const step    = route.steps[0]
  const stepTx  = await getStepTransaction(step)
  const txRequest = stepTx.transactionRequest

  const chainIdToName: Record<number, string> = { 8453: 'base', 42220: 'celo', 1: 'ethereum' }

  return {
    description: \`Swap via LI.FI route \${params.routeId.slice(0, 6)}...\`,
    unsignedTx: {
      to:       txRequest.to,
      data:     txRequest.data,
      value:    txRequest.value?.toString() || '0',
      chainId:  chainIdToName[Number(txRequest.chainId)] || 'unknown',
      description: \`Swap \${params.fromToken} → \${params.toToken}\`,
    },
  }
}`}
      </CodeBlock>

      <h2>Stellar DEX — Path Payments</h2>
      <p>
        On Stellar, swaps use <code>pathPaymentStrictSend</code> — a Stellar-native operation that
        routes through the order book. Empty <code>path</code> means Horizon automatically finds the
        best route.
      </p>

      <h3>XLM → USDC example</h3>
      <CodeBlock language="typescript" filename="backend/src/services/swapService.ts">
{`// Detected when params.fromChain === 'stellar'
if (params.fromChain === 'stellar') {
  const { fromAddress, fromToken, toToken, amount, minDestAmount } = params

  const xdr = await buildStellarPathPayment(
    fromAddress,   // sender == destination (self-swap)
    fromAddress,
    fromToken,     // e.g. "XLM"
    amount,        // e.g. "100"
    toToken,       // e.g. "USDC"
    minDestAmount || '0.0000001',  // slippage: agent sets this to 90% of expected output
    []             // empty path = Horizon auto-routes
  )

  return {
    description: \`Swap \${amount} \${fromToken} to \${toToken} on Stellar DEX\`,
    unsignedTx: {
      chainId: 'stellar',
      xdr,              // unsigned XDR — user signs this with their Stellar wallet
      to: fromAddress,
      data: '0x',
      value: '0',
    },
  }
}`}
      </CodeBlock>

      <h3>Slippage handling</h3>
      <p>
        The agent system prompt dictates how slippage is handled — it never asks the user for
        a tolerance. Instead:
      </p>
      <ol>
        <li>Call <code>get_route</code> to get the expected output amount.</li>
        <li>Set <code>minDestAmount = expectedOutput × 0.9</code> (10% slippage tolerance).</li>
        <li>Present the expected output to the user as &quot;you will receive approximately X&quot;.</li>
        <li>Never use the words &quot;slippage&quot; or &quot;minimum guaranteed&quot; in the UI.</li>
      </ol>

      <h2>When Each Mechanism Is Used</h2>
      <table>
        <thead><tr><th>Scenario</th><th>Mechanism</th></tr></thead>
        <tbody>
          <tr><td>USDC from Base → Celo</td><td>Circle CCTP V2 (build_bridge_tx)</td></tr>
          <tr><td>USDC from Base → Ethereum</td><td>Circle CCTP V2 (build_bridge_tx)</td></tr>
          <tr><td>ETH → USDC on Base</td><td>LI.FI (get_route → build_swap_tx)</td></tr>
          <tr><td>USDC → cKES on Celo</td><td>LI.FI (Mento route)</td></tr>
          <tr><td>XLM → USDC on Stellar</td><td>Stellar DEX path payment (build_swap_tx, fromChain=stellar)</td></tr>
          <tr><td>USDC → XLM on Stellar</td><td>Stellar DEX path payment</td></tr>
          <tr><td>USDC from Base → Stellar</td><td>⚠️ Deferred — CCTP Stellar not yet live</td></tr>
          <tr><td>Any token (any EVM → any EVM)</td><td>LI.FI (fallback when CCTP not applicable)</td></tr>
        </tbody>
      </table>
    </div>
  )
}
