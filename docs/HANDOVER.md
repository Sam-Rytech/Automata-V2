# Automata Docs — Handover

**Session date:** 2026-05-30  
**What we built:** A full `docs/` subdomain app inside `Automata-V2/` — 18 static pages, production build passing, zero TS errors.

---

## What was completed this session

Created `/home/jadonamite/Projects/Automata-V2/docs/` — a standalone Next.js 15 docs site with the Automata design system (`#0F0F1A` bg, `#E91E8C` pink, `#6A0DAD` purple, Syne + IBM Plex Mono fonts).

### Files created

```
docs/
├── package.json                   next 15, tailwind, typescript
├── tsconfig.json
├── tailwind.config.ts             Automata design tokens
├── postcss.config.mjs
├── next.config.ts                 output: standalone
├── app/
│   ├── globals.css                fonts, prose styles, callout boxes, token colours
│   ├── layout.tsx                 root layout with Sidebar
│   ├── page.tsx                   Introduction
│   ├── getting-started/page.tsx
│   ├── architecture/page.tsx
│   ├── concepts/page.tsx
│   ├── api-reference/page.tsx
│   ├── agent/page.tsx
│   ├── chains/page.tsx
│   ├── bridging/page.tsx
│   ├── swaps/page.tsx
│   ├── yield/page.tsx
│   ├── contracts/page.tsx
│   ├── frontend/page.tsx
│   ├── database/page.tsx
│   ├── x402/page.tsx
│   └── status/page.tsx
└── components/
    ├── Sidebar.tsx                fixed left nav, active-link highlighting
    ├── CodeBlock.tsx              styled code block + Inline component
    └── NavCards.tsx               'use client' hover cards on intro page
```

### Build status
`npm run build` → **18 static pages, exit 0, zero errors.**  
Dev server: `npm run dev` from `docs/` — runs on port 3002.

---

## What each page documents

| Page | Key content |
|---|---|
| `/` | What Automata is, chain table, integrations table |
| `/getting-started` | Prerequisites, install, both .env files verbatim, curl test |
| `/architecture` | ASCII system diagram, unsigned tx model, full tech stack table, complete bridge data flow |
| `/concepts` | Language rules, Chat vs Flow Builder, Assisted vs Autonomous, session model |
| `/api-reference` | All 8 endpoints + WebSocket — full request/response schemas |
| `/agent` | Gemini tool-use loop code, sanitizeHistory, system prompt breakdown, all 10 tools with params |
| `/chains` | All 4 chains — contract addrs, CCTP domains, Aave pool addrs, Stellar adapter code |
| `/bridging` | CCTP V2 4-step flow, approve/burn calldata, Iris polling, frontend executor code |
| `/swaps` | LI.FI route cache, buildSwapTx, Stellar path payment, slippage rules |
| `/yield` | Aave V3 ray-to-APY, LI.FI Earn dual API, buildEarnDepositTx, 55s quote TTL |
| `/contracts` | AutomataRouter (executeBatch, fee sweep, reentrancy), AutomataYieldVault (ERC-4626 math) |
| `/frontend` | Design tokens, Privy config, OAuth fix, useTransactionExecutor, lib/api.ts |
| `/database` | Full Prisma schema, model docs, session limitation note |
| `/x402` | x402 protocol, 402 payload, autonomous agent payment flow |
| `/status` | ✅/🟡/🔴 breakdown from STATUS.md, priority actions |

---

## Immediate next tasks

1. **Deploy to docs subdomain** — add a `vercel.json` to `docs/` and deploy. Set `docs.automata.xyz` (or whatever domain) as the custom domain in Vercel.

2. **Missing page: `/concepts` is thin** — the Core Concepts page could use more depth on the Flow Builder execution model and the `actions[]` JSON shape from `shared/types/Action.ts`.

3. **Add search** — consider adding [Pagefind](https://pagefind.app) (static search, no server) as a post-build step. Fits the static export model perfectly.

4. **Add OpenGraph metadata** — each page's `metadata` export has `title` but no `og:image` or `description`. Add these for social sharing.

5. **Vercel deployment config** — create `docs/vercel.json`:
   ```json
   { "buildCommand": "npm run build", "outputDirectory": ".next", "framework": "nextjs" }
   ```

---

## Key Automata project facts (for next session)

- Monorepo at `~/Projects/Automata-V2/`
- Backend runs on port 3001 (HTTP + WebSocket), `cd backend && npm run dev`
- Frontend runs on port 3000, `cd frontend && npm run dev`
- x402 server runs on port 3002, `cd x402-yield-server && npm run dev`
- Docs site runs on port 3002 (conflict with x402 — change one if running both)
- Backend entry: `backend/src/index.ts` — Express + WS server
- Agent: `backend/src/agent/agent.ts` — Gemini 2.5 Flash, max 10 tool iterations
- CCTP contracts verified April 2026: TokenMessenger `0x28b5a0e9...`, MessageTransmitter `0x81D40F21...` (same address all EVM chains via CREATE2)
- All contracts undeployed (AutomataRouter.sol, AutomataYieldVault.sol, 3 Clarity contracts)
- Sessions are in-memory (Map) — lost on restart, Prisma Session model exists but unused
- Gemini API key stored client-side in localStorage, sent per request, never persisted server-side

---

## Pending from STATUS.md (priority order)

1. Wire Stacks tools into `tools.ts` + `toolExecutor.ts` (highest TP value)
2. Deploy `AutomataRouter.sol` to Celo testnet via Remix (~30 min)
3. Implement real Mento `swapIn()` calldata in `stakeService.ts`
4. Migrate sessions from in-memory Map to Prisma
5. Delete dead files: `scripts/artist.cjs`, `scripts/Elite.cjs`, `}` (empty file), `10` (empty file)
