import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = { title: 'Getting Started' }

export default function GettingStartedPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>
        01 ——
      </p>
      <h1>Getting Started</h1>
      <p>
        This guide walks you from zero to a running Automata instance. By the end you will have
        the backend API responding, the frontend loaded, and a working curl test confirming the AI
        agent is live.
      </p>

      <h2 id="prerequisites">Prerequisites</h2>
      <p>Install and verify these before continuing:</p>
      <table>
        <thead><tr><th>Tool</th><th>Version</th><th>Install</th></tr></thead>
        <tbody>
          <tr><td>Node.js</td><td>v20 LTS</td><td><code>https://nodejs.org</code></td></tr>
          <tr><td>npm</td><td>v10+</td><td>bundled with Node.js</td></tr>
          <tr><td>PostgreSQL</td><td>v16</td><td><code>brew install postgresql@16</code> or distro pkg</td></tr>
          <tr><td>Git</td><td>any</td><td><code>apt install git</code> / <code>brew install git</code></td></tr>
        </tbody>
      </table>

      <h3>Required API Keys</h3>
      <p>Obtain all of these before running. Most have a free tier.</p>
      <table>
        <thead><tr><th>Key</th><th>Where to Get</th><th>Purpose</th></tr></thead>
        <tbody>
          <tr><td>Gemini API Key</td><td><code>aistudio.google.com</code></td><td>Powers the AI agent brain</td></tr>
          <tr><td>Privy App ID</td><td><code>privy.io</code></td><td>Embedded + external wallet auth</td></tr>
          <tr><td>Circle API Key</td><td><code>developers.circle.com</code></td><td>CCTP V2 attestation (optional for dev)</td></tr>
          <tr><td>LI.FI API Key</td><td><code>li.fi</code></td><td>Swap routing (free tier works without key)</td></tr>
          <tr><td>Alchemy / Infura</td><td><code>alchemy.com</code></td><td>Reliable RPC endpoints for Base, ETH, Celo</td></tr>
        </tbody>
      </table>

      <h2 id="setup">Local Setup</h2>

      <h3>1. Clone the repo</h3>
      <CodeBlock language="bash">
{`git clone https://github.com/YOUR_USERNAME/automata-v2.git
cd automata-v2`}
      </CodeBlock>

      <h3>2. Set up the database</h3>
      <CodeBlock language="bash">
{`# Create the database
createdb automata

# Or on Linux:
sudo -u postgres createdb automata`}
      </CodeBlock>

      <h3>3. Install and migrate the backend</h3>
      <CodeBlock language="bash">
{`cd backend
npm install

# Run Prisma migration (creates User, Flow, Session, Transaction tables)
npx prisma migrate dev --name init

# Verify tables were created
npx prisma studio   # opens browser UI at localhost:5555`}
      </CodeBlock>

      <h3>4. Start the backend</h3>
      <CodeBlock language="bash">
{`# Still in /backend
npm run dev

# Expected output:
# Automata backend running on port 3001 (HTTP + WebSocket)`}
      </CodeBlock>

      <h3>5. Install and start the frontend</h3>
      <CodeBlock language="bash">
{`cd ../frontend
npm install
npm run dev

# Expected output:
# ▲ Next.js ready on http://localhost:3000`}
      </CodeBlock>

      <h2 id="env">Environment Variables</h2>
      <p>
        Two <code>.env</code> files are required. Neither file should ever be committed to git.
        Both are already in <code>.gitignore</code>.
      </p>

      <h3>backend/.env</h3>
      <CodeBlock language="bash" filename="backend/.env">
{`PORT=3001
NODE_ENV=development

# PostgreSQL connection string
DATABASE_URL=postgresql://YOUR_USERNAME@localhost:5432/automata

# 32-character random string — used to encrypt user Gemini API keys at rest
ENCRYPTION_SECRET=your32charrandomencrytptionstring

# RPC endpoints — use Alchemy/Infura for reliability
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
CELO_RPC_URL=https://forno.celo.org
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Stellar Horizon
STELLAR_HORIZON_URL=https://horizon.stellar.org

# Circle CCTP (optional in dev — only needed for live bridge attestation)
CIRCLE_API_KEY=

# LI.FI (free tier works without a key in development)
LIFI_API_KEY=
LIFI_INTEGRATOR_ID=automata

# CORS — the frontend URL
CORS_ORIGIN=http://localhost:3000`}
      </CodeBlock>

      <h3>frontend/.env.local</h3>
      <CodeBlock language="bash" filename="frontend/.env.local">
{`# Backend URL
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Privy (from https://privy.io dashboard)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Chain IDs (these are fixed constants — do not change)
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_CELO_CHAIN_ID=42220
NEXT_PUBLIC_ETH_CHAIN_ID=1`}
      </CodeBlock>

      <h2>Verify the agent is running</h2>
      <p>With both servers running, send a test message directly to the backend:</p>
      <CodeBlock language="bash">
{`curl -X POST http://localhost:3001/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "What is my USDC balance?",
    "walletAddress": "0x0000000000000000000000000000000000000001",
    "geminiApiKey": "YOUR_GEMINI_API_KEY",
    "sessionId": "test-session-1"
  }'`}
      </CodeBlock>

      <p>Expected response (structure):</p>
      <CodeBlock language="json">
{`{
  "reply": "I checked your balance across all chains. Here's what I found: ...",
  "sessionId": "test-session-1",
  "unsignedTxs": []
}`}
      </CodeBlock>

      <div className="callout callout-info">
        <strong>Note:</strong> The <code>geminiApiKey</code> field in the API is the user&apos;s own
        Gemini API key. In the frontend this is stored in <code>localStorage</code> and sent with
        every request. The backend never persists it — it passes it directly to the{' '}
        <code>GoogleGenerativeAI</code> constructor per request.
      </div>

      <h2>Running the x402 Yield Server (optional)</h2>
      <p>
        The x402 yield server is an optional microservice that demonstrates Automata&apos;s autonomous
        micropayment capability. It is not required for core functionality.
      </p>
      <CodeBlock language="bash">
{`cd x402-yield-server
npm install
npm run dev

# Runs on port 3002
# GET /api/yield requires X-PAYMENT header (Stellar USDC micropayment)`}
      </CodeBlock>

      <h2>Project Structure Reference</h2>
      <CodeBlock language="text">
{`Automata-V2/
├── backend/                    # Express API + AI agent
│   ├── src/
│   │   ├── agent/              # Gemini loop, tool defs, executor
│   │   │   ├── agent.ts        # runAgent() — the tool-use loop
│   │   │   ├── tools.ts        # 10 Gemini function declarations
│   │   │   ├── toolExecutor.ts # routes tool calls to services
│   │   │   └── prompts.ts      # SYSTEM_PROMPT
│   │   ├── services/           # Business logic per capability
│   │   │   ├── bridgeService.ts     # Circle CCTP V2
│   │   │   ├── swapService.ts       # LI.FI + Stellar DEX
│   │   │   ├── yieldService.ts      # Aave V3 + LI.FI Earn
│   │   │   ├── balanceService.ts    # EVM + Stellar balance reads
│   │   │   ├── transferService.ts   # ERC-20 calldata + Stellar XDR
│   │   │   ├── routeService.ts      # LI.FI route caching
│   │   │   ├── stakeService.ts      # LI.FI Earn deposit tx
│   │   │   ├── feeService.ts        # fee estimation stub
│   │   │   ├── resolverService.ts   # ENS / phone stub
│   │   │   ├── txMonitorService.ts  # WebSocket tx polling
│   │   │   └── stellarBridgeRelay.ts# Stellar CCTP relay
│   │   ├── adapters/           # Chain-level tx builders
│   │   │   ├── evm.ts          # viem ERC-20 reads, USDC addresses
│   │   │   └── stellar.ts      # Horizon, XDR builders
│   │   ├── utils/
│   │   │   └── rpc.ts          # viem public clients
│   │   └── index.ts            # Express server entry point
│   └── prisma/
│       └── schema.prisma       # User, Flow, Session, Transaction
├── frontend/                   # Next.js 15 App Router
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── chat/page.tsx       # AI chat interface
│   │   ├── build/page.tsx      # Visual Flow Builder
│   │   ├── history/page.tsx    # Transaction history
│   │   └── settings/page.tsx   # API key + execution mode
│   ├── components/
│   │   ├── landing/            # Hero, Chains, Models, FinalCTA
│   │   ├── chat/               # ChatSidebar
│   │   ├── FlowBuilder/        # ActionNode (React Flow)
│   │   └── ui/                 # shadcn/ui components
│   ├── app/hooks/
│   │   └── useTransactionExecutor.ts  # EVM + Stellar signing
│   └── lib/
│       ├── api.ts              # sendAgentMessage + DB wrappers
│       └── wagmi-config.ts     # viem/wagmi chain config
├── contracts/
│   ├── evm/
│   │   ├── AutomataRouter.sol      # Batch execute + fee sweep
│   │   └── AutomataYieldVault.sol  # ERC-4626-style vault
│   └── stacks/                 # Clarity contracts (3 files, not deployed)
├── types/
│   └── Action.ts               # Shared TypeScript types
└── x402-yield-server/          # Stellar micropayment yield server`}
      </CodeBlock>
    </div>
  )
}
