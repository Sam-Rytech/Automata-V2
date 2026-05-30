import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = {
  title: 'Frontend',
  description: 'Design tokens, Privy config, OAuth fix, useTransactionExecutor hook, and the lib/api.ts client.',
  openGraph: {
    title: 'Frontend — Automata Docs',
    description: 'Design tokens, Privy config, OAuth fix, useTransactionExecutor hook, and the lib/api.ts client.',
  },
}

export default function FrontendPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>10 ——</p>
      <h1>Frontend</h1>
      <p>
        The Automata frontend is a Next.js 15 App Router application. It handles wallet connection
        (Privy), chain switching, EVM and Stellar transaction signing, conversation state, and
        the visual flow builder canvas.
      </p>

      <h2>Pages</h2>
      <table>
        <thead><tr><th>Route</th><th>File</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td>/</td><td>app/page.tsx</td><td>Marketing landing page with hero orb, chain nodes, mockup sections</td></tr>
          <tr><td>/chat</td><td>app/chat/page.tsx</td><td>AI chat interface — sidebar + message thread + input bar</td></tr>
          <tr><td>/build</td><td>app/build/page.tsx</td><td>Visual Flow Builder — palette | React Flow canvas | config panel</td></tr>
          <tr><td>/history</td><td>app/history/page.tsx</td><td>Transaction history with filter tabs</td></tr>
          <tr><td>/settings</td><td>app/settings/page.tsx</td><td>Gemini API key, execution mode, wallet info</td></tr>
        </tbody>
      </table>

      <h2>Design System</h2>
      <table>
        <thead><tr><th>Token</th><th>Value</th><th>Usage</th></tr></thead>
        <tbody>
          <tr><td>--bg-primary</td><td>#0F0F1A</td><td>Page background</td></tr>
          <tr><td>--bg-card</td><td>#1A1A2E</td><td>Cards, panels, modals</td></tr>
          <tr><td>--accent-pink</td><td>#E91E8C</td><td>Primary CTAs, active states</td></tr>
          <tr><td>--accent-purple</td><td>#6A0DAD</td><td>Secondary accent, borders</td></tr>
          <tr><td>--text-muted</td><td>#888888</td><td>Labels, placeholders</td></tr>
          <tr><td>--success</td><td>#22C55E</td><td>Confirmed tx, success states</td></tr>
          <tr><td>--warning</td><td>#F59E0B</td><td>Fee warnings, caution</td></tr>
          <tr><td>--error</td><td>#EF4444</td><td>Failed tx, errors</td></tr>
        </tbody>
      </table>
      <p>
        <strong>Fonts:</strong> Syne (headings, bold, tight tracking) + IBM Plex Mono (all body
        text, addresses, UI copy). Never Inter, Roboto, or system fonts.
      </p>
      <p>
        <strong>Button rule:</strong> All buttons are sharp rectangles — never pill-shaped. Never
        gradient fills on buttons.
      </p>

      <h2>Wallet Integration (Privy)</h2>
      <p>
        Privy provides both embedded wallets (created on login via Google OAuth) and external wallet
        connectors (MetaMask, WalletConnect). The <code>Providers</code> component in{' '}
        <code>app/providers.tsx</code> wraps the entire app.
      </p>
      <CodeBlock language="typescript" filename="frontend/app/providers.tsx">
{`<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
  config={{
    loginMethods: ['email', 'google', 'wallet'],
    appearance: {
      theme: 'dark',
      accentColor: '#E91E8C',
    },
    embeddedWallets: {
      createOnLogin: 'all-users',  // auto-create EVM wallet on first login
    },
    supportedChains: [base, celo, mainnet],
  }}
>`}
      </CodeBlock>

      <h3>OAuth Redirect Persistence</h3>
      <p>
        Google OAuth causes a full page reload which destroys React state. To preserve the user&apos;s
        intended destination, a <code>postLoginRedirect</code> is stored in localStorage before the
        OAuth flow starts:
      </p>
      <CodeBlock language="typescript">
{`// In LandingNav / Hero / FinalCTA — before triggering login:
localStorage.setItem('postLoginRedirect', '/chat')  // or '/build'

// In app/providers.tsx — after login completes:
const redirect = localStorage.getItem('postLoginRedirect')
if (redirect) {
  localStorage.removeItem('postLoginRedirect')
  router.push(redirect)
}`}
      </CodeBlock>

      <h2>useTransactionExecutor</h2>
      <p>
        Located at <code>frontend/app/hooks/useTransactionExecutor.ts</code>. This hook handles the
        entire post-signing lifecycle: chain switching, EVM signing, Stellar signing, CCTP
        attestation, and database history logging.
      </p>

      <h3>Signature</h3>
      <CodeBlock language="typescript">
{`const { executeSequence } = useTransactionExecutor()

await executeSequence(
  txsToExecute,     // UnsignedTx[] from the agent response
  activeWallet,     // Privy wallet object
  stellarContext,   // { address: string|null, signTransaction: (xdr) => Promise<string> }
  sourceContext,    // { type: 'AGENT_EXECUTION'|'FLOW', stepCount: number }
  onBridgeRelayStarted  // optional callback when Stellar relay starts
)`}
      </CodeBlock>

      <h3>EVM Signing Path</h3>
      <CodeBlock language="typescript">
{`// Switch to the correct chain first
const targetChainId = CHAIN_IDS[tx.chainId]  // { base: 8453, celo: 42220, ethereum: 1 }
await activeWallet.switchChain(targetChainId)

// Send via Privy's Ethereum provider
const provider = await activeWallet.getEthereumProvider()
lastTxHash = await provider.request({
  method: 'eth_sendTransaction',
  params: [{ to: tx.to, data: tx.data, value: tx.value || '0x0', from: activeWallet.address }]
})`}
      </CodeBlock>

      <h3>Stellar Signing Path</h3>
      <CodeBlock language="typescript">
{`if (tx.chainId === 'stellar') {
  // stellarContext.signTransaction is provided by Stellar Wallets Kit
  const signedXdr = await stellarContext.signTransaction(tx.xdr)

  // Submit to Horizon
  const { Horizon, Transaction, Networks } = await import('@stellar/stellar-sdk')
  const server = new Horizon.Server('https://horizon.stellar.org')
  const result = await server.submitTransaction(new Transaction(signedXdr, Networks.PUBLIC))
  lastTxHash = result.hash
}`}
      </CodeBlock>

      <h3>CCTP Bridge Attestation (inside executeSequence)</h3>
      <p>
        After signing a burn tx, the executor automatically polls for attestation and presents the
        mint tx — the user never has to manually trigger the second step:
      </p>
      <CodeBlock language="typescript">
{`const meta = tx.bridgeMeta
if (meta?.destinationChain && meta.destinationChain !== 'stellar' && tx.txType === 'burn') {
  const attestRes = await fetch(\`\${BACKEND_URL}/api/bridge/attest\`, {
    method: 'POST',
    body: JSON.stringify({ burnTxHash: lastTxHash, sourceChain: meta.sourceChain,
      destinationChain: meta.destinationChain, recipientAddress: meta.recipientAddress,
      amount: meta.amount })
  })
  const { unsignedTx: mintTx } = await attestRes.json()

  await activeWallet.switchChain(CHAIN_IDS[meta.destinationChain])
  lastTxHash = await provider.request({ method: 'eth_sendTransaction',
    params: [{ to: mintTx.to, data: mintTx.data, value: '0x0', from: activeWallet.address }] })
}`}
      </CodeBlock>

      <h2>lib/api.ts — REST Client</h2>
      <p>
        All backend communication is centralised in <code>frontend/lib/api.ts</code>:
      </p>
      <table>
        <thead><tr><th>Function</th><th>Endpoint</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td>sendAgentMessage()</td><td>POST /api/chat</td><td>Send message to AI agent</td></tr>
          <tr><td>saveFlowToDb()</td><td>POST /api/flows</td><td>Persist a named flow</td></tr>
          <tr><td>getFlowsFromDb()</td><td>GET /api/flows/:wallet</td><td>Load saved flows</td></tr>
          <tr><td>saveHistoryToDb()</td><td>POST /api/history</td><td>Log tx to history</td></tr>
          <tr><td>getHistoryFromDb()</td><td>GET /api/history/:wallet</td><td>Load tx history</td></tr>
        </tbody>
      </table>

      <h3>Error mapping</h3>
      <CodeBlock language="typescript">
{`if (res.status === 429) errorMessage = 'The agent is busy. Please wait a moment and try again.'
if (res.status === 401) errorMessage = 'Your AI key is invalid. Update it in Settings.'`}
      </CodeBlock>

      <h2>Flow Builder — React Flow</h2>
      <p>
        The <code>/build</code> page uses React Flow for the drag-and-drop canvas. Node types:
      </p>
      <table>
        <thead><tr><th>Node</th><th>Accent Colour</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>BRIDGE</td><td>#6A0DAD (purple)</td><td>build_bridge_tx</td></tr>
          <tr><td>SWAP</td><td>#E91E8C (pink)</td><td>build_swap_tx</td></tr>
          <tr><td>STAKE</td><td>#22C55E (green)</td><td>build_stake_tx</td></tr>
          <tr><td>SEND</td><td>#F59E0B (amber)</td><td>build_transfer_tx</td></tr>
        </tbody>
      </table>
      <p>
        Executing a flow calls <code>executeSequence</code> with all nodes in order. Saving a flow
        calls <code>saveFlowToDb()</code>. Loading saved flows is scaffolded but the UI does not yet
        wire to <code>getFlowsFromDb()</code> — a known TODO.
      </p>

      <h2>Settings — API Key Storage</h2>
      <p>
        The user&apos;s Gemini API key is stored in <code>localStorage</code> and sent on every{' '}
        <code>/api/chat</code> request. It is never stored on the server. From the{' '}
        <code>/settings</code> page description:
      </p>
      <blockquote>
        &quot;Enter your API key once in Settings. It never leaves your device.&quot;
      </blockquote>
      <p>
        The key is retrieved from settings and injected into <code>sendAgentMessage()</code> on each
        request.
      </p>
    </div>
  )
}
