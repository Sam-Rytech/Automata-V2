# AUTOMATA — PROGRESS.md
### Version 2.0 | Cross-Chain AI Agent Platform

> **This is the single source of truth for the entire project.**
> Every developer, every LLM, every session — starts here, reads everything, then acts.
> This file is updated after every completed task. No exceptions.

---

## 🔴 HOW TO USE THIS FILE — READ THIS FIRST, EVERY SINGLE SESSION

### If you are an LLM being handed this file:
1. Read the ENTIRE file before writing a single line of code
2. Find `## 📍 CURRENT POSITION` — that tells you exactly where we are
3. Find the next unchecked `[ ]` task under the active section
4. Do ONLY that task unless instructed otherwise
5. When done, output the patch so the developer can update this file:

```
--- PROGRESS.md PATCH ---
## 📍 CURRENT POSITION

\`\`\`
PHASE:   4 — REAL SERVICE IMPLEMENTATIONS
STEP:    4.1 — Replacing LI.FI and Circle stubs with SDKs
STATUS:  IN PROGRESS

Dev 1 (Jadon): Completed Backend Logic Layer. All 9 tools wired to services. 
Verified 429/500/Timeout error handling. npx tsc --noEmit is green. 

Next: Integration of @lifi/sdk and @circle-fin/cctp-sdk into service files. 
\`\`\`

---

## ✅ COMPLETED PHASES

### PHASE 0 — ACCOUNTS & INFRASTRUCTURE
- [x] GitHub repository initialized (Automata-V2). 
- [x] Google AI Studio key obtained (Gemini 2.5 Flash). 
- [x] PostgreSQL installed and running (Postgres 16). 
- [x] P1000 Auth error fixed (md5 configuration applied). 
- [x] Prisma migration \`init\` succeeded; Client generated. 

### PHASE 1 — MONOREPO SETUP & SCAFFOLD
- [x] Monorepo structure created (backend, frontend, shared). 
- [x] Backend dependencies installed (viem, stellar-sdk, generative-ai). 
- [x] Shared Types defined in \`shared/types/Action.ts\`. 
- [x] tsconfig.json updated for ES2022 compatibility. 

### PHASE 2 — AI AGENT BRAIN
- [x] System prompts and 9 tool declarations created. 
- [x] Full Reason-Act loop built in \`agent.ts\`. 
- [x] Conversation history & \`sanitizeHistory\` implemented to prevent crashes. 
- [x] Tool-use loop confirms \`functionCalls\` and feeds results back to Gemini. 

### PHASE 3 — BACKEND LOGIC LAYER
- [x] **Service Orchestration:** All 9 service stubs created in \`backend/src/services/\`. 
- [x] **Tool Executor:** Switchboard built to route Agent calls to real/mock services. 
- [x] **Real Data Integration:** \`balanceService.ts\` uses viem/Stellar for real-time reads. 
- [x] **API Endpoint:** \`POST /api/chat\` handles messaging, sessions, and unsignedTxs. 
- [x] **Session Logic:** In-memory session store; auto-deletes on transaction generation. 
- [x] **Error Handling:** Robust handling for 429 (Rate Limit), 401 (API Key), and Timeouts. 

---

## 🚀 UPCOMING: PHASE 4 — REAL SERVICE IMPLEMENTATIONS
- [ ] **Step 4.1:** Replace \`routeService.ts\` mock with real \`@lifi/sdk\` calls. 
- [ ] **Step 4.2:** Replace \`bridgeService.ts\` mock with real Circle CCTP V2 SDK. 
- [ ] **Step 4.3:** Implement real Aave/Mento yield reads in \`yieldService.ts\`. 
- [ ] **Step 4.4:** Move in-memory sessions to Prisma/PostgreSQL. 

---

## 🏗️ ARCHITECTURE NOTES
- **Endpoint:** Use \`POST /api/chat\` (replaces original \`/agent/execute\`). 
- **Execution:** Agent returns \`unsignedTxs\` for Frontend/Privy to sign. 
- **Safety:** \`sanitizeHistory\` ensures stable multi-turn AI conversations. 

```

### If you are a developer updating this file:
1. Apply the patch to the relevant section
2. Update `## 📍 CURRENT POSITION` immediately
3. Commit with message: `progress: completed [task name]`
4. Never skip updating this file — it is the project memory

---

## 🧠 WHAT IS AUTOMATA — NEVER SKIP THIS SECTION

Automata is a **cross-chain AI agent platform**. It lets any user — from a first-time crypto holder to a DeFi power user — **swap, bridge, and stake** across multiple blockchains through either a **chat interface** (type what you want in plain English) or a **visual flow builder** (drag and drop actions onto a canvas).

The AI agent (powered by Google Gemini Flash) handles all the complexity: finding the best route, estimating fees, sequencing the steps, and executing transactions. The user just confirms and signs.


**The blockchain is invisible to the user. They think in money outcomes, not technology.**

### The three things a user can do:
- **Send** — Send tokens to another User or MultiSend (e.g. USDC → XLM, USDC → cKES)
- **Swap** — exchange one token for another (e.g. USDC → XLM, USDC → cKES)
- **Bridge** — move assets from one blockchain to another (e.g. USDC on Base → USDC on Stellar)
- **Stake/Earn** — deposit into a yield protocol to earn returns (e.g. USDC into Aave on Base)

### The two interface modes:
- **Chat** — user types "move 100 USDC from Base to Stellar and swap to XLM" and the agent does it
- **Flow Builder** — user drags Bridge → Swap nodes onto a canvas and hits Execute

### The two execution modes (toggled by user):
- **Assisted** — agent proposes a plan, user reviews and approves before anything happens
- **Autonomous** — agent executes the full flow, notifies user when done

**The user always signs their own transactions. Automata never holds or controls funds.**

---

## 👥 THE TEAM

| Role | Handles | Notes |
|---|---|---|
| **Dev 1** | Smart contracts (if any), Backend, Agent | Pushes to GitHub |
| **Dev 2** | Frontend, UI/UX, MiniPay integration | Pushes to GitHub |

Both devs push to the same GitHub repo and both update this file after every completed task.

---

## 🏗️ FULL SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  Next.js 14 + Tailwind + shadcn/ui + Framer Motion      │
│  React Flow (flow builder) + Privy (wallet)             │
│                                                         │
│  Pages:  /  |  /chat  |  /build  |  /history  |        │
│          /settings                                      │
│                                                         │
│  Key components:                                        │
│    ChatInterface   → agent conversation UI              │
│    FlowBuilder     → drag-and-drop canvas               │
│    StatusPanel     → real-time tx feedback              │
│    WalletBar       → balances + connected wallet        │
│    PlanReview      → assisted mode approval UI          │
└──────────────────────┬──────────────────────────────────┘
                       │ REST + WebSocket
                       ▼
┌─────────────────────────────────────────────────────────┐
│                      BACKEND                            │
│  Node.js + Express + TypeScript                         │
│                                                         │
│  Key files:                                             │
│    agent.ts          → Gemini Flash tool-use loop       │
│    tools.ts          → all callable agent tools         │
│    bridgeService.ts  → Circle CCTP V2                   │
│    swapService.ts    → LI.FI routing                    │
│    adapters/         → per-chain tx builders            │
└──────────────────────┬──────────────────────────────────┘
                       │ viem | Stellar SDK | CCTP | LI.FI
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  BLOCKCHAIN LAYER                       │
│  Base · Celo · Ethereum · Stellar                       │
│  USDC (all chains) · XLM · cUSD · cKES · ETH · CELO    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 TECH STACK QUICK REFERENCE

| Layer | Tool | Why |
|---|---|---|
| Frontend framework | Next.js 14 (App Router) | Best React framework, server + client components |
| Styling | Tailwind CSS v3 | Utility-first, fast to build with |
| UI components | shadcn/ui | Unstyled base, easy to theme |
| Advanced components | 21st.dev | Pre-built complex components on top of shadcn |
| Design intelligence | UI/UX Pro Max skill | Generates full design system for crypto/fintech |
| Animations | Framer Motion | Page transitions, micro-interactions |
| Flow builder | React Flow | Purpose-built for node-based drag-and-drop UIs |
| Wallet | Privy SDK | Embedded wallets + MetaMask. Supports EVM + Stellar |
| EVM interaction | viem + wagmi | Modern, type-safe replacement for ethers.js |
| Stellar interaction | @stellar/stellar-sdk | Official Stellar SDK |
| Agent brain | Gemini 2.0 Flash (user's own API key) | Free for users, powerful tool/function calling |
| Agent framework | Google AI SDK for Node.js | Native function calling support |
| USDC bridging | Circle CCTP V2 + Bridge Kit | Native burn-and-mint. No wrapped tokens. Free. |
| Other asset routing | LI.FI SDK | Covers 60+ chains, 14+ bridges, 34+ DEXs automatically |
| Payment layer (Phase 2) | x402 Protocol | Per-action micropayments. No subscription needed. |
| Database | PostgreSQL + Prisma | Sessions, saved flows, encrypted API keys |
| Backend framework | Node.js + Express + TypeScript | Lightweight, fast, good ecosystem |
| Real-time updates | WebSocket (ws) | Streams tx status to frontend in real time |

---

## 🎨 DESIGN SYSTEM

**Do not deviate from these values without updating this section.**

| Token | Value | Usage |
|---|---|---|
| Background primary | `#0F0F1A` | App background |
| Background secondary | `#1A1A2E` | Cards, panels |
| Accent pink | `#E91E8C` | Primary CTAs, active states |
| Accent purple | `#6A0DAD` | Secondary accent, headings |
| Text primary | `#FFFFFF` | All text on dark backgrounds |
| Text muted | `#888888` | Labels, placeholders |
| Success | `#22C55E` | Confirmed tx, success states |
| Warning | `#F59E0B` | Fee warnings, caution |
| Error | `#EF4444` | Failed tx, error states |

**Font:** To be decided by Dev 2 in Phase 3, Step 3.1. Must NOT be Inter, Arial, or Roboto. Suggestions: Syne, Cabinet Grotesk, Clash Display, General Sans. Log the chosen font here once decided: `FONT CHOSEN: ___________`

**Design direction:** Dark, premium, fintech-native. Feels like a well-funded product. Animations are smooth and purposeful. The blockchain is invisible — language is always plain English.

---

## 🔑 KEY TECHNICAL DECISIONS LOG

> Every significant decision is logged here. If you want to change one, update this log with your reasoning.

| Decision | Choice | Reason | Date |
|---|---|---|---|
| Agent brain | Gemini 2.0 Flash | Free tier generous enough for dev. User brings own API key for production. | Project start |
| Wallet infrastructure | Privy | Embedded wallets + external wallets in one SDK. Supports EVM and Stellar. Free up to 1k MAW/month. | Project start |
| USDC bridge | Circle CCTP V2 | Native burn-and-mint. No wrapped tokens. Covers Base, Celo, ETH, Stellar natively. | Project start |
| Non-USDC routing | LI.FI SDK | Single integration covers all bridging and swap cases. No need to build custom routing. | Project start |
| EVM interaction | viem + wagmi | Modern standard. Type-safe. Faster than ethers.js. | Project start |
| Phase 1 chains | Base, Celo, ETH, Stellar | All have native USDC via CCTP V2. Stellar adds African payment corridor (MoneyGram offramp). | Project start |
| Monetisation | None yet (Phase 2) | Build the product first. Future: Circle Bridge Kit revenue module + x402 micropayments. | Project start |
| Flow execution | User always signs | Automata never holds funds. Agent builds unsigned txs, user signs via Privy. | Project start |
| Language | Plain English only | No blockchain jargon in the UI. Never say "gas", "bridge", "sign a transaction". | Project start |

---

## 🌍 ENVIRONMENT VARIABLES REFERENCE

```bash
# ── BACKEND (backend/.env) ──────────────────────────────────────
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/automata
ENCRYPTION_SECRET=                    # 32-char random string for encrypting user API keys

# RPC endpoints (get free ones from Alchemy or Infura)
BASE_RPC_URL=https://mainnet.base.org
CELO_RPC_URL=https://forno.celo.org
ETH_RPC_URL=https://eth.llamarpc.com
STELLAR_HORIZON_URL=https://horizon.stellar.org

# Circle (get from https://developers.circle.com)
CIRCLE_API_KEY=

# LI.FI (get from https://li.fi — free tier available)
LIFI_API_KEY=

# CORS
CORS_ORIGIN=http://localhost:3000

# ── FRONTEND (frontend/.env.local) ──────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PRIVY_APP_ID=             # from https://privy.io dashboard
NEXT_PUBLIC_BASE_CHAIN_ID=8453
NEXT_PUBLIC_CELO_CHAIN_ID=42220
NEXT_PUBLIC_ETH_CHAIN_ID=1
```

---

## 🔗 DEPLOYED ADDRESSES

> Updated by Dev 1 after every deployment. Leave blank until deployed.

| Contract | Network | Address | Deployed At |
|---|---|---|---|
| None in Phase 1 | — | — | — |

---

## 📍 CURRENT POSITION

```
PHASE:   0 — Pre-Setup
STEP:    0.0 — Not started
STATUS:  NOT STARTED

Dev 1 is working on: Nothing yet
Dev 2 is working on: Nothing yet

Last update: [timestamp]
Next sync checkpoint: End of Phase 1
```

> Update this block after EVERY completed task. This is how LLMs and teammates know where to pick up.

---
---

# ════════════════════════════════════════════════════════
# PHASE 0 — ACCOUNTS, TOOLS & PREREQUISITES
# One-time setup · Both devs · Est. 2–3 hours
# ════════════════════════════════════════════════════════

> **Goal:** Both developers have every account, tool, and credential they need before writing a single line of code. Do not skip this phase. Missing credentials mid-build will waste hours.

---

## PHASE 0 — CHECKLIST

### Step 0.1 — Create all required accounts

These are free. Do them all now.

- [ ] **GitHub** — https://github.com/signup
  - Create a new repository called `automata`
  - Set it to private for now
  - Add both devs as collaborators (Settings → Collaborators)
  - Clone the repo to both machines: `git clone https://github.com/YOUR_USERNAME/automata.git`

- [ ] **Google AI Studio (Gemini API)** — https://aistudio.google.com
  - Sign in with Google
  - Click "Get API Key" → Create API key
  - Save it somewhere safe — this is your **personal dev key** for testing
  - Note: In production, each user provides their own key. This is just for development.
  - Free tier gives you 1,500 requests/day with Gemini 2.0 Flash — more than enough for development

- [ ] **Privy** — https://privy.io
  - Click "Get started"
  - Create a new app called "Automata"
  - Copy your **App ID** from the dashboard
  - In settings, enable: Email login, Google login, MetaMask, WalletConnect
  - Under "Embedded Wallets", enable: Create on login, Support EVM chains, Support Stellar
  - Save your App ID in a text file — you'll need it for `.env.local`

- [ ] **Circle Developer Account** — https://developers.circle.com
  - Sign up for a free developer account
  - Go to API Keys → Create a new API key
  - Select "Testnet" for now
  - Save the API key — you'll need it for `backend/.env`

- [ ] **LI.FI API Key** — https://li.fi/contact-us (or use without key for development)
  - For development you can use LI.FI without an API key (rate limited but works)
  - For production, fill out their contact form to get a key
  - Note in this file whether you have a key or are using the free tier

- [ ] **Alchemy** — https://alchemy.com
  - Sign up free
  - Create 3 apps: one for Base, one for Ethereum, one for Celo
  - Copy the HTTPS RPC URL for each
  - These replace the default public RPC URLs in your `.env` — more reliable and faster
  - Free tier: 300M compute units/month — plenty for development

- [ ] **MiniPay Developer Access** — https://docs.minipay.xyz
  - Read the Mini Apps documentation completely bef
ore Dev 2 starts Phase 3
  - Note any specific requirements for Mini App submission here: `MINIPAY NOTES: ___________`

```
DONE WHEN: All accounts created. All API keys saved securely. Both devs have access to the GitHub repo.
```

---

### Step 0.2 — Install tools on both machines

Run each command. If something fails, Google the error — most are easy fixes.

- [ ] **Node.js** — https://nodejs.org
  - Install Node.js v20 LTS (Long Term Support) — do NOT install the "Current" version
  - Verify: `node --version` → should show `v20.x.x`
  - Verify: `npm --version` → should show `10.x.x`

- [ ] **Git**
  - Mac: `brew install git` (if you don't have Homebrew: https://brew.sh)
  - Windows: download from https://git-scm.com
  - Linux: `sudo apt install git`
  - Verify: `git --version`

- [ ] **VS Code** — https://code.visualstudio.com
  - Install these extensions:
    - ESLint
    - Prettier
    - Tailwind CSS IntelliSense
    - Prisma
    - GitLens
    - Thunder Client (for testing API endpoints without Postman)

- [ ] **PostgreSQL** — https://postgresql.org/download
  - Mac: `brew install postgresql@16 && brew services start postgresql@16`
  - Windows: Download the installer from the website
  - Linux: `sudo apt install postgresql postgresql-contrib`
  - Verify: `psql --version`
  - Create the database: `createdb automata`

- [ ] **MetaMask browser extension** — https://metamask.io
  - Install on Chrome or Brave
  - Create a new wallet (or use existing)
  - **Important:** Add these networks to MetaMask manually:
    - **Base Mainnet:** RPC: `https://mainnet.base.org`, Chain ID: `8453`, Symbol: `ETH`
    - **Celo Mainnet:** RPC: `https://forno.celo.org`, Chain ID: `42220`, Symbol: `CELO`
  - You will need a small amount of ETH on Base and CELO on Celo for gas during testing
  - Get testnet funds first (see Step 0.3)

```
DONE WHEN: node --version works. psql works. MetaMask installed with Base and Celo networks added.
```

---

### Step 0.3 — Get testnet funds for development

You need fake money to test with. These are all free.

- [ ] **Base Sepolia (testnet ETH for Base)**
  - Go to https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
  - Or https://faucet.quicknode.com/base/sepolia
  - Paste your MetaMask wallet address
  - Receive 0.1 testnet ETH — enough for hundreds of test transactions

- [ ] **Celo Alfajores testnet (testnet CELO)**
  - Go to https://faucet.celo.org/alfajores
  - Paste your MetaMask wallet address
  - Receive testnet CELO

- [ ] **Testnet USDC on Base Sepolia**
  - Go to https://faucet.circle.com
  - Select "Base Sepolia"
  - Paste your address
  - Receive testnet USDC

- [ ] **Stellar testnet (testnet XLM)**
  - Go to https://laboratory.stellar.org/#account-creator?network=test
  - Click "Generate keypair" then "Fund test account"
  - Save the public key (starts with G) and secret key (starts with S) — the secret key is your Stellar test wallet
  - **NEVER share or commit the secret key**

```
DONE WHEN: You have testnet funds on Base Sepolia, Celo Alfajores, and Stellar testnet. You can see balances in MetaMask and Stellar Laboratory.
```

---

## PHASE 0 — SYNC CHECKPOINT ⬛

Before moving to Phase 1, confirm all of these:

- [ ] Dev 1: All accounts created and API keys saved
- [ ] Dev 1: Node.js v20, Git, PostgreSQL installed
- [ ] Dev 2: All accounts created
- [ ] Dev 2: Node.js v20, Git, VS Code with extensions installed
- [ ] Both: GitHub repo cloned on both machines
- [ ] Both: MetaMask has Base and Celo networks added
- [ ] Both: Testnet funds received and visible
- [ ] Both: Updated `## 📍 CURRENT POSITION` to Phase 1

---
---

# ════════════════════════════════════════════════════════
# PHASE 1 — MONOREPO SETUP & SCAFFOLD
# Both devs · Est. 3–4 hours
# ════════════════════════════════════════════════════════

> **Goal:** A working monorepo with three workspaces (frontend, backend, shared). Every package installs. Every dev server starts. Nothing crashes. After this phase, you have a solid foundation to build on.

---

## PHASE 1 — DEV 1 TASKS (Backend Scaffold)

### Step 1.1 — Create the monorepo root structure

Every command below is run from the root `automata/` folder (the one you cloned from GitHub).

- [ ] Create the root `package.json` by running:
  ```bash
  npm init -y
  ```

- [ ] Open the newly created `package.json` and replace its entire content with:
  ```json
  {
    "name": "automata",
    "version": "1.0.0",
    "private": true,
    "workspaces": ["frontend", "backend", "shared"],
    "scripts": {
      "dev:backend": "npm run dev --workspace=backend",
      "dev:frontend": "npm run dev --workspace=frontend"
    }
  }
  ```

- [ ] Create the folder structure:
  ```bash
  mkdir -p backend/src/agent
  mkdir -p backend/src/adapters
  mkdir -p backend/src/services
  mkdir -p backend/src/api
  mkdir -p backend/src/utils
  mkdir -p shared/types
  mkdir -p scripts
  ```

- [ ] Create the root `.gitignore` file. Create a file called `.gitignore` in the root folder with this content:
  ```
  node_modules/
  .env
  .env.local
  dist/
  .next/
  .DS_Store
  *.log
  prisma/migrations/
  ```

- [ ] Commit and push what you have:
  ```bash
  git add .
  git commit -m "chore: monorepo root structure"
  git push
  ```

```
DONE WHEN: The folder structure exists. package.json has workspaces defined. .gitignore committed.
```

---

### Step 1.2 — Set up the backend workspace

All commands in this step are run from the `backend/` folder: `cd backend`

- [ ] Initialise the backend package:
  ```bash
  npm init -y
  ```

- [ ] Open `backend/package.json` and replace it with:
  ```json
  {
    "name": "backend",
    "version": "1.0.0",
    "main": "dist/index.js",
    "scripts": {
      "dev": "nodemon src/index.ts",
      "build": "tsc",
      "start": "node dist/index.js"
    }
  }
  ```

- [ ] Install all runtime dependencies:
  ```bash
  npm install express cors dotenv zod ws
  npm install @google/generative-ai
  npm install @lifi/sdk
  npm install viem
  npm install @stellar/stellar-sdk
  npm install @prisma/client
  ```
  > This will take 2-5 minutes. Wait for it to finish completely.

- [ ] Install all development dependencies:
  ```bash
  npm install -D typescript ts-node nodemon
  npm install -D @types/express @types/node @types/ws @types/cors
  npm install -D prisma
  ```

- [ ] Create `backend/tsconfig.json` — this tells TypeScript how to compile your code:
  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "module": "commonjs",
      "lib": ["ES2020"],
      "outDir": "./dist",
      "rootDir": "./src",
      "strict": true,
      "esModuleInterop": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "resolveJsonModule": true
    },
    "include": ["src/**/*"],
    "exclude": ["node_modules", "dist"]
  }
  ```

- [ ] Create `backend/.env` — copy the template from the Environment Variables section above and fill in what you have so far. Leave blank fields blank for now.

- [ ] Create `backend/src/index.ts` — this is the entry point for the backend server:
  ```typescript
  import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';

  dotenv.config();

  const app = express();
  const PORT = process.env.PORT ?? 3001;

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
  app.use(express.json());

  // Health check — always the first route
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.listen(PORT, () => {
    console.log(`Automata backend running on port ${PORT}`);
  });
  ```

- [ ] Start the backend to verify it works:
  ```bash
  npm run dev
  ```
  Open a new terminal tab and run:
  ```bash
  curl http://localhost:3001/health
  ```
  You should see: `{"status":"ok","timestamp":"..."}`. If you do, it works.

- [ ] Stop the server (Ctrl+C) and commit:
  ```bash
  git add .
  git commit -m "feat: backend scaffold with health endpoint"
  git push
  ```

```
DONE WHEN: curl http://localhost:3001/health returns {"status":"ok"}
```

---

### Step 1.3 — Set up Prisma (database)

Run all commands from the `backend/` folder.

- [ ] Initialise Prisma:
  ```bash
  npx prisma init
  ```
  This creates a `prisma/` folder with a `schema.prisma` file.

- [ ] Open `prisma/schema.prisma` and replace its content with:
  ```prisma
  generator client {
    provider = "prisma-client-js"
  }

  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }

  model User {
    id            String   @id @default(cuid())
    walletAddress String   @unique
    encryptedApiKey String?
    agentMode     String   @default("assisted") // "assisted" or "autonomous"
    createdAt     DateTime @default(now())
    updatedAt     DateTime @updatedAt
    flows         Flow[]
    sessions      Session[]
  }

  model Flow {
    id          String   @id @default(cuid())
    userId      String
    user        User     @relation(fields: [userId], references: [id])
    name        String
    description String?
    actions     Json     // stores the array of Action objects
    createdAt   DateTime @default(now())
    updatedAt   DateTime @updatedAt
  }

  model Session {
    id        String   @id @default(cuid())
    userId    String
    user      User     @relation(fields: [userId], references: [id])
    history   Json     // stores the conversation history array
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }

  model Transaction {
    id            String   @id @default(cuid())
    walletAddress String
    txHash        String?
    chainId       String
    actionType    String   // SWAP, BRIDGE, STAKE, TRANSFER
    status        String   // pending, confirmed, failed
    details       Json
    createdAt     DateTime @default(now())
  }
  ```

- [ ] Make sure your `DATABASE_URL` in `.env` is correct. If you ran `createdb automata` earlier, the URL is:
  ```
  DATABASE_URL=postgresql://YOUR_MAC_USERNAME@localhost:5432/automata
  ```
  On Mac, your username is what you see in Terminal before the `$`. On Linux/Windows, adjust accordingly.

- [ ] Run the database migration (this creates the tables):
  ```bash
  npx prisma migrate dev --name init
  ```
  You should see "Your database is now in sync with your schema."

- [ ] Verify the database works:
  ```bash
  npx prisma studio
  ```
  This opens a browser tab showing your empty database tables. If you see the tables (User, Flow, Session, Transaction), everything is working. Close it when done.

```
DONE WHEN: npx prisma migrate dev succeeds. Tables visible in Prisma Studio.
```

---

### Step 1.4 — Create shared types

Run from the `shared/` folder: `cd ../shared`

- [ ] Initialise the shared package:
  ```bash
  npm init -y
  ```

- [ ] Create `shared/types/Action.ts`:
  ```typescript
  // The type for a single action in a flow
  export type ActionType = 'SWAP' | 'BRIDGE' | 'STAKE' | 'TRANSFER';

  export type ChainId = 'base' | 'celo' | 'ethereum' | 'stellar';

  export type Action = {
    type: ActionType;
    // Which chain this action happens on
    sourceChain: ChainId;
    // For BRIDGE actions, the destination chain
    destinationChain?: ChainId;
    // Token symbol to spend (e.g. "USDC", "ETH")
    fromToken: string;
    // Token symbol to receive (e.g. "XLM", "cKES")
    toToken: string;
    // Amount as a string to avoid floating point issues (e.g. "100.00")
    amount: string;
    // Optional: specific protocol to use (e.g. "aave", "mento")
    protocol?: string;
  };

  export type AgentPlan = {
    steps: PlanStep[];
    totalEstimatedFeeUSD: string;
    estimatedTimeSeconds: number;
    warnings: string[];
  };

  export type PlanStep = {
    stepNumber: number;
    description: string; // plain English description shown to user
    action: Action;
    estimatedFeeUSD: string;
    estimatedTimeSeconds: number;
  };

  export type ExecuteRequest = {
    intent?: string;          // for chat mode: the user's typed message
    actions?: Action[];       // for flow builder mode: the configured actions
    walletAddress: string;
    mode: 'assisted' | 'autonomous';
    geminiApiKey: string;     // user's own Gemini API key, encrypted
  };

  export type ExecuteResponse = {
    plan: AgentPlan;
    unsignedTransactions: UnsignedTx[];
    sessionId: string;
  };

  export type UnsignedTx = {
    chainId: ChainId;
    to: string;
    data: string;
    value: string;
    description: string; // shown to user in the signing prompt
  };
  ```

- [ ] Create `shared/types/index.ts`:
  ```typescript
  export * from './Action';
  ```

```
DONE WHEN: shared/types/Action.ts exists and exports all types without TypeScript errors.
```

---

## PHASE 1 — DEV 2 TASKS (Frontend Scaffold)

### Step 1.5 — Create the Next.js frontend

Run from the `automata/` root folder.

- [ ] Create the Next.js app:
  ```bash
  npx create-next-app@latest frontend --typescript --tailwind --app --no-git --no-src-dir
  ```
  When prompted, answer:
  - Would you like to use ESLint? → **Yes**
  - Would you like to use `src/` directory? → **No**
  - Would you like to use import alias? → **Yes** (keep the default `@/*`)

- [ ] Move into the frontend folder: `cd frontend`

- [ ] Install UI and animation libraries:
  ```bash
  npm install framer-motion lucide-react reactflow
  ```

- [ ] Install shadcn/ui:
  ```bash
  npx shadcn-ui@latest init
  ```
  When prompted:
  - Which style would you like to use? → **Default**
  - Which color would you like to use as base color? → **Slate**
  - Would you like to use CSS variables? → **Yes**

- [ ] Install the shadcn components you'll need:
  ```bash
  npx shadcn-ui@latest add button card badge toast dialog tooltip select input skeleton tabs sheet
  ```
  > This installs each component as actual code in your project (in `components/ui/`) so you can customise them completely.

- [ ] Install Privy for wallet connection:
  ```bash
  npm install @privy-io/react-auth @privy-io/wagmi
  npm install wagmi viem @tanstack/react-query
  npm install @stellar/stellar-sdk
  ```

- [ ] Create `frontend/.env.local` — copy from the Environment Variables section above and fill in your Privy App ID.

- [ ] Open `frontend/app/globals.css`. Find the `:root` section and add the Automata design tokens INSIDE the `:root` block (after the existing variables):
  ```css
  :root {
    /* existing shadcn variables stay here */

    /* Automata design tokens */
    --bg-primary: #0F0F1A;
    --bg-secondary: #1A1A2E;
    --bg-card: #16213E;
    --accent-pink: #E91E8C;
    --accent-purple: #6A0DAD;
    --accent-glow: rgba(233, 30, 140, 0.3);
    --text-primary: #FFFFFF;
    --text-muted: #888888;
    --border-subtle: rgba(255, 255, 255, 0.08);
    --success: #22C55E;
    --warning: #F59E0B;
    --error: #EF4444;
  }
  ```

  Also update the `body` style in globals.css:
  ```css
  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
  ```

- [ ] Replace `frontend/app/page.tsx` entirely with this placeholder (you'll build the real landing page in Phase 3):
  ```tsx
  export default function HomePage() {
    return (
      <main style={{ padding: '2rem', color: 'white' }}>
        <h1>Automata</h1>
        <p>Cross-Chain AI Agent Platform — coming soon</p>
      </main>
    );
  }
  ```

- [ ] Start the frontend dev server to verify:
  ```bash
  npm run dev
  ```
  Open http://localhost:3000 — you should see "Automata" on a dark background. Zero console errors.

- [ ] Commit:
  ```bash
  git add .
  git commit -m "feat: frontend scaffold with Next.js + shadcn + Privy"
  git push
  ```

```
DONE WHEN: localhost:3000 shows "Automata" on a dark background. Zero console errors in browser devtools.
```

---

### Step 1.6 — Set up Privy Provider

This wraps your entire app so every page has access to wallet functionality.

- [ ] Create `frontend/app/providers.tsx`:
  ```tsx
  'use client';

  import { PrivyProvider } from '@privy-io/react-auth';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { base, celo, mainnet } from 'viem/chains';

  const queryClient = new QueryClient();

  export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          config={{
            loginMethods: ['email', 'google', 'wallet'],
            appearance: {
              theme: 'dark',
              accentColor: '#E91E8C',
            },
            embeddedWallets: {
              createOnLogin: 'all-users',
            },
            supportedChains: [base, celo, mainnet],
          }}
        >
          {children}
        </PrivyProvider>
      </QueryClientProvider>
    );
  }
  ```

- [ ] Open `frontend/app/layout.tsx` and update it to use the Providers:
  ```tsx
  import type { Metadata } from 'next';
  import './globals.css';
  import { Providers } from './providers';

  export const metadata: Metadata = {
    title: 'Automata — Cross-Chain AI Agent',
    description: 'Swap, bridge, and stake across any chain. In plain English.',
  };

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    );
  }
  ```

- [ ] Create the page folder structure for all routes:
  ```bash
  mkdir -p app/chat
  mkdir -p app/build
  mkdir -p app/history
  mkdir -p app/settings
  ```

- [ ] Create a placeholder `page.tsx` in each folder. For each one, create a file like this (changing the title):
  ```tsx
  // app/chat/page.tsx
  export default function ChatPage() {
    return <div style={{ color: 'white', padding: '2rem' }}>Chat — coming soon</div>;
  }
  ```
  Do the same for `/build`, `/history`, `/settings`.

- [ ] Verify all routes work by visiting each one in the browser:
  - http://localhost:3000/chat
  - http://localhost:3000/build
  - http://localhost:3000/history
  - http://localhost:3000/settings

```
DONE WHEN: All 5 routes load without errors. Privy Provider wraps the app.
```

---

## PHASE 1 — SYNC CHECKPOINT ⬛

Both devs confirm all of these before moving to Phase 2:

- [ ] Dev 1: `curl http://localhost:3001/health` returns `{"status":"ok"}`
- [ ] Dev 1: `npx prisma migrate dev` ran successfully
- [ ] Dev 1: All 4 database tables visible in Prisma Studio
- [ ] Dev 2: `localhost:3000` loads with dark background, zero console errors
- [ ] Dev 2: All 5 routes accessible (`/`, `/chat`, `/build`, `/history`, `/settings`)
- [ ] Dev 2: Privy provider wraps the app
- [ ] Both: Same GitHub repo, both have pushed at least one commit
- [ ] Both: `.env` and `.env.local` are NOT committed (check `.gitignore`)
- [ ] Both: Updated `## 📍 CURRENT POSITION` to Phase 2

---
---

# ════════════════════════════════════════════════════════
# PHASE 2 — AGENT CORE & CHAIN ADAPTERS
# Dev 1 leads · Est. 6–8 hours
# ════════════════════════════════════════════════════════

> **Goal:** A working AI agent that can receive an intent, call tools, and return a valid execution plan. The chain adapters can build unsigned transactions for all four chains. The backend API returns real data.

---

## PHASE 2 — DEV 1 TASKS

### Step 2.1 — Create the agent system prompt

This is the most important file in the backend. It defines what the agent is, what it can do, and what it must never do.

- [ ] Create `backend/src/agent/prompts.ts`:
  ```typescript
  export const SYSTEM_PROMPT = `
  You are the Automata agent — an AI assistant that helps users move, swap, and grow their money across multiple blockchains.

  ## YOUR PERSONALITY
  - You speak plain English. Never use blockchain jargon.
  - Say "move" not "bridge". Say "confirm" not "sign a transaction". Say "transfer fee" not "gas fee".
  - Be concise and direct. Users want to get things done, not read essays.
  - Be honest about fees and risks before executing anything.

  ## WHAT YOU CAN DO
  You have access to these tools:
  - get_balances: check the user's token balances across all chains
  - get_route: find the best route to move or swap assets
  - get_yield_rates: find the best yield rates for stablecoins
  - build_bridge_tx: build a USDC bridge transaction (Base ↔ Celo ↔ ETH ↔ Stellar)
  - build_swap_tx: build a token swap on a DEX
  - build_stake_tx: build a deposit into a yield protocol
  - build_transfer_tx: build a simple token transfer to an address
  - estimate_fees: estimate the total fees for a set of actions
  - resolve_recipient: resolve a phone number or ENS name to a wallet address
  - monitor_tx: check the status of a submitted transaction

  ## SUPPORTED CHAINS
  - Base (chainId: 8453) — cheap, fast, good for DeFi
  - Celo (chainId: 42220) — mobile-friendly, great for stablecoins and payments
  - Ethereum (chainId: 1) — largest DeFi ecosystem, higher fees
  - Stellar (network: mainnet) — best for cross-border payments, XLM, offramp to 475k+ MoneyGram locations

  ## SUPPORTED TOKENS (not exhaustive)
  - USDC: native on Base, Celo, ETH, Stellar via Circle CCTP V2
  - XLM: Stellar native token
  - cUSD, cKES: Celo stablecoins (swappable via Mento)
  - ETH: Ethereum and Base native token
  - CELO: Celo native token
  - Any ERC-20 token with sufficient liquidity on LI.FI

  ## SAFETY RULES — NEVER VIOLATE THESE
  1. Never request, store, or handle private keys or seed phrases
  2. Never execute a transaction — only build unsigned transactions for the user to sign
  3. In assisted mode: always show the full plan with fees before building any transactions
  4. Always warn the user if: fees exceed 5% of the transaction value, slippage is above 1%, or the payload seems unusual
  5. Never send funds to an address you cannot verify
  6. If you are unsure about anything, ask the user to clarify rather than guessing

  ## RESPONSE FORMAT
  - In assisted mode: respond with a clear plan in plain English, then call estimate_fees, then wait for approval
  - In autonomous mode: proceed with tool calls directly, summarise what you did at the end
  - Always end with a clear summary of what happened or what the user needs to do next
  `;
  ```

```
DONE WHEN: File created. Read it carefully — this defines everything the agent is allowed to do.
```

---

### Step 2.2 — Define the agent tools

- [ ] Create `backend/src/agent/tools.ts`:
  ```typescript
  import { Tool } from '@google/generative-ai';

  // This is the list of tools the agent can call.
  // Each tool has a name, description, and a schema for its parameters.
  // Gemini reads these and decides when to call them.

  export const AGENT_TOOLS: Tool[] = [
    {
      functionDeclarations: [
        {
          name: 'get_balances',
          description: 'Get the token balances for a wallet address across all supported chains (Base, Celo, Ethereum, Stellar). Call this when the user asks about their balance or before planning any transaction.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              walletAddress: { type: 'STRING' as any, description: 'The wallet address to check (0x... for EVM, G... for Stellar)' },
            },
            required: ['walletAddress'],
          },
        },
        {
          name: 'get_route',
          description: 'Find the best route to move or swap assets. Use this before building any bridge or swap transaction.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              fromChain: { type: 'STRING' as any, description: 'Source chain: base, celo, ethereum, or stellar' },
              toChain: { type: 'STRING' as any, description: 'Destination chain: base, celo, ethereum, or stellar' },
              fromToken: { type: 'STRING' as any, description: 'Token to send (e.g. USDC, ETH)' },
              toToken: { type: 'STRING' as any, description: 'Token to receive (e.g. XLM, cKES)' },
              amount: { type: 'STRING' as any, description: 'Amount to send as a string (e.g. "100.00")' },
              walletAddress: { type: 'STRING' as any, description: 'The sender wallet address' },
            },
            required: ['fromChain', 'toChain', 'fromToken', 'toToken', 'amount', 'walletAddress'],
          },
        },
        {
          name: 'get_yield_rates',
          description: 'Get current yield rates (APY) for stablecoins on supported protocols. Call this when the user wants to earn yield or find the best place to stake.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              chain: { type: 'STRING' as any, description: 'Chain to check: base, celo, ethereum, or stellar' },
              token: { type: 'STRING' as any, description: 'Token to check yield for (e.g. USDC, cUSD)' },
            },
            required: ['chain', 'token'],
          },
        },
        {
          name: 'build_bridge_tx',
          description: 'Build an unsigned USDC bridge transaction using Circle CCTP V2. Only for USDC. For other tokens use build_swap_tx with LI.FI.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              fromChain: { type: 'STRING' as any, description: 'Source chain' },
              toChain: { type: 'STRING' as any, description: 'Destination chain' },
              amount: { type: 'STRING' as any, description: 'Amount of USDC to bridge' },
              walletAddress: { type: 'STRING' as any, description: 'Sender wallet address' },
              recipientAddress: { type: 'STRING' as any, description: 'Recipient address (can be same as sender)' },
            },
            required: ['fromChain', 'toChain', 'amount', 'walletAddress', 'recipientAddress'],
          },
        },
        {
          name: 'build_swap_tx',
          description: 'Build an unsigned swap or cross-chain transaction using LI.FI. Use for non-USDC assets or when CCTP is not available.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              routeId: { type: 'STRING' as any, description: 'Route ID returned by get_route' },
              walletAddress: { type: 'STRING' as any, description: 'Sender wallet address' },
            },
            required: ['routeId', 'walletAddress'],
          },
        },
        {
          name: 'build_stake_tx',
          description: 'Build an unsigned transaction to deposit tokens into a yield protocol (Aave on Base/ETH, Mento on Celo).',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              chain: { type: 'STRING' as any, description: 'Chain where the protocol is' },
              protocol: { type: 'STRING' as any, description: 'Protocol name: aave or mento' },
              token: { type: 'STRING' as any, description: 'Token to deposit' },
              amount: { type: 'STRING' as any, description: 'Amount to deposit' },
              walletAddress: { type: 'STRING' as any, description: 'Wallet address making the deposit' },
            },
            required: ['chain', 'protocol', 'token', 'amount', 'walletAddress'],
          },
        },
        {
          name: 'build_transfer_tx',
          description: 'Build an unsigned simple token transfer to another address.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              chain: { type: 'STRING' as any, description: 'Chain to send on' },
              token: { type: 'STRING' as any, description: 'Token to send' },
              amount: { type: 'STRING' as any, description: 'Amount to send' },
              fromAddress: { type: 'STRING' as any, description: 'Sender address' },
              toAddress: { type: 'STRING' as any, description: 'Recipient address' },
            },
            required: ['chain', 'token', 'amount', 'fromAddress', 'toAddress'],
          },
        },
        {
          name: 'estimate_fees',
          description: 'Estimate the total fees for a set of planned actions. Always call this before showing the plan to the user in assisted mode.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              actions: {
                type: 'ARRAY' as any,
                description: 'Array of planned actions',
                items: { type: 'OBJECT' as any },
              },
            },
            required: ['actions'],
          },
        },
        {
          name: 'resolve_recipient',
          description: 'Resolve a human-readable identifier (phone number or ENS name) to a blockchain wallet address.',
          parameters: {
            type: 'OBJECT' as any,
            properties: {
              identifier: { type: 'STRING' as any, description: 'Phone number (e.g. +2341234567890) or ENS name (e.g. vitalik.eth)' },
            },
            required: ['identifier'],
          },
        },
      ],
    },
  ];
  ```

```
DONE WHEN: File created without TypeScript errors. Review every tool name — these are what Gemini will call.
```

---

### Step 2.3 — Build the agent loop

This is the core of the entire backend. It handles the conversation with Gemini, executes tool calls, and returns a plan or result.

- [ ] Create `backend/src/agent/agent.ts`:
  ```typescript
  import { GoogleGenerativeAI, FunctionCall } from '@google/generative-ai';
  import { SYSTEM_PROMPT } from './prompts';
  import { AGENT_TOOLS } from './tools';
  import { executeTool } from './toolExecutor';

  export type Message = {
    role: 'user' | 'model';
    parts: { text?: string; functionCall?: FunctionCall; functionResponse?: any }[];
  };

  export async function runAgent(
    userMessage: string,
    walletAddress: string,
    geminiApiKey: string,
    conversationHistory: Message[] = []
  ): Promise<{ response: string; updatedHistory: Message[]; unsignedTxs: any[] }> {

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
    });

    const history = [...conversationHistory];
    const unsignedTxs: any[] = [];

    // Add user message to history
    history.push({
      role: 'user',
      parts: [{ text: userMessage }],
    });

    // Start the chat with history
    const chat = model.startChat({ history: history.slice(0, -1) });

    // Send the latest message
    let result = await chat.sendMessage(userMessage);
    let response = result.response;

    // Tool-use loop — keep running until the model stops calling tools
    while (true) {
      const functionCalls = response.functionCalls();

      if (!functionCalls || functionCalls.length === 0) {
        // No more tool calls — we have the final response
        break;
      }

      // Execute each tool call
      const toolResults = [];
      for (const call of functionCalls) {
        console.log(`Agent calling tool: ${call.name}`, call.args);
        const toolResult = await executeTool(call.name, call.args as any, walletAddress);

        // Collect any unsigned transactions the tool built
        if (toolResult.unsignedTx) {
          unsignedTxs.push(toolResult.unsignedTx);
        }

        toolResults.push({
          functionResponse: {
            name: call.name,
            response: toolResult.data,
          },
        });
      }

      // Send tool results back to the model
      result = await chat.sendMessage(toolResults);
      response = result.response;
    }

    const finalText = response.text();

    // Add model response to history
    history.push({
      role: 'model',
      parts: [{ text: finalText }],
    });

    return {
      response: finalText,
      updatedHistory: history,
      unsignedTxs,
    };
  }
  ```

```
DONE WHEN: File created. Note: toolExecutor.ts is built in the next step.
```

---

### Step 2.4 — Build the tool executor

This file receives tool call requests from the agent and routes them to the right service.

- [ ] Create `backend/src/agent/toolExecutor.ts`:
  ```typescript
  import { getBalances } from '../services/balanceService';
  import { getRoute } from '../services/routeService';
  import { getYieldRates } from '../services/yieldService';
  import { buildBridgeTx } from '../services/bridgeService';
  import { buildSwapTx } from '../services/swapService';
  import { buildStakeTx } from '../services/stakeService';
  import { buildTransferTx } from '../services/transferService';
  import { estimateFees } from '../services/feeService';
  import { resolveRecipient } from '../services/resolverService';

  export async function executeTool(
    toolName: string,
    args: Record<string, any>,
    walletAddress: string
  ): Promise<{ data: any; unsignedTx?: any }> {
    try {
      switch (toolName) {
        case 'get_balances':
          return { data: await getBalances(args.walletAddress || walletAddress) };

        case 'get_route':
          return { data: await getRoute(args) };

        case 'get_yield_rates':
          return { data: await getYieldRates(args.chain, args.token) };

        case 'build_bridge_tx': {
          const result = await buildBridgeTx(args);
          return { data: result.description, unsignedTx: result.unsignedTx };
        }

        case 'build_swap_tx': {
          const result = await buildSwapTx(args);
          return { data: result.description, unsignedTx: result.unsignedTx };
        }

        case 'build_stake_tx': {
          const result = await buildStakeTx(args);
          return { data: result.description, unsignedTx: result.unsignedTx };
        }

        case 'build_transfer_tx': {
          const result = await buildTransferTx(args);
          return { data: result.description, unsignedTx: result.unsignedTx };
        }

        case 'estimate_fees':
          return { data: await estimateFees(args.actions) };

        case 'resolve_recipient':
          return { data: await resolveRecipient(args.identifier) };

        default:
          return { data: { error: `Unknown tool: ${toolName}` } };
      }
    } catch (error: any) {
      console.error(`Tool execution error (${toolName}):`, error);
      return { data: { error: error.message || 'Tool execution failed' } };
    }
  }
  ```

```
DONE WHEN: File created. The service files it imports will be built in the next steps.
```

---

### Step 2.5 — Build chain adapters (EVM)

The adapters handle all direct blockchain interaction. One file per chain.

- [ ] Create `backend/src/utils/rpc.ts` — manages RPC connections:
  ```typescript
  import { createPublicClient, createWalletClient, http } from 'viem';
  import { base, celo, mainnet } from 'viem/chains';

  export const baseClient = createPublicClient({
    chain: base,
    transport: http(process.env.BASE_RPC_URL),
  });

  export const celoClient = createPublicClient({
    chain: celo,
    transport: http(process.env.CELO_RPC_URL),
  });

  export const ethClient = createPublicClient({
    chain: mainnet,
    transport: http(process.env.ETH_RPC_URL),
  });
  ```

- [ ] Create `backend/src/adapters/evm.ts` — shared EVM utilities used by Base, Celo, and ETH adapters:
  ```typescript
  import { parseUnits, formatUnits, erc20Abi } from 'viem';
  import { baseClient, celoClient, ethClient } from '../utils/rpc';

  // EVM USDC contract addresses
  export const USDC_ADDRESSES: Record<string, `0x${string}`> = {
    base:     '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    celo:     '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  };

  export function getEvmClient(chain: string) {
    switch (chain) {
      case 'base':     return baseClient;
      case 'celo':     return celoClient;
      case 'ethereum': return ethClient;
      default: throw new Error(`Unsupported EVM chain: ${chain}`);
    }
  }

  export async function getERC20Balance(
    chain: string,
    tokenAddress: `0x${string}`,
    walletAddress: `0x${string}`
  ): Promise<string> {
    const client = getEvmClient(chain);
    const balance = await client.readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [walletAddress],
    });
    return formatUnits(balance as bigint, 6); // USDC has 6 decimals
  }

  export async function getNativeBalance(
    chain: string,
    walletAddress: `0x${string}`
  ): Promise<string> {
    const client = getEvmClient(chain);
    const balance = await client.getBalance({ address: walletAddress });
    return formatUnits(balance, 18);
  }
  ```

- [ ] Create `backend/src/adapters/stellar.ts` — Stellar chain utilities:
  ```typescript
  import StellarSdk from '@stellar/stellar-sdk';

  const server = new StellarSdk.Horizon.Server(
    process.env.STELLAR_HORIZON_URL ?? 'https://horizon.stellar.org'
  );

  // Stellar USDC issuer (Circle's official issuer)
  export const STELLAR_USDC_ISSUER = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

  export async function getStellarBalances(publicKey: string): Promise<Record<string, string>> {
    try {
      const account = await server.loadAccount(publicKey);
      const balances: Record<string, string> = {};

      for (const balance of account.balances) {
        if (balance.asset_type === 'native') {
          balances['XLM'] = balance.balance;
        } else if (
          balance.asset_type === 'credit_alphanum4' &&
          (balance as any).asset_code === 'USDC' &&
          (balance as any).asset_issuer === STELLAR_USDC_ISSUER
        ) {
          balances['USDC'] = balance.balance;
        }
      }

      return balances;
    } catch (error) {
      console.error('Stellar balance fetch error:', error);
      return {};
    }
  }

  export async function buildStellarTransfer(
    fromPublicKey: string,
    toPublicKey: string,
    asset: string,
    amount: string
  ): Promise<string> {
    // Returns an unsigned XDR transaction envelope
    const sourceAccount = await server.loadAccount(fromPublicKey);

    let stellarAsset;
    if (asset === 'XLM') {
      stellarAsset = StellarSdk.Asset.native();
    } else if (asset === 'USDC') {
      stellarAsset = new StellarSdk.Asset('USDC', STELLAR_USDC_ISSUER);
    } else {
      throw new Error(`Unsupported Stellar asset: ${asset}`);
    }

    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.PUBLIC,
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: toPublicKey,
        asset: stellarAsset,
        amount: amount,
      }))
      .setTimeout(30)
      .build();

    // Return the unsigned XDR — frontend will sign this with user's Stellar wallet
    return transaction.toXDR();
  }
  ```

```
DONE WHEN: All three adapter files created. TypeScript compiles without errors (run `npx tsc --noEmit` from backend/ to check).
```

---

### Step 2.6 — Build the core services (stubs first, then real)

Build these as stubs first (return mock data) so you can test the agent loop end-to-end. Replace with real implementations as you go.

- [ ] Create `backend/src/services/balanceService.ts`:
  ```typescript
  import { USDC_ADDRESSES, getERC20Balance, getNativeBalance } from '../adapters/evm';
  import { getStellarBalances } from '../adapters/stellar';

  export async function getBalances(walletAddress: string): Promise<Record<string, Record<string, string>>> {
    const result: Record<string, Record<string, string>> = {
      base: {},
      celo: {},
      ethereum: {},
      stellar: {},
    };

    // EVM chains (if address starts with 0x)
    if (walletAddress.startsWith('0x')) {
      const evmAddress = walletAddress as `0x${string}`;

      // Base
      result.base.ETH = await getNativeBalance('base', evmAddress);
      result.base.USDC = await getERC20Balance('base', USDC_ADDRESSES.base, evmAddress);

      // Celo
      result.celo.CELO = await getNativeBalance('celo', evmAddress);
      result.celo.USDC = await getERC20Balance('celo', USDC_ADDRESSES.celo, evmAddress);

      // Ethereum
      result.ethereum.ETH = await getNativeBalance('ethereum', evmAddress);
      result.ethereum.USDC = await getERC20Balance('ethereum', USDC_ADDRESSES.ethereum, evmAddress);
    }

    // Stellar (if address starts with G)
    // Note: In a real app, users would connect a separate Stellar address
    // For now we return empty unless a Stellar address is provided
    if (walletAddress.startsWith('G')) {
      result.stellar = await getStellarBalances(walletAddress);
    }

    return result;
  }
  ```

- [ ] Create `backend/src/services/routeService.ts` (stub — real LI.FI integration in Phase 2 Step 2.7):
  ```typescript
  export async function getRoute(args: {
    fromChain: string;
    toChain: string;
    fromToken: string;
    toToken: string;
    amount: string;
    walletAddress: string;
  }): Promise<any> {
    // TODO: Replace with real LI.FI SDK call in Step 2.7
    return {
      routeId: 'mock-route-id',
      fromChain: args.fromChain,
      toChain: args.toChain,
      fromToken: args.fromToken,
      toToken: args.toToken,
      amount: args.amount,
      estimatedOutput: args.amount, // mock 1:1
      estimatedFeeUSD: '0.50',
      estimatedTimeSeconds: 60,
      bridge: 'CCTP V2',
    };
  }
  ```

- [ ] Create `backend/src/services/yieldService.ts` (stub):
  ```typescript
  export async function getYieldRates(chain: string, token: string): Promise<any> {
    // TODO: Replace with real on-chain reads in Phase 2 Step 2.8
    const mockRates: Record<string, Record<string, number>> = {
      base:     { USDC: 5.2 },
      celo:     { USDC: 6.8, cUSD: 4.1 },
      ethereum: { USDC: 4.9 },
    };
    return {
      chain,
      token,
      rates: [
        { protocol: chain === 'celo' ? 'Mento' : 'Aave', apy: mockRates[chain]?.[token] ?? 4.0 },
      ],
    };
  }
  ```

- [ ] Create `backend/src/services/bridgeService.ts` (stub):
  ```typescript
  export async function buildBridgeTx(args: any): Promise<{ description: string; unsignedTx: any }> {
    // TODO: Replace with real Circle CCTP V2 call in Phase 2 Step 2.9
    return {
      description: `Bridge ${args.amount} USDC from ${args.fromChain} to ${args.toChain}`,
      unsignedTx: {
        chainId: args.fromChain,
        to: '0x0000000000000000000000000000000000000000', // mock
        data: '0x',
        value: '0',
        description: `Bridge ${args.amount} USDC from ${args.fromChain} to ${args.toChain}`,
      },
    };
  }
  ```

- [ ] Create `backend/src/services/swapService.ts` (stub):
  ```typescript
  export async function buildSwapTx(args: any): Promise<{ description: string; unsignedTx: any }> {
    return {
      description: `Swap via LI.FI route ${args.routeId}`,
      unsignedTx: { chainId: 'base', to: '0x0', data: '0x', value: '0', description: 'Swap' },
    };
  }
  ```

- [ ] Create `backend/src/services/stakeService.ts` (stub):
  ```typescript
  export async function buildStakeTx(args: any): Promise<{ description: string; unsignedTx: any }> {
    return {
      description: `Deposit ${args.amount} ${args.token} into ${args.protocol} on ${args.chain}`,
      unsignedTx: { chainId: args.chain, to: '0x0', data: '0x', value: '0', description: `Stake on ${args.protocol}` },
    };
  }
  ```

- [ ] Create `backend/src/services/transferService.ts` (stub):
  ```typescript
  import { parseUnits, encodeFunctionData, erc20Abi } from 'viem';
  import { USDC_ADDRESSES } from '../adapters/evm';

  export async function buildTransferTx(args: any): Promise<{ description: string; unsignedTx: any }> {
    if (args.token === 'USDC' && args.chain !== 'stellar') {
      const usdcAddress = USDC_ADDRESSES[args.chain];
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'transfer',
        args: [args.toAddress as `0x${string}`, parseUnits(args.amount, 6)],
      });
      return {
        description: `Transfer ${args.amount} USDC to ${args.toAddress} on ${args.chain}`,
        unsignedTx: {
          chainId: args.chain,
          to: usdcAddress,
          data,
          value: '0',
          description: `Send ${args.amount} USDC`,
        },
      };
    }
    // Fallback stub for other tokens
    return {
      description: `Transfer ${args.amount} ${args.token} to ${args.toAddress}`,
      unsignedTx: { chainId: args.chain, to: args.toAddress, data: '0x', value: '0', description: 'Transfer' },
    };
  }
  ```

- [ ] Create `backend/src/services/feeService.ts` (stub):
  ```typescript
  export async function estimateFees(actions: any[]): Promise<any> {
    const perActionFee = 0.30;
    const total = actions.length * perActionFee;
    return {
      totalEstimatedFeeUSD: total.toFixed(2),
      breakdown: actions.map((a, i) => ({ step: i + 1, estimatedFeeUSD: perActionFee.toFixed(2) })),
      warning: total > 5 ? 'Fees are higher than usual — consider batching actions' : null,
    };
  }
  ```

- [ ] Create `backend/src/services/resolverService.ts` (stub):
  ```typescript
  export async function resolveRecipient(identifier: string): Promise<any> {
    // TODO: Integrate with MiniPay phone number resolution and ENS in a later phase
    if (identifier.endsWith('.eth')) {
      return { resolved: false, error: 'ENS resolution not yet implemented' };
    }
    return { resolved: false, error: 'Phone number resolution requires MiniPay integration' };
  }
  ```

```
DONE WHEN: All 8 service files created. Run npx tsc --noEmit from backend/ — zero errors.
```

---

### Step 2.7 — Wire the agent to the API route

- [ ] Create `backend/src/api/agent.ts`:
  ```typescript
  import express from 'express';
  import { runAgent } from '../agent/agent';

  export const agentRouter = express.Router();

  agentRouter.post('/execute', async (req, res) => {
    try {
      const { message, walletAddress, geminiApiKey, conversationHistory, mode } = req.body;

      // Validate required fields
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'message is required' });
      }
      if (!walletAddress || typeof walletAddress !== 'string') {
        return res.status(400).json({ error: 'walletAddress is required' });
      }
      if (!geminiApiKey || typeof geminiApiKey !== 'string') {
        return res.status(400).json({ error: 'geminiApiKey is required — user must provide their own Gemini API key in settings' });
      }

      const result = await runAgent(
        message,
        walletAddress,
        geminiApiKey,
        conversationHistory ?? []
      );

      res.json({
        response: result.response,
        updatedHistory: result.updatedHistory,
        unsignedTransactions: result.unsignedTxs,
      });

    } catch (error: any) {
      console.error('Agent execution error:', error);
      res.status(500).json({ error: error.message ?? 'Agent execution failed' });
    }
  });
  ```

- [ ] Update `backend/src/index.ts` to include the new route:
  ```typescript
  import express from 'express';
  import cors from 'cors';
  import dotenv from 'dotenv';
  import { agentRouter } from './api/agent';

  dotenv.config();

  const app = express();
  const PORT = process.env.PORT ?? 3001;

  app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/agent', agentRouter);

  app.listen(PORT, () => {
    console.log(`Automata backend running on port ${PORT}`);
  });
  ```

- [ ] Test the agent end-to-end using Thunder Client (VS Code extension) or curl:
  ```bash
  curl -X POST http://localhost:3001/agent/execute \
    -H "Content-Type: application/json" \
    -d '{
      "message": "What is my USDC balance?",
      "walletAddress": "0x0000000000000000000000000000000000000001",
      "geminiApiKey": "YOUR_GEMINI_API_KEY_HERE",
      "conversationHistory": [],
      "mode": "assisted"
    }'
  ```
  You should get back a JSON response with a `response` field containing the agent's reply in plain English.

```
DONE WHEN: POST /agent/execute with a test message returns a real response from Gemini. The agent uses tools and returns plain English.
```

---

## PHASE 2 — SYNC CHECKPOINT ⬛

- [ ] Dev 1: `POST /agent/execute` returns a real Gemini response
- [ ] Dev 1: All service stub files exist, TypeScript compiles with zero errors
- [ ] Dev 1: Balance service returns real EVM balances for a test address
- [ ] Dev 1: Database still connected and healthy
- [ ] Dev 2: Pull latest changes from GitHub
- [ ] Both: Updated `## 📍 CURRENT POSITION` to Phase 3

---
---

# ════════════════════════════════════════════════════════
# PHASE 3 — FRONTEND BUILD
# Dev 2 leads · Dev 1 replaces service stubs in parallel
# ════════════════════════════════════════════════════════

> **Goal:** A complete, polished frontend. All pages built. Wallet connects. Chat interface talks to the backend agent. Flow builder works. Status panel shows real-time updates.

---

## PHASE 3 — DEV 2 TASKS

### Step 3.1 — Design system & global layout

- [ ] Run UI/UX Pro Max to generate the Automata design system. In your Claude Code environment:
  ```bash
  python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech crypto cross-chain dark premium" --design-system --stack nextjs -f markdown
  ```
  Read the output carefully. Log the recommended font here: `FONT CHOSEN: ___________`

- [ ] Install your chosen font via `next/font` in `app/layout.tsx`. Example (replace with your chosen font):
  ```tsx
  import { Syne } from 'next/font/google';
  const syne = Syne({ subsets: ['latin'], weight: ['400', '600', '700', '800'] });
  ```
  Apply it to the body: `<body className={syne.className}>`

- [ ] Create `frontend/components/layout/Navbar.tsx` — the top navigation bar present on all pages:
  - Left: "AUTOMATA" logo in accent pink, bold
  - Center: nav links — Build, Chat, History (hidden on mobile, shown on desktop)
  - Right: `WalletBar` component (built next)
  - Use Framer Motion for a subtle fade-in on load

- [ ] Create `frontend/components/layout/WalletBar.tsx` — shows wallet state:
  - If not connected: "Connect Wallet" button (calls Privy `login()`)
  - If connected: truncated address (`0x1234...5678`) + chain name badge + balance
  - On click when connected: shows Privy wallet modal

- [ ] Update `frontend/app/layout.tsx` to include the Navbar above all page content

```
DONE WHEN: Navbar visible on all pages. Wallet connects via Privy on "Connect Wallet" click. Chosen font renders.
```

---

### Step 3.2 — Landing page (/)

- [ ] Build `frontend/app/page.tsx` — the first thing new users see:
  - **Hero section:**
    - Headline (large, display font): "Cross-Chain Finance. In Plain English."
    - Subheadline: one sentence explaining Automata
    - Two CTA buttons: "Start Chatting" → `/chat` and "Build a Flow" → `/build`
    - Animated gradient background (Framer Motion or pure CSS)
  - **How it works section** — 3 steps in plain English:
    - Step 1: "Tell Automata what you want to do with your money"
    - Step 2: "The agent finds the best route across any chain"
    - Step 3: "Confirm once. Done."
  - **Supported chains section** — logos/badges for Base, Celo, Ethereum, Stellar
  - **Feature cards** — 3 shadcn Cards with Framer Motion staggered entrance:
    - "Swap any token" — USDC to XLM, cKES, ETH, and more
    - "Bridge in seconds" — Native USDC via Circle CCTP V2. No wrapped tokens.
    - "Earn yield" — The agent finds the best rate. You just approve.
  - Footer: "Automata" + "Built for Africa. Built for the world."

```
DONE WHEN: Landing page looks genuinely impressive. Both CTA buttons navigate correctly. Animations smooth.
```

---

### Step 3.3 — Backend API helper (lib/api.ts)

- [ ] Create `frontend/lib/api.ts`:
  ```typescript
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  export async function sendAgentMessage(
    message: string,
    walletAddress: string,
    geminiApiKey: string,
    conversationHistory: any[] = []
  ): Promise<{ response: string; updatedHistory: any[]; unsignedTransactions: any[] }> {
    const res = await fetch(`${API_BASE}/agent/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, walletAddress, geminiApiKey, conversationHistory }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Agent request failed');
    }

    return res.json();
  }
  ```

```
DONE WHEN: Function exported and usable from any component.
```

---

### Step 3.4 — Settings page (/settings)

Build this BEFORE the chat page — the chat page needs the API key that users set here.

- [ ] Build `frontend/app/settings/page.tsx`:
  - **Gemini API Key section:**
    - Label: "Your AI Agent Key"
    - Description: "Automata uses your own Gemini API key so you stay in control. Get a free key at aistudio.google.com"
    - Input field (type password so key is hidden)
    - "Save Key" button — saves to localStorage encrypted
    - Success toast when saved
  - **Agent Mode section:**
    - Label: "Execution Mode"
    - Two options (radio/toggle): "Assisted — I review every step" and "Autonomous — Agent executes automatically"
    - Save preference to localStorage
  - **Connected Wallets section:**
    - Shows Privy embedded wallet address
    - Shows any connected external wallets
    - "Manage Wallets" button → opens Privy modal

- [ ] Create `frontend/lib/settings.ts` — helper for reading/writing settings:
  ```typescript
  export function saveGeminiKey(key: string): void {
    // In a real app you'd encrypt this. For now store in localStorage.
    localStorage.setItem('automata_gemini_key', key);
  }

  export function getGeminiKey(): string | null {
    return localStorage.getItem('automata_gemini_key');
  }

  export function saveAgentMode(mode: 'assisted' | 'autonomous'): void {
    localStorage.setItem('automata_agent_mode', mode);
  }

  export function getAgentMode(): 'assisted' | 'autonomous' {
    return (localStorage.getItem('automata_agent_mode') as any) ?? 'assisted';
  }
  ```

```
DONE WHEN: User can enter and save their Gemini API key. Mode toggle works. Settings persist on page refresh.
```

---

### Step 3.5 — StatusPanel component

This component shows the real-time state of an agent execution. Used on both /chat and /build.

- [ ] Create `frontend/components/StatusPanel.tsx`:
  - Accepts: `status: 'idle' | 'thinking' | 'executing' | 'awaiting_approval' | 'success' | 'error'`
  - Accepts: `message?: string`, `txHash?: string`, `chainId?: string`
  - **idle** — invisible or shows "Ready"
  - **thinking** — animated spinner + "Agent is planning your flow..."
  - **executing** — animated spinner + "Executing step X of Y..."
  - **awaiting_approval** — yellow border + "Review the plan below and confirm to proceed"
  - **success** — green glow + checkmark + "Done! " + clickable tx hash linking to explorer
  - **error** — red border + X icon + plain English error message
  - All state transitions use Framer Motion `AnimatePresence`

```
DONE WHEN: All 6 states render correctly and transition smoothly. Test by manually changing the status prop.
```

---

### Step 3.6 — PlanReview component (Assisted mode)

This is what the user sees before approving an agent plan in Assisted mode.

- [ ] Create `frontend/components/PlanReview.tsx`:
  - Accepts: `plan: AgentPlan`, `onApprove: () => void`, `onCancel: () => void`
  - Shows each step in a numbered list in plain English
  - Shows estimated fee for each step
  - Shows total estimated fee and time at the bottom
  - Shows any warnings in yellow
  - "Approve & Execute" button (green) and "Cancel" button (subtle)
  - Framer Motion slide-up entrance animation

```
DONE WHEN: PlanReview renders a mock plan with correct layout. Both buttons fire their callbacks.
```

---

### Step 3.7 — Chat Interface (/chat)

The primary product experience.

- [ ] Build `frontend/app/chat/page.tsx`:
  - Check if Gemini API key is saved. If not, show a banner: "Add your Gemini API key in Settings to start chatting" with a link to /settings
  - Check if wallet is connected. If not, show "Connect your wallet to continue" with Privy connect button
  - **Chat area** (scrollable, takes up most of the screen):
    - Agent messages: left-aligned, dark card, Automata logo avatar
    - User messages: right-aligned, accent pink/purple gradient
    - Timestamps on each message
    - Auto-scrolls to the latest message
  - **Input bar** (pinned to bottom):
    - Text input: placeholder "Tell me what you want to do with your money..."
    - Send button (arrow icon)
    - Handles Enter key to send
  - **StatusPanel** below the input bar
  - **PlanReview** appears above the input bar when agent returns a plan in Assisted mode

- [ ] Wire the chat to the backend:
  - On send: call `sendAgentMessage()` from lib/api.ts
  - Store conversation history in component state
  - Show thinking spinner while waiting for response
  - When response includes `unsignedTransactions`, show PlanReview (Assisted) or execute immediately (Autonomous)

- [ ] Handle transaction signing:
  - When user approves the plan, call Privy's `sendTransaction()` for each unsigned tx
  - Update StatusPanel to 'executing' while transactions are in flight
  - On success: update StatusPanel to 'success' with tx hash
  - On failure: update StatusPanel to 'error' with plain English message

```
DONE WHEN: User can type "what is my balance?" and get a real response. Full chat flow works end-to-end.
```

---

### Step 3.8 — ActionNode component (for Flow Builder)

- [ ] Create `frontend/components/FlowBuilder/ActionNode.tsx`:
  - Uses React Flow's custom node API
  - Renders a shadcn Card with:
    - Action type badge (color coded: SWAP=pink, BRIDGE=purple, STAKE=green, TRANSFER=teal)
    - "From chain" dropdown (Base, Celo, Ethereum, Stellar)
    - "To chain" dropdown (shown only for BRIDGE type)
    - "From token" input
    - "To token" input
    - "Amount" input
    - Delete button (Lucide Trash2 icon, top right)
    - React Flow connection handles (source bottom, target top)
  - Framer Motion fade + slide-up entrance animation

```
DONE WHEN: ActionNode renders in React Flow canvas with all fields. Handles visible. Delete works.
```

---

### Step 3.9 — Flow Builder (/build)

- [ ] Build `frontend/app/build/page.tsx`:
  - **Left panel** (fixed width, 260px) — action palette:
    - 4 draggable cards: SWAP, BRIDGE, STAKE, TRANSFER
    - Each card shows an emoji icon + label + colour-coded border
    - Clicking OR dragging adds the action to the canvas
  - **Main canvas** (React Flow, fills remaining space):
    - Drag actions from palette to canvas
    - Nodes auto-connect vertically
    - Empty state: "Drag an action here to start building your flow"
    - MiniMap in bottom right
    - Zoom controls in bottom left
  - **Bottom bar:**
    - "Simulate" button (left) — sends current actions to POST /agent/execute with message "Simulate this flow and estimate fees"
    - "Execute Flow" button (right, accent pink gradient) — sends actions to agent and triggers execution
    - "Save Flow" button (middle) — saves the current flow with a name (shadcn Dialog)
  - **StatusPanel** below the bottom bar

```
DONE WHEN: Can drag 3 actions to canvas, configure each, delete one, and hit Execute. StatusPanel updates correctly.
```

---

### Step 3.10 — History page (/history)

- [ ] Build `frontend/app/history/page.tsx`:
  - Reads transaction history from localStorage (saved after each successful execution on /chat or /build)
  - shadcn Table with columns: Type, Amount, From, To, Status, Time, Explorer Link
  - Each row has a colour-coded status badge (green=confirmed, yellow=pending, red=failed)
  - Explorer links per chain:
    - Base: `https://basescan.org/tx/[hash]`
    - Celo: `https://celoscan.io/tx/[hash]`
    - Ethereum: `https://etherscan.io/tx/[hash]`
    - Stellar: `https://stellar.expert/explorer/public/tx/[hash]`
  - Empty state: "No transactions yet. Start by chatting with your agent." with link to /chat

```
DONE WHEN: After executing a flow on /chat, the transaction appears correctly in /history.
```

---

## PHASE 3 — SYNC CHECKPOINT ⬛

- [ ] Dev 2: All 5 pages load without errors or console warnings
- [ ] Dev 2: Chat page sends a message and receives a real agent response
- [ ] Dev 2: Wallet connects via Privy. Address shown in WalletBar.
- [ ] Dev 2: Flow builder — can add, configure, and delete nodes
- [ ] Dev 2: Settings — API key saves and persists
- [ ] Dev 1: Pull latest frontend changes
- [ ] Dev 1: Started replacing service stubs with real implementations (see Phase 4)
- [ ] Both: Updated `## 📍 CURRENT POSITION` to Phase 4

---
---

# ════════════════════════════════════════════════════════
# PHASE 4 — REAL SERVICE IMPLEMENTATIONS
# Dev 1 leads · Dev 2 polishes frontend in parallel
# ════════════════════════════════════════════════════════

> **Goal:** Replace all service stubs with real blockchain integrations. Real balances. Real routes. Real bridge transactions. Everything on testnet first, then mainnet.

---

## PHASE 4 — DEV 1 TASKS

### Step 4.1 — Real LI.FI route service

- [ ] Read LI.FI SDK docs: https://docs.li.fi/integrate-li.fi-js-sdk/li.fi-sdk
- [ ] Replace `backend/src/services/routeService.ts` with real LI.FI SDK calls:
  - Call `getRoutes()` with from/to chain, token, amount
  - Return the best route (first result from LI.FI's sorted list)
  - Store the full route object keyed by routeId for use in buildSwapTx
  - Handle: no route found, insufficient liquidity, unsupported chain pair

```
DONE WHEN: POST /agent/execute with "swap 10 USDC from Base to Celo" returns a real LI.FI route with real fees.
```

---

### Step 4.2 — Real Circle CCTP V2 bridge service

- [ ] Read Circle CCTP V2 docs: https://developers.circle.com/cctp
- [ ] Replace `backend/src/services/bridgeService.ts` with real CCTP V2:
  - For USDC bridges: use Circle's burn-and-attest flow
  - Build the approve + burn transaction (two unsigned txs returned together)
  - Build the destination mint transaction (returned separately after attestation)
  - Handle: Stellar USDC bridge uses a different flow — check Circle docs for Stellar-specific CCTP
  - Handle: attestation can take 30-90 seconds — backend should return burn tx first, then poll for attestation

```
DONE WHEN: buildBridgeTx returns real unsigned approve + burn transactions. Test on Base Sepolia testnet.
```

---

### Step 4.3 — Real yield rate service

- [ ] Replace `backend/src/services/yieldService.ts` with real on-chain reads:
  - Aave V3 on Base and Ethereum: read `getReserveData()` from Aave's Pool contract
  - Mento on Celo: read exchange rates from Mento's Registry contract
  - Return top 3 options sorted by APY descending
  - Cache results for 5 minutes (use a simple in-memory Map) to avoid hammering RPCs

```
DONE WHEN: getYieldRates('base', 'USDC') returns a real current APY number.
```

---

### Step 4.4 — Real stake/deposit transactions

- [ ] Replace `backend/src/services/stakeService.ts` with real protocol ABIs:
  - Aave V3 supply: call `supply(asset, amount, onBehalfOf, referralCode)` on the Pool contract
  - Mento swap to cUSD: call the appropriate Mento exchange function
  - Return real unsigned calldata

```
DONE WHEN: buildStakeTx returns a real unsigned transaction that can be submitted to Aave on testnet.
```

---

### Step 4.5 — WebSocket for real-time transaction status

- [ ] Add WebSocket server to `backend/src/index.ts`:
  ```typescript
  import { WebSocketServer } from 'ws';
  import { createServer } from 'http';

  const server = createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      const { txHash, chainId } = JSON.parse(data.toString());
      // Start polling for tx status and send updates via ws
      pollTransactionStatus(ws, txHash, chainId);
    });
  });

  // Change app.listen to server.listen
  server.listen(PORT, () => console.log(`Automata backend running on port ${PORT}`));
  ```

- [ ] Create `backend/src/services/txMonitorService.ts`:
  - Poll the appropriate chain RPC every 3 seconds for transaction status
  - Send status updates via WebSocket: `{ status: 'pending' | 'confirmed' | 'failed', confirmations: number, txHash }`
  - Stop polling after confirmation or failure

```
DONE WHEN: After submitting a testnet transaction, the frontend StatusPanel updates in real time from 'pending' to 'confirmed'.
```

---

## PHASE 4 — SYNC CHECKPOINT ⬛

- [ ] Dev 1: LI.FI returns real routes
- [ ] Dev 1: CCTP V2 returns real unsigned bridge transactions on testnet
- [ ] Dev 1: Yield rates are real (from Aave/Mento)
- [ ] Dev 1: WebSocket sends real-time tx status updates
- [ ] Dev 2: Frontend connects to WebSocket and updates StatusPanel in real time
- [ ] Both: Full USDC bridge flow works on testnet (Base Sepolia → Celo Alfajores)
- [ ] Both: Updated `## 📍 CURRENT POSITION` to Phase 5

---
---

# ════════════════════════════════════════════════════════
# PHASE 5 — INTEGRATION & END-TO-END TESTING
# Both devs together
# ════════════════════════════════════════════════════════

> **Goal:** Full end-to-end flows work on testnet. Real transactions. Real confirmations. Every error case handled gracefully.

---

### Step 5.1 — End-to-end test: USDC transfer (simplest flow)
- [ ] Open /chat
- [ ] Type: "Send 1 USDC to [another test wallet address] on Base"
- [ ] Agent shows plan in Assisted mode
- [ ] Approve the plan
- [ ] MetaMask/Privy prompts for signature
- [ ] Sign the transaction
- [ ] StatusPanel goes: thinking → executing → success
- [ ] Transaction appears on https://sepolia.basescan.org
- [ ] Transaction appears in /history

```
DONE WHEN: FlowExecuted. Explorer link works. History page shows the tx.
```

---

### Step 5.2 — End-to-end test: USDC bridge
- [ ] Type: "Move 2 USDC from Base to Celo"
- [ ] Agent shows bridge plan with CCTP V2
- [ ] User approves
- [ ] Two signatures required (approve USDC + burn) — Privy handles both
- [ ] USDC arrives on Celo testnet within 60-90 seconds
- [ ] StatusPanel shows each step completing in sequence

```
DONE WHEN: USDC visible in wallet on Celo testnet after bridging from Base.
```

---

### Step 5.3 — End-to-end test: Swap (XLM)
- [ ] Type: "Swap 5 USDC to XLM on Stellar"
- [ ] Agent routes: bridge USDC Base → Stellar via CCTP, then swap USDC → XLM on Stellar DEX
- [ ] User approves multi-step plan
- [ ] XLM visible in Stellar testnet wallet

```
DONE WHEN: User receives XLM on Stellar after starting with USDC on Base.
```

---

### Step 5.4 — End-to-end test: Yield/Stake
- [ ] Type: "Put 10 USDC to work on Celo at the best rate"
- [ ] Agent finds yield rate, builds deposit transaction
- [ ] User approves and signs
- [ ] USDC deposited into Mento/Aave equivalent on Celo testnet

```
DONE WHEN: Deposit confirmed on testnet. StatusPanel shows success with explorer link.
```

---

### Step 5.5 — Flow builder end-to-end test
- [ ] Open /build
- [ ] Drag: BRIDGE → SWAP → STAKE
- [ ] Configure: Bridge USDC from Base to Celo, Swap USDC to cUSD on Celo, Stake cUSD on Celo
- [ ] Click Simulate — agent returns plan with fees
- [ ] Click Execute — multi-step flow runs
- [ ] All 3 steps confirm in sequence

```
DONE WHEN: All 3 steps visible in StatusPanel and confirmed on testnet explorer.
```

---

### Step 5.6 — Error handling tests
- [ ] Reject MetaMask transaction → StatusPanel shows "You cancelled the transaction" (not a raw error)
- [ ] Backend unreachable → StatusPanel shows "Could not connect to Automata. Check your connection."
- [ ] Invalid Gemini API key → clear message: "Your AI key is invalid. Update it in Settings."
- [ ] Insufficient balance → agent says "You don't have enough USDC on Base for this. Your current balance is X."
- [ ] Zero console errors on Chrome and Brave

```
DONE WHEN: All 5 error scenarios show clean plain-English messages. No raw errors or stack traces ever shown to the user.
```

---

## PHASE 5 — SYNC CHECKPOINT ⬛

- [ ] All 5 end-to-end tests pass on testnet
- [ ] All 5 error scenarios show clean messages
- [ ] Zero console errors on Chrome and Brave
- [ ] Both devs have witnessed the full demo working
- [ ] Commit: `feat: full end-to-end integration working on testnet`

---
---

# ════════════════════════════════════════════════════════
# PHASE 6 — MINIPAY INTEGRATION
# Dev 2 leads
# ════════════════════════════════════════════════════════

> **Goal:** Automata works as a MiniPay Mini App on Celo. Mobile-optimised. MiniPay wallet connects natively.

---

### Step 6.1 — Audit MiniPay Mini App requirements
- [ ] Read all of https://docs.minipay.xyz before writing any code
- [ ] Note specific technical requirements here: `MINIPAY REQUIREMENTS: ___________`
- [ ] Note submission process here: `SUBMISSION PROCESS: ___________`

### Step 6.2 — Mobile-first UI audit
- [ ] Test every page at 375px width (iPhone SE)
- [ ] Fix any layout issues — all tap targets must be at least 44px tall
- [ ] Test at 390px (iPhone 14) and 412px (Pixel 7)
- [ ] Navigation must be accessible from a bottom tab bar on mobile

### Step 6.3 — MiniPay wallet detection
- [ ] Detect when Automata is running inside MiniPay (check `window.ethereum.isMiniPay`)
- [ ] When inside MiniPay: use MiniPay's built-in Celo wallet instead of Privy
- [ ] When outside MiniPay: use Privy as normal
- [ ] Test that wallet connection works in both contexts

### Step 6.4 — Submit to MiniPay Mini App directory
- [ ] Follow submission process from Step 6.1
- [ ] Note submission status here: `SUBMISSION STATUS: ___________`

```
DONE WHEN: Automata loads inside MiniPay on a real Android phone. Wallet connects. A USDC transfer on Celo works.
```

---
---

# ════════════════════════════════════════════════════════
# PHASE 7 — MAINNET & POLISH
# Both devs · Final phase before launch
# ════════════════════════════════════════════════════════

> **Goal:** Everything works on mainnet. The product looks and feels polished enough to show to real users.

---

### Step 7.1 — Switch all RPCs to mainnet
- [ ] Update all `.env` RPC URLs from testnet to mainnet
- [ ] Update Circle CCTP from testnet to mainnet
- [ ] Update LI.FI from testnet to mainnet
- [ ] Run all end-to-end tests on mainnet with small real amounts (1 USDC)

### Step 7.2 — UI polish pass
- [ ] Loading skeletons on every async data fetch (shadcn Skeleton)
- [ ] Hover animations on all interactive elements (Framer Motion)
- [ ] Flow builder nodes have subtle glow effects on hover
- [ ] Success state triggers a particle burst or confetti animation
- [ ] All pages tested and look good at 1280px, 1440px, 1920px

### Step 7.3 — Security audit
- [ ] Remove all `console.log` statements from production code
- [ ] No private keys or API keys hardcoded anywhere
- [ ] `.env` files confirmed absent from git history
- [ ] User Gemini API keys encrypted before storing
- [ ] Add rate limiting to backend: max 30 requests/minute per IP
- [ ] Review all agent system prompt rules — confirm agent cannot be prompted to bypass safety rules

### Step 7.4 — README.md
- [ ] Write the project README:
  - What Automata is (3 sentences)
  - How to run locally (exact commands, copy-pasteable)
  - How to set up environment variables
  - Tech stack overview
  - Team members

### Step 7.5 — Deploy
- [ ] Backend → Railway (https://railway.app) or Render (https://render.com)
  - Both have free tiers. Railway is faster to set up.
  - Set all environment variables in the Railway/Render dashboard
- [ ] Frontend → Vercel (https://vercel.com)
  - Connect GitHub repo, Vercel auto-deploys on every push to main
  - Set all NEXT_PUBLIC_ environment variables in Vercel dashboard
- [ ] Update `NEXT_PUBLIC_API_URL` in Vercel to point to the deployed backend URL
- [ ] Run full end-to-end test on live production URLs

---

## 🏁 FINAL SHIP CHECKLIST

Every box must be checked before calling Automata v1 done.

- [ ] All 5 pages load on production URL without errors
- [ ] Google sign-in creates embedded wallet automatically via Privy
- [ ] User can set their Gemini API key in Settings
- [ ] Chat interface sends messages and receives agent responses
- [ ] Agent correctly handles: balance check, USDC bridge, token swap, yield deposit, USDC transfer
- [ ] Full USDC bridge Base → Celo works on mainnet (test with 1 USDC)
- [ ] Full USDC bridge Base → Stellar works on mainnet (test with 1 USDC)
- [ ] Swap to XLM works on Stellar mainnet
- [ ] Flow builder: drag, configure, and execute a 3-step flow
- [ ] StatusPanel shows real-time updates from WebSocket
- [ ] /history page logs all executed transactions with correct explorer links
- [ ] MiniPay Mini App loads on Android inside MiniPay
- [ ] All error states show clean plain-English messages
- [ ] Zero console errors on Chrome and Brave
- [ ] No secrets in git history
- [ ] README complete and accurate
- [ ] Rate limiting active on backend

---

## 🔗 USEFUL LINKS — QUICK REFERENCE

| Resource | URL |
|---|---|
| Circle CCTP V2 Docs | https://developers.circle.com/cctp |
| Circle Bridge Kit | https://developers.circle.com/bridge-kit |
| Circle USDC Testnet Faucet | https://faucet.circle.com |
| LI.FI SDK Docs | https://docs.li.fi |
| Privy Docs | https://docs.privy.io |
| MiniPay Developer Docs | https://docs.minipay.xyz |
| Google AI Studio (Gemini) | https://aistudio.google.com |
| Google AI SDK for Node | https://ai.google.dev/gemini-api/docs |
| React Flow Docs | https://reactflow.dev/docs |
| shadcn/ui Docs | https://ui.shadcn.com |
| 21st.dev Components | https://21st.dev |
| UI/UX Pro Max Skill | https://github.com/nextlevelbuilder/ui-ux-pro-max-skill |
| x402 Protocol | https://x402.org |
| Stellar Developer Docs | https://developers.stellar.org |
| Stellar Laboratory (testnet) | https://laboratory.stellar.org |
| Celo Developer Docs | https://docs.celo.org |
| Base Developer Docs | https://docs.base.org |
| viem Docs | https://viem.sh |
| Base Sepolia Faucet | https://www.coinbase.com/faucets/base-ethereum-goerli-faucet |
| Celo Alfajores Faucet | https://faucet.celo.org/alfajores |
| Base Sepolia Explorer | https://sepolia.basescan.org |
| Celo Alfajores Explorer | https://alfajores.celoscan.io |
| Stellar Expert Explorer | https://stellar.expert |
| Railway (backend deploy) | https://railway.app |
| Vercel (frontend deploy) | https://vercel.com |

---

*This file is the project. Keep it updated. Every session starts here.*
