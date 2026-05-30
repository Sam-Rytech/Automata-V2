import type { Metadata } from 'next'
import NavCards from '@/components/NavCards'

export const metadata: Metadata = {
  title: 'Introduction',
  description: 'Overview of Automata — chain support, key integrations, and what the platform lets you do.',
  openGraph: {
    title: 'Automata — Introduction',
    description: 'Overview of Automata — chain support, key integrations, and what the platform lets you do.',
  },
}

export default function IntroPage() {
  return (
    <div className="doc-content">
      {/* Hero */}
      <div style={{ marginBottom: '3rem' }}>
        <p
          style={{
            fontFamily: 'IBM Plex Mono',
            fontSize: '0.7rem',
            color: '#E91E8C',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '0.75rem',
          }}
        >
          CROSS-CHAIN AI AGENT PLATFORM — v2.0.0
        </p>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          Automata Documentation
        </h1>
        <p style={{ fontSize: '1rem', color: '#a0a0b0', maxWidth: '600px', lineHeight: '1.8' }}>
          Automata lets any user send, swap, bridge, and stake tokens across{' '}
          <strong style={{ color: '#fff' }}>Base, Celo, Ethereum, and Stellar</strong> by typing a
          plain English message or dragging nodes on a canvas. The AI agent handles routing, fees,
          and execution. The blockchain is invisible.
        </p>
      </div>

      {/* Core principle */}
      <div
        style={{
          background: 'rgba(233,30,140,0.06)',
          border: '1px solid rgba(233,30,140,0.15)',
          borderLeft: '3px solid #E91E8C',
          borderRadius: '6px',
          padding: '1rem 1.25rem',
          marginBottom: '2.5rem',
        }}
      >
        <p style={{ margin: 0, color: '#e0c0d0', fontFamily: 'IBM Plex Mono', fontSize: '0.875rem' }}>
          <strong style={{ color: '#E91E8C' }}>Core principle:</strong> stupidly simple. One message.
          Every chain. The user thinks in outcomes, not technology.
        </p>
      </div>

      {/* What it does */}
      <h2>What Automata Does</h2>
      <p>
        Users interact with Automata through two interfaces:
      </p>
      <ul>
        <li>
          <strong style={{ color: '#fff' }}>Chat Interface</strong> — type a natural language
          instruction like <code>"Bridge 100 USDC from Base to Stellar and swap to XLM"</code>. The
          agent reasons about the intent, calls the relevant tools, estimates fees, and returns a
          transaction plan for the user to sign.
        </li>
        <li>
          <strong style={{ color: '#fff' }}>Visual Flow Builder</strong> — drag{' '}
          <code>BRIDGE → SWAP → STAKE</code> nodes onto a React Flow canvas, configure each node
          (chain, token, amount), and execute the entire sequence.
        </li>
      </ul>

      <h2>How It Works — High Level</h2>
      <pre style={{ background: '#0a0a14', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '1.25rem', fontSize: '0.78rem', overflowX: 'auto', color: '#c0d0e0' }}>{`User types: "Move 100 USDC from Base to Celo"
          │
          ▼
Frontend (Next.js + Privy)
  → POST /api/chat  { message, walletAddress, geminiApiKey, sessionId }
          │
          ▼
Backend (Express + TypeScript)
  → runAgent() → Gemini 2.5 Flash tool-use loop
      → get_balances()      ← reads live EVM balance via viem
      → build_bridge_tx()   ← builds approve + depositForBurn calldata (CCTP V2)
      → estimate_fees()
  ← returns { reply, unsignedTxs }
          │
          ▼
Frontend
  → Shows plan to user (assisted mode)
  → User clicks "Confirm"
  → useTransactionExecutor signs each tx via Privy
  → After burn tx: polls /api/bridge/attest (Circle Iris)
  → Signs mint tx on destination chain
          │
          ▼
Chain: USDC arrives on Celo (burn-and-mint, ~90 seconds)`}</pre>

      <h2>Two Execution Modes</h2>
      <table>
        <thead>
          <tr>
            <th>Mode</th>
            <th>Behaviour</th>
            <th>Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>assisted</code></td>
            <td>Agent proposes a plan with fee estimates. User reviews and confirms before any transaction is built.</td>
            <td>Default. All users. Unfamiliar flows.</td>
          </tr>
          <tr>
            <td><code>autonomous</code></td>
            <td>Agent executes the full sequence without an intermediate review step. User signs wallet prompts directly.</td>
            <td>Advanced users. Recurring flows.</td>
          </tr>
        </tbody>
      </table>

      <h2>Phase 1 Chains</h2>
      <table>
        <thead>
          <tr><th>Chain</th><th>Chain ID</th><th>USDC</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr><td>Base</td><td>8453</td><td>Native (CCTP V2)</td><td>Low fees, fast finality, Coinbase-backed</td></tr>
          <tr><td>Celo</td><td>42220</td><td>Native (CCTP V2)</td><td>Mobile-first, MiniPay, Africa payments</td></tr>
          <tr><td>Ethereum</td><td>1</td><td>Native (CCTP V2)</td><td>Settlement layer, maximum security</td></tr>
          <tr><td>Stellar</td><td>—</td><td>Circle-issued</td><td>Built for payments, XLM native, Horizon DEX</td></tr>
        </tbody>
      </table>

      <h2>Key Integrations</h2>
      <table>
        <thead>
          <tr><th>Integration</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr><td>Google Gemini 2.5 Flash</td><td>AI agent brain — tool-use loop, plain English understanding</td></tr>
          <tr><td>Circle CCTP V2</td><td>Burn-and-mint USDC bridging across all Phase 1 chains</td></tr>
          <tr><td>LI.FI SDK</td><td>Non-USDC swap routing, 60+ chains, 14+ bridges, 34+ DEXs</td></tr>
          <tr><td>LI.FI Earn API</td><td>Yield opportunities discovery and deposit transaction building</td></tr>
          <tr><td>Aave V3</td><td>Real on-chain APY reads via Pool contract ABI (Base + Ethereum)</td></tr>
          <tr><td>Privy</td><td>Embedded wallets (Google OAuth) + external wallet connectors</td></tr>
          <tr><td>Stellar Horizon</td><td>Balance reads, XLM/USDC transfers, path payment DEX swaps</td></tr>
          <tr><td>x402 Protocol</td><td>Agent-autonomous micropayments for premium yield data</td></tr>
          <tr><td>PostgreSQL + Prisma</td><td>User profiles, saved flows, transaction history</td></tr>
        </tbody>
      </table>

      {/* Quick links grid */}
      <h2>Quick Navigation</h2>
      <NavCards />
    </div>
  )
}
