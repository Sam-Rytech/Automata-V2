# Automata — Cross-Chain AI Agent Platform
**Version 2.0.0**

Swap, Bridge, and Stake across any chain. In plain English.

---

## 🌎 Overview

Automata is a cross-chain AI agent platform designed to make complex blockchain finance as simple as sending a text message. It lets any user — from a first-time crypto holder to a DeFi power user — execute asset swaps, cross-chain transfers, and yield staking across multiple blockchains without ever seeing technical jargon, chain IDs, hex codes, or complicated gas setups.

Users interact with the platform by either simply stating their financial intent in plain language or building workflows using drag-and-drop nodes. The AI Agent handles the reasoning, the routing, the API orchestration, and the sequence formatting. **The user only signs.**

## ⚡ Core Modalities & Execution

### Two Interface Modes
1. **Chat Interface**: A conversational AI UI where users simply type their transaction requests naturally (e.g., _"Move 100 USDC from Base to Celo"_).
2. **Visual Flow Builder**: A robust drag-and-drop `React Flow` canvas for advanced users to compose multi-step strategies manually and sequentially.

### Two Agent Execution Modes
- **Assisted (Default)**: The agent listens to the user, formulates the best route/action, pulls live API fees via LI.FI and Circle tools, and proposes an actionable plan for user approval BEFORE moving forward.
- **Autonomous**: For advanced or recurring paths, the agent executes the sequence end-to-end, prompting confirmation signing where required up until completion.

## 🏗 System Architecture & Integrations

Automata splits into three major isolated layers, strictly communicating across boundaries:

### 1. Frontend Layer
Built for high-end fidelity, intuitive UI interactions, and comprehensive wallet handling without complicated onboarding sequences.
- **Framework**: Next.js 16 (App Router) utilizing TurboPack
- **Styling**: Tailwind CSS v4 paired with Framer Motion for deep micro-animations and aesthetic transitions.
- **Components**: Radix UI derivatives leveraging `shadcn/ui` alongside high-end `21st.dev` models.
- **Flow Engine**: `React Flow` dynamically building node interfaces for chain routing.
- **Web3 Engine**: `Privy` integration for Embedded Wallets (Google OAuth initialization) + External connectors, heavily leveraging `viem` and `wagmi`.

### 2. Backend Orchestration Layer (Node.js + Express)
- **AI Brain**: Google Gemini 2.5 Flash powering the tool-use loop mapping plain language into fixed contract requests, heavily strictly bounded by specialized System Prompting.
- **Routing Services**: Dedicated sub-services handling LI.FI SDK routing computations (`swapService.ts`, `routeService.ts`).
- **Bridging & Cross-Chain**: Circle's CCTP V2 integration for pristine 1:1 burn-and-mint USDC routing natively between Phase 1 nodes without relying on wrapped liquidations (`bridgeService.ts`).

### 3. Blockchain Target Ecosystem (Phase 1)
- **Base (EVM)**
- **Celo (EVM)** - *Including deep optimization for mobile-friendly MiniPay stablecoin integrations.*
- **Ethereum (EVM)**
- **Stellar (Non-EVM)** - *Fully supported parallel bridging and cross-border routing mechanics.*

---

## 🚀 Unplanned Advancements & Extended Integrations
*During the active development sequence, the Automata platform was expanded significantly beyond the original scope detailed in the `AutomataArchitecture.docx` and `PROGRESS.md` specifications. The following features have been fully implemented natively into the project logic:*

### 1. Solana Ecosystem Expansion
Although initially scoped strictly for EVM + Stellar targets, the Next.js frontend has profoundly integrated the **Solana** chain capability.
- **Packages Instantiated**: `@solana/kit`, `@solana-program/system`, and `@solana-program/token` are now heavily baked into the web configuration.
- **Auth Bridging**: The `PrivyProvider` logic acts structurally to harness Solana external wallet injections directly through the frontend interface.

### 2. Stacks Network Integration
Taking a step directly into native Bitcoin smart contracts, **Stacks (STX)** architecture was actively injected into the Home layout capabilities matrix. Stacks visual assets (`stacks-stx-logo.svg`) and respective routing logic markers were dynamically engineered into the UI map array to allow scalable network expansion mapping.

### 3. Advanced OAuth Intent Tracking (The Persistent Login Fix)
The original specification heavily simplified the `Privy` integration. However, social logins (like Google Auth) often execute total DOM reloads which destroy React Memory context via external redirects. 
- **Implementation**: The application now dynamically relies on robust `localStorage` caching mechanics (`postLoginRedirect`) tied inside `LandingNav`, `FinalCTA`, and `Hero` components. 
- **Result**: Users who click "Build a Flow" or "Start Chatting" while unauthenticated are now automatically deep-linked directly to their intended path safely, completely surviving the OAuth loop disruption.

### 4. Graphic Optimization & Layout Overhaul 
The frontend landing components bypassed initial SVG inline strategies heavily for performance. 
- Integrated a bespoke, ultra-responsive Tailwind grid mapping matrix (`grid-cols-2 sm:grid-cols-3 lg:flex`) to handle mobile-to-laptop fluidity flawlessly.
- SVGs were recompiled to standalone assets alongside explicit `grayscale-to-color` matrix interactions for optimal client-side DOM processing. Overlays are scaled optimally avoiding massive `.ico` injection drops using `image/png` mapping through Next 16 `app/viewport` exports natively.

---

## 📍 Current Implementation Status

Automata has heavily phased through its Monorepo scaffolding, integrating core intelligence protocols, and is actively validating its implementation sequences. 

### Core Milestones Recorded (Phase 3 & 4):
- **Backend Service Ecosystem Live**: Generated all 9 Service routes handling the Tool Executors — including live cross-chain EVM data fetchers, native Stellar Adapters, Mock Yield stagers, LI.FI quote routing, and fee estimations. `agent.ts` natively resolves `unsignedTxs` dynamically to be pushed forward to UI.
- **AI Tool Executor Pipeline Loop**: The backend `toolExecutor.ts` completely resolves dynamic outputs from `gemini` returning explicit transaction arrays safely without requiring backend key signatures ever touching the actual server. 


---

## 📂 Project Structure

```text
Automata-V2/
├── frontend/
│   ├── app/                      
│   │   ├── build/                # React Flow Visual Canvas Layout
│   │   ├── chat/                 # AI Chat interface
│   │   ├── history/              # Transaction Histories
│   │   ├── settings/             # Env configuration (API insertions)
│   │   ├── layout.tsx            # Next.js Metadata and Privy Root Providers
│   │   └── page.tsx              # Dynamic Marketing/Landing Hero
│   ├── components/               
│   │   ├── landing/              # Dedicated Home Page UI sections (Hero, Chains, models, FinalCTA)
│   │   ├── ui/                   # Shadcn Base Utilities & Shadcn Configuration
│   │   ├── FlowBuilder/          # Core Canvas Nodes   
│   │   └── chat/                 # Embedded Chat Sidebars
├── backend/
│   ├── src/
│   │   ├── agent/                # Gemini System Prompts, Tool schemas, & Execution Loops
│   │   ├── adapters/             # Direct Viem and Stellar block-reading utilities
│   │   ├── services/             # Endpoint processing (Bridging, Swaps, Fetchers, Fees)
│   │   └── index.ts              # Primary Express entry router
└── shared/
    └── types/                    # Unified TS boundaries resolving Action Types across boundaries
```

---

## 🛠 Running the Platform

To test the application locally, you must first secure a few necessary properties:
1. Ensure `PostgreSQL` is available for `prisma` sessions indexing on the backend.
2. Obtain a valid Gemini 2.5 Developer API configuration.
3. Validate `.env` files internally for `NEXT_PUBLIC_PRIVY_APP_ID`, `LIFI_API_KEY`, etc.

**To run the frontend dev environment:**
```bash
cd frontend
npm run dev
```

**To run the backend orchestrator:**
```bash
cd backend
npm run dev
```