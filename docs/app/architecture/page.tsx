import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = {
  title: 'Architecture',
  description: 'System diagram, unsigned-tx security model, full tech stack, and end-to-end bridge data flow.',
  openGraph: {
    title: 'Architecture — Automata Docs',
    description: 'System diagram, unsigned-tx security model, full tech stack, and end-to-end bridge data flow.',
  },
}

export default function ArchitecturePage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>02 ——</p>
      <h1>Architecture</h1>
      <p>
        Automata is a monorepo composed of three strictly-separated layers. Each layer communicates
        across a single well-defined boundary — HTTP REST and WebSocket between frontend and
        backend; viem, Stellar SDK, LI.FI SDK, and Circle APIs between backend and chains.
      </p>

      <h2>System Diagram</h2>
      <CodeBlock language="text">
{`┌────────────────────────────────────────────────────────────┐
│                       FRONTEND LAYER                        │
│  Next.js 15 (App Router) · Tailwind CSS · Framer Motion     │
│  React Flow (flow builder) · Privy (wallet auth)            │
│                                                             │
│  Pages:   /  ·  /chat  ·  /build  ·  /history  ·           │
│           /settings                                         │
│                                                             │
│  Key files:                                                 │
│    useTransactionExecutor.ts  ← signs EVM + Stellar txs     │
│    lib/api.ts                 ← REST client + DB wrappers   │
│    components/FlowBuilder/    ← React Flow node canvas      │
│    components/chat/           ← chat sidebar                │
└──────────────────────┬─────────────────────────────────────┘
                       │
              REST (POST /api/chat, etc.)
              WebSocket (tx monitoring)
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                       BACKEND LAYER                         │
│  Node.js · Express · TypeScript · Prisma (PostgreSQL)       │
│                                                             │
│  Key files:                                                 │
│    agent/agent.ts       ← Gemini 2.5 Flash tool-use loop   │
│    agent/tools.ts       ← 10 Gemini function declarations   │
│    agent/toolExecutor.ts← routes tool calls to services     │
│    services/bridge*     ← Circle CCTP V2 calldata          │
│    services/swap*       ← LI.FI SDK + Stellar DEX          │
│    services/yield*      ← Aave V3 + LI.FI Earn API         │
│    adapters/evm.ts      ← viem public clients              │
│    adapters/stellar.ts  ← Horizon, XDR builders           │
│    index.ts             ← Express server + WebSocket        │
└──────────────────────┬─────────────────────────────────────┘
                       │
              viem · @stellar/stellar-sdk
              @lifi/sdk · circle-iris-api (fetch)
                       │
                       ▼
┌────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN LAYER                          │
│  Base (8453) · Celo (42220) · Ethereum (1) · Stellar        │
│  USDC (native on all 4 via CCTP V2)                         │
│  XLM · cUSD · cKES · ETH · CELO                            │
└────────────────────────────────────────────────────────────┘`}
      </CodeBlock>

      <h2>The Unsigned Transaction Model</h2>
      <p>
        Automata follows a strict security model: <strong>the backend never signs or holds user
        funds</strong>. The backend&apos;s only job is to build the correct calldata — the ABI-encoded
        function call — and return it as an unsigned transaction object.
      </p>
      <p>
        The frontend receives these objects, displays them to the user in plain English, and passes
        them to Privy for signing. The user&apos;s private key never leaves their device.
      </p>

      <CodeBlock language="text">
{`Backend builds:
  {
    to:          "0x28b5a0e9...",   // CCTP TokenMessenger contract
    data:        "0xab...cd",       // depositForBurn calldata
    value:       "0",               // no native token needed for USDC bridge
    chainId:     "base",
    description: "Send 100 USDC from base to celo",
    txType:      "burn"
  }

Frontend receives → Privy signs → eth_sendTransaction → on-chain`}
      </CodeBlock>

      <h2>Session Management</h2>
      <p>
        Conversations are tracked server-side in an in-memory <code>Map</code>. Each session
        is identified by a <code>sessionId</code> string passed from the frontend.
      </p>
      <ul>
        <li>Session history is a <code>ConversationMessage[]</code> — Gemini content parts.</li>
        <li>
          When a session produces <code>unsignedTxs</code>, the session is automatically deleted
          from the map (the transaction replaces the conversation context).
        </li>
        <li>
          Sessions are lost on server restart. Migration to Prisma persistence is a known TODO
          (see <a href="/status">Project Status</a>).
        </li>
      </ul>

      <h2>Tech Stack</h2>
      <table>
        <thead>
          <tr><th>Layer</th><th>Technology</th><th>Why</th></tr>
        </thead>
        <tbody>
          <tr><td>Frontend framework</td><td>Next.js 15 (App Router)</td><td>Server + client components, fast routing</td></tr>
          <tr><td>Styling</td><td>Tailwind CSS v3</td><td>Utility-first, fast design iteration</td></tr>
          <tr><td>UI components</td><td>shadcn/ui (Radix UI)</td><td>Unstyled base, fully customisable</td></tr>
          <tr><td>Animations</td><td>Framer Motion</td><td>Page transitions, micro-interactions</td></tr>
          <tr><td>Flow builder</td><td>React Flow</td><td>Purpose-built node-based canvas</td></tr>
          <tr><td>Wallet auth</td><td>Privy SDK</td><td>Embedded wallets (Google OAuth) + MetaMask</td></tr>
          <tr><td>EVM interaction</td><td>viem + wagmi</td><td>Type-safe, modern Ethers.js replacement</td></tr>
          <tr><td>Stellar</td><td>@stellar/stellar-sdk</td><td>Horizon, XDR tx building, path payments</td></tr>
          <tr><td>AI agent</td><td>Gemini 2.5 Flash</td><td>Tool-use (function calling) support, free tier</td></tr>
          <tr><td>USDC bridging</td><td>Circle CCTP V2</td><td>Native burn-and-mint, no wrapped tokens</td></tr>
          <tr><td>Swap routing</td><td>LI.FI SDK</td><td>60+ chains, 14+ bridges, 34+ DEXs in one call</td></tr>
          <tr><td>Yield data</td><td>LI.FI Earn API + Aave V3</td><td>Live APY reads + actionable deposit txs</td></tr>
          <tr><td>Micropayments</td><td>x402 Protocol</td><td>Agent-autonomous per-query payments</td></tr>
          <tr><td>Database</td><td>PostgreSQL + Prisma</td><td>Users, flows, sessions, transaction history</td></tr>
          <tr><td>Backend</td><td>Node.js + Express + TypeScript</td><td>Lightweight, typed, fast ecosystem</td></tr>
          <tr><td>Real-time</td><td>WebSocket (ws)</td><td>Streams tx confirmation status to frontend</td></tr>
        </tbody>
      </table>

      <h2>Data Flow — Bridge Transaction</h2>
      <p>
        The complete data flow for a USDC bridge from Base to Celo — the most complex operation in
        the system — illustrates how all three layers interact:
      </p>
      <CodeBlock language="text">
{`1. User types: "Bridge 100 USDC from Base to Celo"

2. Frontend → POST /api/chat
   { message, walletAddress, geminiApiKey, sessionId }

3. Backend: runAgent() initialises Gemini with SYSTEM_PROMPT + AGENT_TOOLS

4. Gemini calls: get_balances({ walletAddress })
   → balanceService reads USDC balance via viem ERC-20 readContract

5. Gemini calls: build_bridge_tx({ fromChain: "base", toChain: "celo",
                                    amount: "100", walletAddress, recipientAddress })
   → bridgeService builds two transactions:
      TX-1: ERC20.approve(TokenMessenger, 100 USDC)
      TX-2: TokenMessenger.depositForBurn(100e6, domain=7, recipient, burnToken)

6. Gemini calls: estimate_fees({ actions })
   → feeService returns stub fee estimate

7. Backend response:
   { reply: "I'll move 100 USDC...", unsignedTxs: [approveTx, burnTx] }

8. Frontend: shows plan to user in PlanReview component

9. User clicks "Confirm & Sign"
   → useTransactionExecutor.executeSequence()

10. EVM signing TX-1 (approve):
    → activeWallet.switchChain(8453)   // ensure we're on Base
    → provider.request('eth_sendTransaction', approveTx)

11. EVM signing TX-2 (burn):
    → provider.request('eth_sendTransaction', burnTx)
    → burnTxHash returned

12. Burn tx has bridgeMeta: { sourceChain: "base", destinationChain: "celo", ... }
    → executor detects txType === "burn" && destinationChain !== "stellar"
    → POST /api/bridge/attest { burnTxHash, sourceChain, destinationChain, ... }

13. Backend: pollAttestation(sourceDomain=6, burnTxHash)
    → polls GET https://iris-api.circle.com/v2/messages/6?transactionHash={hash}
    → every 5s, up to 60 attempts (5 minutes)
    → returns { message, attestation } when status === "complete"

14. Backend: buildReceiveMessageTx()
    → encodes MessageTransmitter.receiveMessage(message, attestation)
    → returns { unsignedTx: mintTx }

15. Frontend: receives mintTx
    → switchChain(42220)  // Celo
    → signs mintTx via provider.request('eth_sendTransaction')

16. USDC arrives on Celo. ~90 seconds total.
    → saveHistoryToDb() logs the completed bridge`}
      </CodeBlock>
    </div>
  )
}
