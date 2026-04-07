# 🤖 AUTOMATA — LLM SESSION PROMPT
## Phase 4 · Step 4.1 — Replace LI.FI Stub with Real @lifi/sdk
### For: Dev 2 (or any developer assigned to backend Phase 4)
### Session type: ONE STEP ONLY — do not proceed to Step 4.2 until this is complete and verified

---

## 🔴 MANDATORY: READ THIS ENTIRE PROMPT BEFORE WRITING A SINGLE LINE OF CODE

This is not optional. Every instruction in this prompt exists for a reason.
If you skip ahead, you will break something that was already working.

---

## 🧠 WHAT IS AUTOMATA — READ THIS FIRST

Automata is a **cross-chain AI agent platform**. Users type what they want in plain English
(e.g. "swap 50 USDC to XLM" or "move 100 USDC from Base to Celo"), and an AI agent
(Google Gemini Flash) figures out the route, builds the transactions, and returns them
unsigned. The **user always signs their own transactions** — Automata never holds funds.

The platform supports: **Base · Celo · Ethereum · Stellar**
The tokens it handles: **USDC · ETH · CELO · cUSD · cKES · XLM**

There are two execution modes:
- **Assisted** — agent shows the user a plan first, user approves, then signs
- **Autonomous** — agent executes the full flow, user signs at the end

The backend is built with **Node.js + Express + TypeScript**.
The agent brain is **Gemini 2.0 Flash** with function/tool calling.

---

## 📍 WHERE THIS PROJECT IS RIGHT NOW

Before you write anything, understand the full picture:

### ✅ ALREADY COMPLETE (do not touch these)
- **Phase 0** — All accounts, credentials, and infrastructure set up
- **Phase 1** — Full monorepo scaffold (backend + frontend + shared types)
- **Phase 2** — AI agent brain built: Gemini tool-use loop, conversation history, sanitizeHistory
- **Phase 3 (Backend)** — All 9 service stubs created, all 9 tools wired to toolExecutor, Express server running

### 🔧 WHAT YOU ARE DOING TODAY — Phase 4, Step 4.1
You are replacing the **stub/mock** inside `routeService.ts` and `swapService.ts` with
**real calls to the LI.FI SDK** (`@lifi/sdk`).

These two files currently return fake hardcoded data. After this session, they will
return real routes and real unsigned swap/bridge transactions from LI.FI's live API.

### ⏳ WHAT COMES AFTER (not your job today)
- Step 4.2 — Replace Circle CCTP bridge stub with real SDK
- Step 4.3 — Replace yield stubs with real Aave/Mento reads
- Step 4.4 — Move in-memory sessions to Prisma/PostgreSQL
- Phase 5 — Full frontend build (separate developer)

---

## 🗂️ FILE MAP — KNOW WHAT EXISTS BEFORE YOU TOUCH ANYTHING

```
automata/
├── backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── agent.ts          ← Gemini reason-act loop [DO NOT TOUCH]
│   │   │   ├── toolExecutor.ts   ← Routes tool calls to services [DO NOT TOUCH]
│   │   │   ├── tools.ts          ← 9 tool definitions for Gemini [DO NOT TOUCH]
│   │   │   └── prompts.ts        ← System prompt [DO NOT TOUCH]
│   │   ├── services/
│   │   │   ├── routeService.ts   ← 🎯 YOU ARE REPLACING THIS STUB TODAY
│   │   │   ├── swapService.ts    ← 🎯 YOU ARE REPLACING THIS STUB TODAY
│   │   │   ├── bridgeService.ts  ← Circle CCTP stub [leave for Step 4.2]
│   │   │   ├── balanceService.ts ← REAL already [DO NOT TOUCH]
│   │   │   ├── yieldService.ts   ← Mock stub [leave for Step 4.3]
│   │   │   ├── stakeService.ts   ← Mock stub [leave for Step 4.3]
│   │   │   ├── transferService.ts← Real calldata [DO NOT TOUCH]
│   │   │   ├── feeService.ts     ← Stub [leave as is]
│   │   │   └── resolverService.ts← ENS stub [leave as is]
│   │   ├── adapters/
│   │   │   ├── evm.ts            ← Real EVM helpers [DO NOT TOUCH — owned by Dev 2]
│   │   │   └── stellar.ts        ← Real Stellar helpers [DO NOT TOUCH — owned by Dev 2]
│   │   ├── utils/
│   │   │   └── rpc.ts            ← viem public clients [DO NOT TOUCH — owned by Dev 2]
│   │   └── index.ts              ← Express server, /api/chat route [DO NOT TOUCH]
│   ├── prisma/
│   │   └── schema.prisma         ← DB schema [DO NOT TOUCH]
│   ├── .env                      ← Your environment variables [verify before starting]
│   ├── package.json
│   └── tsconfig.json
├── frontend/                     ← Separate developer. DO NOT TOUCH.
└── shared/
    └── types/
        └── Action.ts             ← Shared types [DO NOT TOUCH]
```

---

## 🔑 STEP 0 — VERIFY YOUR ENVIRONMENT BEFORE ANY CODE

**Do this before anything else. Do not skip.**

### 0a. Confirm the backend runs

From the `backend/` folder:
```bash
npm run dev
```
In a second terminal:
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"ok","timestamp":"..."}` — if you don't see this, stop and fix it before continuing.

### 0b. Confirm TypeScript has zero errors

From the `backend/` folder:
```bash
npx tsc --noEmit
```
Expected: **zero output, zero errors**. If you see errors, fix them before proceeding.
Do not proceed if there are TypeScript errors — adding new code on top of broken types will make debugging harder.

### 0c. Check your .env file

Open `backend/.env` and verify the following values exist.
You do NOT need to fill in all of them right now, but you need to know which ones are present.

```bash
# Required for LI.FI (you may or may not have this — see instructions below)
LIFI_API_KEY=

# Required for RPC calls (at least one of these should exist)
BASE_RPC_URL=
CELO_RPC_URL=
ETH_RPC_URL=
```

**LI.FI API Key:**
- LI.FI works **without an API key** on their free tier during development (rate-limited to ~2 req/sec)
- If you have a key from https://li.fi, add it. If not, leave it blank — the SDK still works.
- If you have the key: `LIFI_API_KEY=your_key_here`
- If you don't: comment out or leave blank. The code you'll write will handle both cases.

### 0d. Confirm the @lifi/sdk package is installed

```bash
cat backend/package.json | grep lifi
```
Expected: `"@lifi/sdk": "..."` — if it's missing:
```bash
cd backend && npm install @lifi/sdk
```

---

## 🛠️ STEP 1 — READ THE CURRENT STUB FILES

Before replacing anything, read the existing files so you understand what shape of data the agent already expects.

### Read routeService.ts
```bash
cat backend/src/services/routeService.ts
```

The key things to note:
- What function is exported? (likely `getRoute`)
- What parameters does it accept?
- What shape does the return value have? (e.g. `{ routeId, summary, steps }`)
- The agent calls this tool as `get_route` — the return value becomes what Gemini reads

### Read swapService.ts
```bash
cat backend/src/services/swapService.ts
```

The key things to note:
- What function is exported? (likely `buildSwapTx`)
- What parameters does it accept? (likely `routeId` and `walletAddress`)
- What does it return? (likely `{ unsignedTx: { to, data, value, chainId, description } }`)

### Read toolExecutor.ts
```bash
cat backend/src/agent/toolExecutor.ts
```

This file is the switchboard — it calls your service functions and passes their results back to Gemini. You will NOT modify this file, but you need to understand what data shapes it expects from your services.

**Do not proceed until you have read all three files.**

---

## 🛠️ STEP 2 — UNDERSTAND LI.FI SDK (READ THIS CAREFULLY)

LI.FI is a cross-chain routing aggregator. It automatically finds the best route across 60+ chains, 14+ bridges, and 34+ DEXs.

### How LI.FI works in two steps:

**Step A — Get a route:**
You tell LI.FI: "I want to move X amount of TokenA on ChainA to TokenB on ChainB from walletAddress"
LI.FI returns: a route object containing the best path, estimated output, fees, and a unique route ID

**Step B — Build the transaction:**
You pass the route object to LI.FI's SDK
LI.FI returns: an unsigned transaction (`{ to, data, value }`) ready to be signed by the user

### Chain IDs you need to know:
```
Base      = 8453
Celo      = 42220
Ethereum  = 1
```
Stellar is handled by Circle CCTP (Step 4.2), not LI.FI.

### Token addresses you need to know:
```
USDC on Base:     0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
USDC on Celo:     0xcebA9300f2b948710d2653dD7B07f33A8B32118C
USDC on Ethereum: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
ETH (native):     0x0000000000000000000000000000000000000000
CELO (native):    0x471EcE3750Da237f93B8E339c536989b8978a438
cUSD on Celo:     0x765DE816845861e75A25fCA122bb6898B8B1282a
cKES on Celo:     0x456a3D042C0DbD3db53D5489e98dFb038553B0d0
```

### The @lifi/sdk API you will use:

```typescript
import { createConfig, getRoutes, getStepTransaction } from '@lifi/sdk';

// 1. Initialize (do this once, at module level)
createConfig({
  integrator: 'automata',  // your app name
  apiKey: process.env.LIFI_API_KEY || undefined,
});

// 2. Get routes
const routesResult = await getRoutes({
  fromChainId: 8453,          // Base
  toChainId: 42220,           // Celo
  fromTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // USDC on Base
  toTokenAddress: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',    // USDC on Celo
  fromAmount: '10000000',     // amount in smallest unit (USDC = 6 decimals, so 10 USDC = 10_000_000)
  fromAddress: '0xYourWallet',
});

const bestRoute = routesResult.routes[0];  // first route is the best one

// 3. Get the transaction for the first step of the route
const stepTx = await getStepTransaction(bestRoute.steps[0]);
// stepTx.transactionRequest = { to, data, value, chainId, gasLimit, ... }
```

### Important note on amounts:
LI.FI works in the token's **smallest unit**. USDC has 6 decimal places, so:
- 1 USDC = `"1000000"`
- 10 USDC = `"10000000"`
- 100.5 USDC = `"100500000"`

Your service must convert the human-readable amount string (e.g. `"10"`) to the correct smallest unit string before calling LI.FI.

---

## 🛠️ STEP 3 — WRITE THE NEW routeService.ts

Now you will replace the stub with a real implementation.

**Rules for this file:**
- Must export a function named `getRoute` — the toolExecutor depends on this exact name
- The function signature must accept the same parameters as the stub (check what you read in Step 1)
- The return value must include: `routeId`, `estimatedOutput`, `estimatedFeeUSD`, `estimatedTimeSeconds`, and `steps` (so Gemini can describe the plan to the user in plain English)
- Store the full LI.FI route object so `swapService.ts` can retrieve it by `routeId`
- Handle errors gracefully: if LI.FI returns no routes, return a clear error message the agent can relay to the user
- Map chain names (`"base"`, `"celo"`, `"ethereum"`) to LI.FI chain IDs (8453, 42220, 1)
- Map token symbols (`"USDC"`, `"ETH"`, `"cUSD"`, etc.) to their contract addresses on each chain

**Rough structure to implement:**

```typescript
// backend/src/services/routeService.ts

import { createConfig, getRoutes } from '@lifi/sdk';

// Initialize LI.FI once
createConfig({
  integrator: 'automata',
  apiKey: process.env.LIFI_API_KEY || undefined,
});

// In-memory route cache (routeId → full LI.FI route object)
// This lets swapService retrieve the route later without calling LI.FI again
const routeCache = new Map<string, any>();

// Chain name → LI.FI chain ID
const CHAIN_IDS: Record<string, number> = {
  base: 8453,
  celo: 42220,
  ethereum: 1,
};

// Token symbol + chain → contract address
const TOKEN_ADDRESSES: Record<string, Record<string, string>> = {
  USDC: {
    base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    celo: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
    ethereum: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  ETH: {
    base: '0x0000000000000000000000000000000000000000',
    ethereum: '0x0000000000000000000000000000000000000000',
  },
  CELO: {
    celo: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  },
  cUSD: {
    celo: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
  },
  cKES: {
    celo: '0x456a3D042C0DbD3db53D5489e98dFb038553B0d0',
  },
};

// Token symbol → decimal places
const TOKEN_DECIMALS: Record<string, number> = {
  USDC: 6,
  ETH: 18,
  CELO: 18,
  cUSD: 18,
  cKES: 18,
};

export async function getRoute(params: {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amount: string;
  walletAddress: string;
}): Promise<any> {
  // TODO: implement using the LI.FI SDK patterns described above
  // 1. Map chain names to chain IDs
  // 2. Map token symbols to addresses
  // 3. Convert amount to smallest unit
  // 4. Call getRoutes()
  // 5. Take the first (best) route
  // 6. Store route in routeCache with route.id as key
  // 7. Return a summary for Gemini to describe to the user
}

export function getCachedRoute(routeId: string): any {
  return routeCache.get(routeId);
}
```

**Fill in the `getRoute` function.** The LI.FI SDK usage is described in Step 2.
Do not return the entire LI.FI route object to Gemini — extract a clean summary with only
what the agent needs to describe the plan to the user.

---

## 🛠️ STEP 4 — WRITE THE NEW swapService.ts

**Rules for this file:**
- Must export a function named `buildSwapTx` — the toolExecutor depends on this exact name
- Accepts `{ routeId: string, walletAddress: string }`
- Looks up the route from the cache (using `getCachedRoute` from routeService)
- Calls `getStepTransaction(route.steps[0])` from LI.FI SDK
- Returns `{ unsignedTx: { to, data, value, chainId, description } }` where `description` is plain English
- Handle the case where routeId is not in cache (user may have a stale session)

**The return shape must match this exactly** (this is what toolExecutor passes to the agent):
```typescript
{
  unsignedTx: {
    to: string,       // contract address to call
    data: string,     // encoded calldata (hex)
    value: string,    // native token value in wei (usually "0" for ERC20 swaps)
    chainId: string,  // "base", "celo", or "ethereum"
    description: string  // e.g. "Swap 10 USDC to cUSD on Celo via LI.FI"
  }
}
```

---

## 🛠️ STEP 5 — VERIFY WITH TYPESCRIPT

After writing both files, run:
```bash
cd backend && npx tsc --noEmit
```

Fix every TypeScript error before continuing. Common issues to watch for:
- `@lifi/sdk` types may not match exactly — use `as any` sparingly if needed, but prefer proper types
- The `routeCache` Map may need explicit typing: `Map<string, RouteResponse>` — import `RouteResponse` from `@lifi/sdk`
- `amount` conversion (string to BigInt) — USDC has 6 decimals: `BigInt(Math.round(parseFloat(amount) * 1_000_000)).toString()`

---

## 🛠️ STEP 6 — TEST WITH A LIVE REQUEST

Start the backend:
```bash
cd backend && npm run dev
```

Send a test request:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is the best route to swap 10 USDC from Base to cUSD on Celo?",
    "walletAddress": "0x0000000000000000000000000000000000000001",
    "geminiApiKey": "YOUR_GEMINI_KEY_HERE",
    "sessionId": "test-lifi-001"
  }'
```

**Expected: the agent should call `get_route`, get a real route back from LI.FI, and respond with a plain-English description of the route, fees, and estimated time.**

If the agent returns an error or a generic response, check:
1. Is the backend terminal showing the `get_route` tool being called?
2. Is LI.FI returning routes? Add a `console.log(routesResult)` temporarily to check.
3. Is the amount conversion correct?

---

## 🛠️ STEP 7 — TEST THE SWAP TRANSACTION BUILD

Send a follow-up test that triggers `build_swap_tx`:
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Go ahead and build that swap transaction",
    "walletAddress": "0x0000000000000000000000000000000000000001",
    "geminiApiKey": "YOUR_GEMINI_KEY_HERE",
    "sessionId": "test-lifi-001"
  }'
```

**Expected: the agent calls `build_swap_tx`, gets back an `unsignedTx` object, and the API response includes `unsignedTxs` array with at least one transaction.**

Check the response body for:
```json
{
  "response": "...",
  "unsignedTxs": [
    {
      "to": "0x...",
      "data": "0x...",
      "value": "0",
      "chainId": "base",
      "description": "..."
    }
  ]
}
```

---

## 🛠️ STEP 8 — RUN THETYPESCRIPT CHECK ONE MORE TIME

```bash
cd backend && npx tsc --noEmit
```

Must return zero errors.

---

## 🛠️ STEP 9 — COMMIT

```bash
git add backend/src/services/routeService.ts
git add backend/src/services/swapService.ts
git commit -m "feat: replace LI.FI stubs with real @lifi/sdk integration"
git push
```

---

## 🛠️ STEP 10 — UPDATE PROGRESS.md

After committing, you MUST update PROGRESS.md. Apply the following patch:

```
## 📍 CURRENT POSITION

PHASE:   4 — REAL SERVICE IMPLEMENTATIONS
STEP:    4.2 — Replacing Circle CCTP bridge stub with real SDK
STATUS:  IN PROGRESS

Dev 1: Phase 4 Step 4.1 complete. routeService.ts and swapService.ts now use real @lifi/sdk.
Live route fetching and unsigned tx building verified with curl tests.

Next: Replace bridgeService.ts stub with real Circle CCTP V2 SDK calls.
```

Also mark in the UPCOMING section:
```
- [x] Step 4.1: Replace routeService.ts and swapService.ts mocks with real @lifi/sdk calls.
```

Commit the progress update:
```bash
git add PROGRESS.md
git commit -m "progress: Phase 4 Step 4.1 complete — LI.FI SDK integrated"
git push
```

---

## ✅ DONE WHEN — CHECKLIST

This step is complete ONLY when all of the following are true:

- [ ] `npx tsc --noEmit` returns zero errors
- [ ] `curl` test for `get_route` returns a real LI.FI route with real fees and timing
- [ ] `curl` test for `build_swap_tx` returns an `unsignedTx` with a real `to` address and `data` field (not empty, not hardcoded)
- [ ] No existing tests are broken — the balance check tool (`get_balances`) still works
- [ ] PROGRESS.md updated and committed

If any of these are failing, do not mark this step complete. Fix the issue first.

---

## ⚠️ THINGS THAT WILL BREAK IF YOU DO THEM — READ THIS

1. **Do not modify `toolExecutor.ts`** — the function names `getRoute` and `buildSwapTx` are hardcoded there. If you rename your exported functions, the agent will stop working.

2. **Do not modify `agent.ts`** — the tool-use loop is already working. Touching it risks breaking multi-turn conversations.

3. **Do not modify `index.ts`** — the session and walletAddress handling is already correct.

4. **Do not install a different version of `@lifi/sdk`** without checking for breaking changes. The SDK has gone through major API changes between v2 and v3. Run `npm show @lifi/sdk version` to confirm what version is installed, then read the changelog if you are uncertain.

5. **Do not hardcode wallet addresses** in the service — always use the `walletAddress` parameter passed in.

6. **Stellar is out of scope for LI.FI** — Stellar bridging is handled by Circle CCTP (Step 4.2). If the user asks to route to Stellar, `getRoute` should return an error message telling the agent to use `build_bridge_tx` instead.

---

## 🆘 COMMON ERRORS AND FIXES

| Error | Cause | Fix |
|---|---|---|
| `No routes found` from LI.FI | Amount too small, or token pair not supported on those chains | Try with 10 USDC. Check token addresses are correct for those chains. |
| `createConfig is not a function` | Wrong @lifi/sdk version installed | Run `npm show @lifi/sdk version`. If v2, API is different — check their migration guide. |
| `Cannot find module '@lifi/sdk'` | Package not installed | `cd backend && npm install @lifi/sdk` |
| TypeScript error on `RouteResponse` | Type not exported from @lifi/sdk | Use `import type { RoutesResponse } from '@lifi/sdk'` (check exact export name with `npm pack` or IDE) |
| `amount` conversion produces wrong number | Floating point issue | Use `BigInt(Math.round(parseFloat(amount) * Math.pow(10, decimals))).toString()` |
| Agent doesn't call `get_route` | Gemini didn't understand the intent | Check the system prompt in `prompts.ts` — the tool is already declared, the issue may be in the test message phrasing |

---

## 📚 REFERENCE LINKS

| Resource | URL |
|---|---|
| LI.FI SDK Docs | https://docs.li.fi/integrate-li.fi-sdk/li.fi-sdk |
| LI.FI SDK GitHub | https://github.com/lifinance/sdk |
| LI.FI Supported Chains + Tokens | https://docs.li.fi/list-chains-bridges-dexs-solvers |
| Base Chain Info | https://docs.base.org |
| Celo Chain Info | https://docs.celo.org |
| PROGRESS.md (project source of truth) | /Automata-V2/PROGRESS.md |

---

*This session covers ONE step only: Step 4.1 (LI.FI). Stop here. Next session starts with Step 4.2 (Circle CCTP).*
