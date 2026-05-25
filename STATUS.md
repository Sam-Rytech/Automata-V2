# Automata V2 — Status: What's Actually Done vs What Looks Done

> Last updated: 2026-05-25

---

## The Honest Breakdown

### ✅ Actually Done (Works End-to-End)

| Feature | Notes |
|---|---|
| Gemini agent loop | Tool-use loop bounded at 10 iterations, history sanitization prevents crashes |
| Circle CCTP V2 bridge | Real calldata generation, attestation polling against Circle Iris API |
| LI.FI swap routing | Real SDK integration, 2-min quote cache |
| Aave V3 yield reads | APY reads + supply calldata building functional |
| Stellar path payments | Real Stellar SDK, balance reads, path payment tx building |
| EVM balance reads | viem-based, all 3 chains (Base, Celo, ETH) |
| Frontend — all 5 pages | Landing, chat, flow builder, history, settings all built |
| Privy wallet integration | Embedded + external wallets, EVM signing |
| React Flow canvas | Drag-drop node builder renders and connects |
| Prisma schema | User, Flow, Transaction models defined, migrations passing |
| Clarity contracts (check) | All 3 Stacks contracts pass `clarinet check`, ~80% test coverage |

---

### 🟡 Looks Done But Isn't

| Feature | What's Missing |
|---|---|
| **Mento/Celo staking** | `stakeService.ts` builds a **placeholder** — real `swapIn()` calldata not implemented. Users who try to stake cUSD on Celo will fail silently. Marked `// TODO Phase 5` |
| **Stacks integration** | 3 contracts written + tested, but **zero agent wiring** — `enroll_stacker`, `deposit_sbtc`, `post_intent` don't exist in `tools.ts` or `toolExecutor.ts`. Agent cannot interact with Stacks at all. |
| **Flow builder execution** | Canvas renders and connects nodes visually, but full execution sequencing is untested. Saved flows can't be loaded or edited in the UI (API endpoints exist, UI doesn't use them). |
| **WebSocket tx monitoring** | Server code exists, client wires up, but real-device testing hasn't happened |
| **Session persistence** | Sessions live in an in-memory `Map` — die on every server restart. Should be Prisma. Marked as Phase 3 TODO. |
| **ENS / phone resolver** | `resolverService.ts` is a stub. Returns nothing. |
| **Fee estimation** | `feeService.ts` is a stub. Returns nothing. |

---

### 🔴 Not Done (Code Exists, Nothing Deployed)

| Item | State |
|---|---|
| `AutomataRouter.sol` | Written, never deployed on any chain. Celo testnet address: none. |
| `AutomataYieldVault.sol` | Written, never deployed. No strategy contract exists for it yet (Mento integration pending). |
| `automata-stacker.clar` | Written + tested, never deployed to Stacks testnet or mainnet. |
| `automata-sbtc-vault.clar` | Written, not wired to agent, not deployed. |
| `automata-intent.clar` | Written, no escrow or proof validation (v2 feature), not deployed. |
| Stellar CCTP relay | Deferred — Circle hasn't published Stellar CCTP contract addresses yet. |
| Contract address config | `backend/src/config/contracts.ts` doesn't exist. Addresses are hardcoded or missing. |
| MiniPay integration | `MiniPayProvider.tsx` is wired but untested on a real Celo MiniPay device. |
| Multi-provider AI | Frontend shows Gemini/GPT/Claude card UI but only Gemini works. |

---

### ⚠️ Git Health

The last 50+ commits are dominated by:
- Import reorganization
- Quote style normalization (single → double)
- Variable renames (`data → payload`)
- Repeated "chore: revert experimental changes — restore clean state" (4+ times)

No meaningful feature commits in the last 2 weeks. The repo is spinning, not moving forward. Find what's generating these auto-style commits and stop it.

Dead files to delete:
```
scripts/artist.cjs     # 28KB build artifact, unused
scripts/Elite.cjs      # 4.9KB, unused
"}"                    # empty file at root
"10"                   # empty file at root
```

---

## Priority Actions to Unblock

1. **Wire Stacks tools** — add `enroll_stacker`, `deposit_sbtc`, `post_intent` to `tools.ts` + `toolExecutor.ts`. This is the highest TP-value unblocked work.
2. **Deploy `AutomataRouter`** — 30 min in Remix on Celo testnet. Save address to a `contracts.ts` config.
3. **Implement Mento `swapIn()` calldata** in `stakeService.ts`. The Phase 5 TODO is blocking the entire Celo earn flow.
4. **Migrate sessions to Prisma** — add a `sessions` table. Server restart currently resets all conversations.
5. **Delete dead files** — `scripts/artist.cjs`, `scripts/Elite.cjs`, `"}"`, `"10"`.
