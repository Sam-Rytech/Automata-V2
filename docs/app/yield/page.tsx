import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = { title: 'Earn & Yield' }

export default function YieldPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>09 ——</p>
      <h1>Earn & Yield</h1>
      <p>
        Automata integrates three yield systems: direct Aave V3 on-chain APY reads, the LI.FI Earn
        API for multi-protocol vault discovery, and an x402-gated yield data server for premium data
        accessed via autonomous agent micropayments.
      </p>

      <h2>Aave V3 — On-Chain APY Reads</h2>
      <p>
        For Base and Ethereum, Automata reads yield rates directly from the Aave V3 Pool contract
        on-chain using viem. This gives real-time APY with no API dependency.
      </p>

      <h3>getReserveData</h3>
      <CodeBlock language="typescript" filename="backend/src/services/yieldService.ts">
{`const AAVE_POOL_ABI = parseAbi([
  'function getReserveData(address asset) view returns (' +
    'uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, ...)'
])

// Mainnet pool addresses
const AAVE_POOLS = {
  base:     { poolAddress: '0xA238Dd80C259a72e81d7e4664a9801593F98d1c5', usdcAddress: '0x8335...', chain: base },
  ethereum: { poolAddress: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', usdcAddress: '0xA0b8...', chain: mainnet },
}`}
      </CodeBlock>

      <h3>Ray-to-APY conversion</h3>
      <p>
        Aave rates are expressed in &quot;ray&quot; — a unit where <code>1 ray = 1e27</code>. The{' '}
        <code>currentLiquidityRate</code> field from <code>getReserveData</code> is the per-second
        supply rate in ray.
      </p>
      <CodeBlock language="typescript">
{`function rayToAPY(ray: bigint): number {
  const rateDecimal = Number(ray) / 1e27   // convert from ray to decimal
  return parseFloat((rateDecimal * 100).toFixed(2))
  // e.g. ray = 5e25 → 0.05 → 5.00% APY
  // Note: this is a simplified APY — true compound APY = (1 + rate/SECONDS_PER_YEAR)^SECONDS_PER_YEAR - 1
}`}
      </CodeBlock>

      <h3>Cache</h3>
      <p>
        Aave APY reads are cached for <strong>5 minutes</strong> to avoid hammering the RPC. Cache
        is stored in an in-memory <code>Map&lt;string, CacheEntry&gt;</code> where the key is{' '}
        <code>aave_{'{chain}'}</code>.
      </p>

      <h2>LI.FI Earn API — Multi-Protocol Vault Discovery</h2>
      <p>
        The LI.FI Earn service exposes aggregated yield vaults across many protocols and chains.
        Automata uses a dual-API architecture:
      </p>
      <table>
        <thead><tr><th>Service</th><th>Base URL</th><th>Auth Required</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td>Earn Data API</td><td><code>https://earn.li.fi</code></td><td>No</td><td>Vault discovery, APY rates, portfolio positions</td></tr>
          <tr><td>Composer API</td><td><code>https://li.quest</code></td><td>x-lifi-integrator header</td><td>Deposit transaction quotes</td></tr>
        </tbody>
      </table>

      <h3>getYieldOpportunities</h3>
      <CodeBlock language="typescript">
{`// GET earn.li.fi/v1/earn/vaults?chainId={id}
export async function getYieldOpportunities(
  chain?: string, token?: string, protocol?: string
): Promise<any[]> {
  const opportunities = data.data ?? []

  return opportunities
    .filter((v: any) => v.isTransactional)  // only vaults with actionable deposit txs
    .sort((a: any, b: any) => {
      const apyA = a.analytics?.apy?.total ?? 0
      const apyB = b.analytics?.apy?.total ?? 0
      return apyB - apyA  // highest APY first
    })
}`}
      </CodeBlock>

      <h3>formatOpportunitiesForAgent</h3>
      <p>
        Raw vault data from LI.FI contains contract addresses, token IDs, and raw numbers. This
        function formats the top 5 into a string the agent presents to the user in plain English,
        while also embedding the vault slug as the <code>opportunityId</code> for{' '}
        <code>build_stake_tx</code>:
      </p>
      <CodeBlock language="typescript">
{`// Output example for one vault:
// "1. [ID: 8453-0xbeef...] Aave V3 on Base — USDC — 4.20% per year — $2.1B TVL"

return opportunities.slice(0, 5).map((op, i) => {
  const apy  = (op.analytics?.apy?.total ?? 0).toFixed(2)
  const tvl  = \`$\${(Number(op.analytics?.tvl?.usd) / 1_000_000).toFixed(1)}M TVL\`
  const proto = op.protocol?.name ?? 'Unknown protocol'
  const token = op.underlyingTokens?.[0]?.symbol ?? 'Unknown token'
  return \`\${i+1}. [ID: \${op.slug}] \${proto} on \${op.network} — \${token} — \${apy}% per year — \${tvl}\`
}).join('\\n')`}
      </CodeBlock>

      <h3>buildEarnDepositTx</h3>
      <p>
        After the user confirms a vault choice, the agent calls <code>build_stake_tx</code> which
        routes to this function. It:
      </p>
      <ol>
        <li>Parses the vault <code>opportunityId</code> (format: <code>chainId-vaultAddress</code>)</li>
        <li>Fetches vault details from <code>earn.li.fi/v1/earn/vaults</code></li>
        <li>Gets the underlying token address for the vault</li>
        <li>Calls <code>li.quest/v1/quote</code> with the Composer API to get the transaction</li>
        <li>Returns approval tx (if needed) + deposit tx with a 55-second expiry</li>
      </ol>
      <CodeBlock language="typescript">
{`export async function buildEarnDepositTx(
  opportunityId: string,
  walletAddress:  string,
  amountHuman:    number,
  tokenDecimals:  number
): Promise<{ approvalTx: any; depositTx: any; expiresAt: number }> {

  const parts        = opportunityId.split('-')
  const chainIdStr   = parts[0]
  const vaultAddress = parts.slice(1).join('-')

  const vaultsData = await earnFetch(\`/v1/earn/vaults?chainId=\${chainIdStr}\`)
  const vault      = vaultsData.data.find((v: any) =>
    v.address.toLowerCase() === vaultAddress.toLowerCase()
  )

  const fromToken   = vault.underlyingTokens[0].address
  const amountSmall = BigInt(Math.round(amountHuman * (10 ** tokenDecimals))).toString()

  const quoteParams = new URLSearchParams({
    fromChain: chainIdStr, toChain: chainIdStr,
    fromToken, toToken: vault.address,
    fromAddress: walletAddress, toAddress: walletAddress,
    fromAmount: amountSmall,
  })

  const data = await composerFetch(\`/v1/quote?\${quoteParams}\`)

  return {
    approvalTx: data.estimate?.approvalAddress ? buildApprovalTx(...) : null,
    depositTx:  data.transactionRequest ?? null,
    expiresAt:  Date.now() + 55_000,  // 55-second quote TTL (quotes expire in ~60s)
  }
}`}
      </CodeBlock>

      <h3>Quote Expiry</h3>
      <p>
        LI.FI deposit quotes expire in approximately 60 seconds. The system uses a 55-second TTL
        (<code>QUOTE_TTL_MS = 55_000</code>) as a safety buffer. The agent is instructed:
      </p>
      <blockquote>
        &quot;If the user takes more than 60 seconds to confirm after you call build_stake_tx, call it
        again to get a fresh quote before they sign. Tell the user: &apos;I&apos;ve refreshed the quote to
        make sure the rate is still current.&apos;&quot;
      </blockquote>

      <h2>Supported Yield Protocols</h2>
      <table>
        <thead><tr><th>Protocol</th><th>Chain</th><th>Data Source</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>Aave V3</td><td>Base</td><td>On-chain (Pool.getReserveData)</td><td>Live</td></tr>
          <tr><td>Aave V3</td><td>Ethereum</td><td>On-chain (Pool.getReserveData)</td><td>Live</td></tr>
          <tr><td>LI.FI Earn vaults</td><td>Any LI.FI chain</td><td>earn.li.fi API</td><td>Live (discovery) / Deposit tx via Composer</td></tr>
          <tr><td>Mento</td><td>Celo</td><td>Estimated (stub)</td><td>Rate estimated at 4.5% — real calldata is TODO</td></tr>
        </tbody>
      </table>

      <h2>x402 — Autonomous Agent Micropayments for Premium Data</h2>
      <p>
        The <code>x402-yield-server</code> is a microservice that demonstrates AI agent autonomous
        payment capability. Premium yield data at <code>GET /api/yield</code> requires a payment
        header.
      </p>
      <p>
        The agent is pre-authorized in the system prompt to spend up to 0.001 USDC per query on
        Stellar to access this endpoint. When it does so, it mentions it naturally in the response.
      </p>
      <p>For the full x402 protocol documentation, see the <a href="/x402">x402 Protocol</a> page.</p>
    </div>
  )
}
