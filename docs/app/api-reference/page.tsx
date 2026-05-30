import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = { title: 'API Reference' }

function Endpoint({
  method,
  path,
  desc,
}: {
  method: string
  path: string
  desc: string
}) {
  const color =
    method === 'GET' ? '#22C55E' : method === 'POST' ? '#E91E8C' : '#F59E0B'
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        background: '#1A1A2E',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '6px',
        padding: '0.8rem 1rem',
        marginBottom: '0.5rem',
      }}
    >
      <span
        style={{
          fontFamily: 'IBM Plex Mono',
          fontSize: '0.7rem',
          fontWeight: 600,
          color,
          background: `${color}18`,
          border: `1px solid ${color}40`,
          borderRadius: '3px',
          padding: '2px 7px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          marginTop: '1px',
        }}
      >
        {method}
      </span>
      <div>
        <code
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '0.85rem',
            color: '#fff',
          }}
        >
          {path}
        </code>
        <p
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '0.75rem',
            color: '#666',
            marginTop: '0.2rem',
            marginBottom: 0,
          }}
        >
          {desc}
        </p>
      </div>
    </div>
  )
}

export default function ApiReferencePage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>03 ——</p>
      <h1>API Reference</h1>
      <p>
        The Automata backend exposes a REST API on port <code>3001</code> by default. All endpoints
        accept and return <code>application/json</code>. A WebSocket server runs on the same port.
      </p>

      <h2>Endpoints Overview</h2>
      <Endpoint method="GET" path="/health" desc="Server health check. Always returns 200 OK." />
      <Endpoint method="POST" path="/api/chat" desc="Send a message to the AI agent. Returns agent reply + optional unsigned transactions." />
      <Endpoint method="POST" path="/api/bridge/attest" desc="Poll Circle Iris V2 for CCTP attestation and return the mint transaction." />
      <Endpoint method="POST" path="/api/bridge/relay" desc="Start Stellar bridge relay after an EVM burn transaction." />
      <Endpoint method="POST" path="/api/flows" desc="Save a named flow (action sequence) to the database." />
      <Endpoint method="GET" path="/api/flows/:walletAddress" desc="Fetch all saved flows for a wallet address." />
      <Endpoint method="POST" path="/api/history" desc="Log a transaction to the history database." />
      <Endpoint method="GET" path="/api/history/:walletAddress" desc="Fetch transaction history for a wallet address." />

      {/* ── /health ── */}
      <h2>GET /health</h2>
      <p>Returns server status. Use this to confirm the backend is reachable.</p>
      <h4>Response 200</h4>
      <CodeBlock language="json">
{`{
  "status": "ok",
  "timestamp": "2026-05-30T12:00:00.000Z"
}`}
      </CodeBlock>

      {/* ── /api/chat ── */}
      <h2>POST /api/chat</h2>
      <p>
        The primary endpoint. Sends a user message into the Gemini tool-use loop. The agent may call
        multiple tools internally before returning a final plain-English reply. If the agent built
        any transactions, they are returned in <code>unsignedTxs</code>.
      </p>

      <h4>Request Body</h4>
      <CodeBlock language="typescript">
{`{
  message:        string       // Required. The user's plain-English instruction.
  sessionId:      string       // Required. Client-generated conversation ID.
  geminiApiKey:   string       // Required. User's own Gemini API key.
  walletAddress:  string       // Required. User's EVM wallet address (0x...).
  stellarAddress: string       // Optional. User's Stellar wallet address (G...).
}`}
      </CodeBlock>

      <h4>Response 200</h4>
      <CodeBlock language="typescript">
{`{
  reply:       string        // Agent's plain-English response.
  sessionId:   string        // Echo of the provided sessionId.
  unsignedTxs: UnsignedTx[]  // Transactions for the user to sign. May be empty.
}

// UnsignedTx shape:
{
  to:          string   // Contract address (EVM) or recipient (Stellar).
  data:        string   // Hex-encoded calldata. "0x" for Stellar txs.
  value:       string   // Native token amount in wei. Usually "0".
  chainId:     string   // "base" | "celo" | "ethereum" | "stellar"
  description: string   // Plain English — shown to user before signing.
  xdr?:        string   // Stellar only. Unsigned XDR transaction envelope.
  txType?:     string   // "approve" | "burn" | "mint" | "swap" | etc.
  bridgeMeta?: {        // Present on burn txs — drives attest flow.
    sourceChain:      string
    destinationChain: string
    sourceDomain:     number
    recipientAddress: string
    amount:           string
  }
}`}
      </CodeBlock>

      <h4>Error Responses</h4>
      <table>
        <thead><tr><th>Status</th><th>Condition</th></tr></thead>
        <tbody>
          <tr><td>400</td><td><code>message</code>, <code>sessionId</code>, or <code>geminiApiKey</code> missing</td></tr>
          <tr><td>429</td><td>Gemini rate limit — surfaced as plain text error</td></tr>
          <tr><td>500</td><td>Agent execution failed — error message in body</td></tr>
        </tbody>
      </table>

      <h4>Session Semantics</h4>
      <ul>
        <li>The backend stores conversation history in an in-memory <code>Map&lt;sessionId, ConversationMessage[]&gt;</code>.</li>
        <li>When a response contains <code>unsignedTxs.length &gt; 0</code>, the session is <strong>deleted</strong> from the map — the transaction output replaces the conversational context.</li>
        <li>If no session exists for a given <code>sessionId</code>, a new empty history is started.</li>
        <li>Sessions do not persist across backend restarts.</li>
      </ul>

      <h4>Wallet address injection</h4>
      <p>
        The backend prepends the wallet address into the user message as a context header before
        passing it to the agent:
      </p>
      <CodeBlock language="typescript">
{`// index.ts — applied to every /api/chat request
const contextualMessage = walletAddress
  ? \`[User EVM wallet address: \${walletAddress}]\${stellarAddress
      ? \`\\n[User Stellar wallet address: \${stellarAddress}]\`
      : ''}\\n\${message}\`
  : message`}
      </CodeBlock>

      {/* ── /api/bridge/attest ── */}
      <h2>POST /api/bridge/attest</h2>
      <p>
        Called by the frontend after the burn transaction confirms on the source EVM chain.
        Polls Circle Iris V2 until the attestation is complete, then returns the unsigned
        <code>receiveMessage</code> (mint) transaction for the user to sign on the destination chain.
      </p>
      <p>
        Polling interval: 5 seconds. Maximum: 60 attempts (5 minutes). The request will hang
        (long-poll) until attestation completes or the timeout is reached.
      </p>

      <h4>Request Body</h4>
      <CodeBlock language="typescript">
{`{
  burnTxHash:       string   // The hash of the confirmed depositForBurn tx
  sourceChain:      string   // "base" | "celo" | "ethereum"
  destinationChain: string   // "base" | "celo" | "ethereum"
  recipientAddress: string   // EVM address to receive USDC on destination
  amount:           string   // Human-readable amount (e.g. "100")
}`}
      </CodeBlock>

      <h4>Response 200</h4>
      <CodeBlock language="json">
{`{
  "status": "attested",
  "unsignedTx": {
    "to":          "0x81D40F21F12A8F0E3252Bccb954D722d4c464B64",
    "data":        "0x57ecfd28000....",
    "value":       "0",
    "chainId":     "celo",
    "description": "Claim 100 USDC on celo",
    "txType":      "mint"
  }
}`}
      </CodeBlock>

      <h4>CCTP Domain IDs</h4>
      <table>
        <thead><tr><th>Chain</th><th>Domain ID</th></tr></thead>
        <tbody>
          <tr><td>Ethereum</td><td>0</td></tr>
          <tr><td>Base</td><td>6</td></tr>
          <tr><td>Celo</td><td>7</td></tr>
          <tr><td>Stellar</td><td>27</td></tr>
        </tbody>
      </table>

      {/* ── /api/bridge/relay ── */}
      <h2>POST /api/bridge/relay</h2>
      <p>
        Starts a background Stellar bridge relay after an EVM burn transaction. Returns immediately
        (fire-and-forget). The relay polls Circle and will mint USDC on Stellar when the
        attestation completes.
      </p>
      <div className="callout callout-warn">
        <strong>Deferred:</strong> Circle has not published verified Stellar CCTP mainnet contract
        addresses as of v2.0.0. This endpoint is scaffolded but the relay will not complete on
        mainnet. See <a href="/status">Project Status</a>.
      </div>

      <h4>Request Body</h4>
      <CodeBlock language="typescript">
{`{
  burnTxHash:       string   // EVM burn tx hash
  recipientAddress: string   // Stellar G... address to receive USDC
  amount:           string   // Human-readable amount
}`}
      </CodeBlock>

      <h4>Response 200</h4>
      <CodeBlock language="json">
{`{ "status": "relay_started", "burnTxHash": "0x..." }`}
      </CodeBlock>

      {/* ── /api/flows ── */}
      <h2>POST /api/flows</h2>
      <p>Save a named action sequence (flow) to the database for a given wallet address.</p>

      <h4>Request Body</h4>
      <CodeBlock language="typescript">
{`{
  walletAddress: string      // EVM wallet address (creates user if not exists)
  name:          string      // Human-readable flow name
  description?:  string      // Optional description
  actions:       Action[]    // Array of action objects (see types/Action.ts)
}`}
      </CodeBlock>

      <h4>Response 200 — the saved Flow record</h4>
      <CodeBlock language="json">
{`{
  "id":          "clxxxx",
  "userId":      "clxxxx",
  "name":        "My Bridge Flow",
  "description": "Bridge USDC from Base to Celo then swap to cUSD",
  "actions":     [...],
  "createdAt":   "2026-05-30T12:00:00.000Z",
  "updatedAt":   "2026-05-30T12:00:00.000Z"
}`}
      </CodeBlock>

      {/* ── /api/history ── */}
      <h2>POST /api/history</h2>
      <p>Log a completed or failed transaction to the history database.</p>

      <h4>Request Body</h4>
      <CodeBlock language="typescript">
{`{
  walletAddress: string   // EVM address
  txHash?:       string   // On-chain tx hash (undefined if tx failed pre-submission)
  chainId:       string   // "base" | "celo" | "ethereum" | "stellar" | "VARIOUS"
  actionType:    string   // "AGENT_EXECUTION" | "FLOW" | "BRIDGE" | etc.
  status:        string   // "SUCCESS" | "FAILED"
  details:       object   // Freeform JSON — steps count, error message, etc.
}`}
      </CodeBlock>

      {/* ── WebSocket ── */}
      <h2>WebSocket Events</h2>
      <p>
        Connect to <code>ws://localhost:3001</code>. After the connection is established, the server
        sends a welcome message immediately.
      </p>

      <h4>Server → Client: Connected</h4>
      <CodeBlock language="json">
{`{ "type": "connected", "message": "Automata WebSocket ready" }`}
      </CodeBlock>

      <h4>Client → Server: Monitor transaction</h4>
      <CodeBlock language="json">
{`{ "type": "monitor", "txHash": "0x...", "chainId": "base" }`}
      </CodeBlock>

      <h4>Server → Client: Transaction status updates</h4>
      <CodeBlock language="typescript">
{`// Polling status (emitted periodically while monitoring)
{ "type": "status", "txHash": "0x...", "status": "pending" | "confirmed" | "failed" }

// Error
{ "type": "error", "message": "Unknown message type or missing fields." }`}
      </CodeBlock>

      <p>
        The <code>txMonitorService.ts</code> uses viem&apos;s <code>waitForTransactionReceipt</code>{' '}
        to poll the relevant chain and push status updates through the WebSocket connection.
      </p>
    </div>
  )
}
