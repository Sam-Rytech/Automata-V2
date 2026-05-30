import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = { title: 'Supported Chains' }

export default function ChainsPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>07 ——</p>
      <h1>Supported Chains</h1>
      <p>
        Phase 1 of Automata supports four chains: Base, Celo, Ethereum, and Stellar. All four have
        native USDC via Circle CCTP V2. The EVM chains (Base, Celo, Ethereum) use the same address
        format and are interoperable via viem. Stellar is a separate adapter.
      </p>

      <h2>Base</h2>
      <table>
        <thead><tr><th>Property</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Chain ID</td><td>8453</td></tr>
          <tr><td>USDC</td><td><code>0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</code></td></tr>
          <tr><td>CCTP Domain</td><td>6</td></tr>
          <tr><td>Default RPC</td><td><code>https://mainnet.base.org</code></td></tr>
          <tr><td>Aave V3 Pool</td><td><code>0xA238Dd80C259a72e81d7e4664a9801593F98d1c5</code> (mainnet)</td></tr>
          <tr><td>Aave V3 Pool</td><td><code>0x07eA79F68B2B3df564D0A34F8e19D9B1e339814b</code> (Sepolia)</td></tr>
        </tbody>
      </table>
      <p>
        Base is Coinbase&apos;s L2 — fast finality, very low fees, and the primary chain for Automata
        development. Most LI.FI routes originate or terminate on Base due to its deep USDC liquidity.
      </p>

      <h2>Celo</h2>
      <table>
        <thead><tr><th>Property</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Chain ID</td><td>42220</td></tr>
          <tr><td>USDC</td><td><code>0xcebA9300f2b948710d2653dD7B07f33A8B32118C</code></td></tr>
          <tr><td>CCTP Domain</td><td>7</td></tr>
          <tr><td>Default RPC</td><td><code>https://forno.celo.org</code></td></tr>
          <tr><td>cUSD</td><td>Native Celo stablecoin (swappable via Mento)</td></tr>
          <tr><td>cKES</td><td>Kenya shilling stablecoin (Mento)</td></tr>
        </tbody>
      </table>
      <p>
        Celo is mobile-first and Africa-native. The primary additional integration here is{' '}
        <strong>MiniPay</strong> — a mobile stablecoin wallet embedded in Opera Mini with 4M+ users
        in Sub-Saharan Africa. The <code>MiniPayProvider.tsx</code> component wires Celo wallet
        injection for Mini App environments.
      </p>
      <p>
        Celo staking via Mento (<code>swapIn()</code>) is implemented as a stub. Real calldata
        generation is a Phase 5 item.
      </p>

      <h2>Ethereum</h2>
      <table>
        <thead><tr><th>Property</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Chain ID</td><td>1</td></tr>
          <tr><td>USDC</td><td><code>0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48</code></td></tr>
          <tr><td>CCTP Domain</td><td>0</td></tr>
          <tr><td>Default RPC</td><td><code>https://eth.llamarpc.com</code></td></tr>
          <tr><td>Aave V3 Pool</td><td><code>0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2</code> (mainnet)</td></tr>
          <tr><td>Aave V3 Pool</td><td><code>0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951</code> (Sepolia)</td></tr>
        </tbody>
      </table>
      <p>
        Ethereum is the settlement layer — highest security, highest fees. Used as a source or
        destination for large USDC movements and as the primary LI.FI routing hub for the largest
        DEX ecosystem.
      </p>

      <h2>Stellar</h2>
      <table>
        <thead><tr><th>Property</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Network</td><td>mainnet / testnet</td></tr>
          <tr><td>USDC Issuer</td><td><code>GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN</code></td></tr>
          <tr><td>Horizon URL</td><td><code>https://horizon.stellar.org</code></td></tr>
          <tr><td>CCTP Domain</td><td>27 (assigned, not yet live)</td></tr>
          <tr><td>Native token</td><td>XLM (Lumens)</td></tr>
        </tbody>
      </table>
      <p>
        Stellar is a non-EVM chain built for payments. Unlike Base/Celo/Ethereum, Stellar uses a
        different account model, address format (G... prefix), and transaction format (XDR). The
        Automata backend has a dedicated <code>stellar.ts</code> adapter.
      </p>

      <h3>Stellar-specific capabilities in Automata</h3>
      <ul>
        <li>
          <strong>Balance reads:</strong> XLM and USDC balances via Horizon{' '}
          <code>loadAccount(publicKey)</code>
        </li>
        <li>
          <strong>USDC transfers:</strong> Stellar payment operation with Circle USDC asset
          (<code>asset_code: &quot;USDC&quot;</code>, <code>asset_issuer: GA5Z...</code>)
        </li>
        <li>
          <strong>XLM transfers:</strong> Stellar native asset (<code>Asset.native()</code>)
        </li>
        <li>
          <strong>DEX swaps (path payments):</strong> <code>pathPaymentStrictSend</code> operation
          routing through the Stellar DEX. e.g. XLM → USDC. Slippage is handled by setting
          <code>destMin</code> to 90% of expected output.
        </li>
      </ul>

      <CodeBlock language="typescript" filename="backend/src/adapters/stellar.ts">
{`export const STELLAR_USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'

export async function buildStellarPathPayment(
  fromPublicKey: string,
  toPublicKey:   string,
  sendAssetCode: string,
  sendAmount:    string,
  destAssetCode: string,
  destMin:       string,   // minimum destination amount (slippage protection)
  path:          any[]     // empty = Horizon auto-routes
): Promise<string> {        // returns unsigned XDR envelope

  const server = new StellarSdk.Horizon.Server(STELLAR_HORIZON_URL)
  const sourceAccount = await server.loadAccount(fromPublicKey)

  const sendAsset = sendAssetCode === 'XLM'
    ? StellarSdk.Asset.native()
    : new StellarSdk.Asset(sendAssetCode, STELLAR_USDC_ISSUER)

  const destAsset = destAssetCode === 'XLM'
    ? StellarSdk.Asset.native()
    : new StellarSdk.Asset(destAssetCode, STELLAR_USDC_ISSUER)

  const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.PUBLIC,
  })
    .addOperation(StellarSdk.Operation.pathPaymentStrictSend({
      sendAsset, sendAmount, destination: toPublicKey,
      destAsset, destMin, path,
    }))
    .setTimeout(30)
    .build()

  return tx.toXDR()  // unsigned XDR — signed by user's Stellar wallet in the frontend
}`}
      </CodeBlock>

      <h3>Trustlines</h3>
      <p>
        Stellar accounts must explicitly opt into each asset they want to hold by establishing a
        trustline. If a recipient does not have a USDC trustline, the payment will fail. The agent
        is instructed to inform the user in this case:
      </p>
      <CodeBlock language="text">
{`"The recipient needs to add a USDC trustline on Stellar first.
They can do this in any Stellar wallet app (e.g. Lobstr, StellarX)."`}
      </CodeBlock>

      <h3>Signing Stellar transactions in the frontend</h3>
      <p>
        Stellar transactions are signed differently from EVM transactions. The frontend uses Stellar
        Wallets Kit for Stellar signing, then submits via Horizon:
      </p>
      <CodeBlock language="typescript" filename="frontend/app/hooks/useTransactionExecutor.ts">
{`if (tx.chainId === 'stellar') {
  // tx.xdr contains the unsigned XDR transaction envelope
  const signedXdr = await stellarContext.signTransaction(tx.xdr)

  const { Horizon, Transaction, Networks } = await import('@stellar/stellar-sdk')
  const server = new Horizon.Server('https://horizon.stellar.org')
  const horizonResult = await server.submitTransaction(
    new Transaction(signedXdr, Networks.PUBLIC)
  )
  lastTxHash = horizonResult.hash
}`}
      </CodeBlock>

      <h2>viem Public Clients</h2>
      <p>
        All three EVM chains have dedicated viem public clients in{' '}
        <code>backend/src/utils/rpc.ts</code>:
      </p>
      <CodeBlock language="typescript" filename="backend/src/utils/rpc.ts">
{`import { createPublicClient, http } from 'viem'
import { base, celo, mainnet } from 'viem/chains'

export const baseClient = createPublicClient({
  chain: base,
  transport: http(process.env.BASE_RPC_URL),
})

export const celoClient = createPublicClient({
  chain: celo,
  transport: http(process.env.CELO_RPC_URL),
})

export const ethClient = createPublicClient({
  chain: mainnet,
  transport: http(process.env.ETH_RPC_URL),
})`}
      </CodeBlock>
    </div>
  )
}
