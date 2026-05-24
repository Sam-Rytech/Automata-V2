# Automata Contracts — Walkthrough

Five contracts that supercharge the Automata agent: 2 on Celo (Solidity, Remix-ready) and 3 on Stacks (Clarity, Clarinet-checked).

```
contracts/
├── evm/
│   ├── AutomataRouter.sol         # batched multicall executor
│   └── AutomataYieldVault.sol     # ERC-4626 yield vault (cUSD/USDC)
└── stacks/
    ├── Clarinet.toml              # project: automata-stacks
    └── contracts/
        ├── automata-stacker.clar  # delegated PoX stacking pool
        ├── automata-sbtc-vault.clar # per-user sBTC deposit vault
        └── automata-intent.clar   # cross-chain intent registry
```

All Stacks contracts pass `clarinet check` (clarity v3, epoch latest — Nakamoto-compatible).

---

## 1. EVM (Celo) — Deploy via Remix

### Network setup (one-time)
In MetaMask add Celo Mainnet:
- Network: `Celo Mainnet`
- RPC: `https://forno.celo.org`
- Chain ID: `42220`
- Symbol: `CELO`
- Explorer: `https://celoscan.io`

For testnet (Alfajores): RPC `https://alfajores-forno.celo-testnet.org`, chain ID `44787`, explorer `https://alfajores.celoscan.io`.

### `AutomataRouter.sol`

**Purpose:** Collapse N-step plans (approve → swap → bridge → stake) into one user signature. Backend builds a `Call[]` array and a list of `sweepTokens`; user signs once.

**Constructor args:**
- `_feeRecipient` (address): treasury that receives the platform fee (use your own EOA for v1)
- `_feeBps` (uint16): platform fee in basis points, max 100 (1%). Use `0` to start, ramp later.

**Deploy steps (Remix):**
1. Open https://remix.ethereum.org
2. Create file `AutomataRouter.sol`, paste contents of `contracts/evm/AutomataRouter.sol`.
3. Solidity compiler tab: `0.8.24+`, EVM version `paris` or `shanghai`, optimizer ON (200 runs).
4. Deploy & Run tab: environment `Injected Provider — MetaMask`, MetaMask on Celo.
5. Constructor: `_feeRecipient = <your treasury>`, `_feeBps = 0`.
6. Deploy. Confirm in MetaMask. Save the deployed address.

**Post-deploy:**
- `setFee(50, treasury)` to turn on a 0.5% fee later — never above 100 bps (1%).
- `rescue(token, amount, to)` only as emergency owner-only escape hatch.

**Backend wiring:** in `backend/src/services/`, add `routerService.ts` that:
1. Builds `Call[]` from the agent's planned actions.
2. Returns a single `unsignedTx` calling `executeBatch(calls, sweepTokens)`.
3. Replace the array of unsigned txs the agent currently returns when chain == celo.

### `AutomataYieldVault.sol`

**Purpose:** Single ERC-4626 deposit target on Celo for the agent's "Earn" leg. The vault holds the underlying (cUSD or USDC) and forwards capital to a swappable `strategy` contract that integrates Mento/Aave/Moola. Strategy is owner-settable so it can be upgraded without users migrating shares.

**Constructor args:**
- `_asset` (address): underlying ERC-20 — for cUSD on Celo Mainnet use `0x765DE816845861e75A25fCA122bb6898B8B1282a`. For USDC use `0xcebA9300f2b948710d2653dD7B07f33A8B32118C`.
- `_name` (string): e.g. `"Automata cUSD Vault"`
- `_symbol` (string): e.g. `"aCUSD"`
- `_feeRecipient` (address): your treasury
- `_performanceFeeBps` (uint16): 0–2000 (max 20%). Start at `1000` (10%) of profit only.

**Deploy steps:**
Same as Router — paste, compile, deploy.

**Post-deploy ordering:**
1. Deploy a `Strategy` contract (not in this set — that's Phase 2; can stub with a contract that just holds and returns idle assets).
2. Call `vault.setStrategy(strategyAddress)`. The vault forwards idle assets to the new strategy automatically.
3. To rotate strategies later, just call `setStrategy(newAddr)` — the vault pulls all assets out of the old one and pushes them into the new one in the same tx.

**Backend wiring:** in `backend/src/services/stakeService.ts`, the `build_stake_tx` tool collapses to one path: `vault.deposit(amount, walletAddress)` instead of routing per protocol. The vault becomes the universal "Earn" endpoint for Celo.

---

## 2. Stacks — Run with Clarinet

### Dev loop

```bash
cd contracts/stacks

# Static check (already passing)
clarinet check

# Interactive REPL with all 3 contracts pre-deployed to simnet
clarinet console

# Run unit tests (Vitest + clarinet-sdk)
npm install
npm test
```

Tests live in `contracts/stacks/tests/` — one stub per contract was generated alongside the contracts. Flesh them out before mainnet.

### `automata-stacker.clar`

**What it does:** On-chain registry for a delegated PoX-4 stacking pool. STX itself stays in the user's account — PoX-4 locks it there. This contract just records who's enrolled, how much each user delegated, their BTC reward address, and emits a `stack-signal` event when the operator triggers a stacking cycle.

**Off-chain operator flow (per cycle):**
1. User calls canonical `pox-4.delegate-stx` with `delegate-to = <this contract>`.
2. User calls `automata-stacker.enroll(amount-ustx, pox-addr)`.
3. Operator calls `automata-stacker.stack-signal(user, start-burn-ht, lock-period)` for each enrolled user.
4. An off-chain runner watching for `stack-signal` events calls `pox-4.delegate-stack-stx` per user.

The reason the actual PoX-4 call sits off-chain is that pinning a specific pox-4 contract address inside this contract locks you into one epoch. Stacks rotates pox-N contracts at each fork. Keeping the call out makes this contract epoch-stable.

**Admin functions (owner-only):**
- `set-operator(principal)` — rotates the pool operator
- `set-paused(bool)` — emergency pause on new enrollments

### `automata-sbtc-vault.clar`

**What it does:** Per-principal sBTC custody. User calls `deposit(token, amount)`, contract pulls sBTC via SIP-010 `transfer`, balance is recorded. `withdraw` reverses it.

**Setup after deploy:**
1. Call `set-sbtc-token(<sbtc-token-principal>)` — mainnet sBTC token contract is `SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token`.
2. Call `set-paused(false)` (it's false by default).

This is the foundation for BTC-collateral strategies and intent fulfilment. v1 doesn't auto-deploy capital — it just custodies.

### `automata-intent.clar`

**What it does:** Users post cross-chain intents ("convert 0.1 sBTC to USDC on Base, deadline block H"). Whitelisted solvers fulfil off-chain and call `fulfill-intent(id, proof)`. The intent lifecycle (open → fulfilled / cancelled / expired) is tracked on-chain so the agent and frontend can show status without trusting solver claims alone.

**Setup after deploy:**
- Call `set-solver(<solver-principal>, true)` for each solver you whitelist.
- v1 trust model: whitelisted solver = trusted. v2 can require Bitcoin SPV proofs or sBTC peg-out proofs by validating the `proof` buffer.

### Deploy plan

For testnet:

```bash
clarinet deployments generate --testnet --low-cost
clarinet deployments apply -p deployments/default.testnet-plan.yaml
```

Pre-flight: `settings/Testnet.toml` needs a funded mnemonic. Get testnet STX at https://explorer.hiro.so/sandbox/faucet?chain=testnet.

For mainnet, swap `--testnet` for `--mainnet` and use `settings/Mainnet.toml`. **Test on testnet first** — at minimum:
1. Stacker: enroll → update-amount → leave roundtrip.
2. Vault: set-sbtc-token → deposit → withdraw roundtrip.
3. Intent: set-solver → post-intent → fulfill-intent → mark-expired roundtrip.

---

## 3. Wiring contracts into the agent

After deploy, add a new file `backend/src/config/contracts.ts`:

```ts
export const CONTRACTS = {
  celo: {
    router: '0x...',           // AutomataRouter
    yieldVault: '0x...',       // AutomataYieldVault
    cUSD: '0x765DE816845861e75A25fCA122bb6898B8B1282a',
    USDC: '0xcebA9300f2b948710d2653dD7B07f33A8B32118C',
  },
  stacks: {
    stacker:   'SP....automata-stacker',
    sbtcVault: 'SP....automata-sbtc-vault',
    intent:    'SP....automata-intent',
    sbtcToken: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
  },
} as const;
```

Then update three service files:

| Service | Change |
|---|---|
| `swapService.ts` / `bridgeService.ts` / `stakeService.ts` | When chain == celo, wrap all sub-calls into a single `AutomataRouter.executeBatch` tx. Reduces the agent's returned `unsignedTxs[]` from N entries to 1 for Celo paths. |
| `stakeService.ts` | When chain == celo, target `AutomataYieldVault.deposit` instead of routing per protocol. |
| `agent/tools.ts` | Add new tool declarations: `enroll_stacker`, `deposit_sbtc`, `post_intent`. Wire to executors in `toolExecutor.ts` that build Stacks `unsignedTx` payloads using `@stacks/transactions`. |

Stacks transaction building is different from EVM — instead of `viem` calldata, you produce a `ContractCallPayload` and let the frontend sign through `@stacks/connect` (the Stacks side of Privy / Hiro Wallet). The agent's existing `unsignedTxs` array becomes a polymorphic union of `{ chain: 'evm', to, data, value }` and `{ chain: 'stacks', contractAddress, contractName, functionName, functionArgs }`.

---

## 4. What I'd do next (priority order)

1. **Test the 3 Clarity contracts** in `tests/*.test.ts` — vitest + clarinet-sdk gives you a real simnet. Cover the success path + every revert. This is the cheapest insurance before any mainnet STX touches the contract.
2. **Deploy `AutomataRouter` on Celo Alfajores** via Remix. Verify it batches a 2-call sequence (approve + transfer) end-to-end with a test wallet.
3. **Deploy `automata-stacker` on Stacks testnet**, enrol one address, run a full PoX-4 cycle on testnet. This is the biggest Talent Protocol score driver — Stacks ecosystem commits + onchain txs + unique callers all stack here.
4. **Wire the agent** (`tools.ts` + `toolExecutor.ts` + `contracts.ts`) to produce contract-targeted unsigned txs.
5. **Deploy `AutomataYieldVault`** with a placeholder strategy that just holds funds (no Mento yet). Get the deposit/withdraw roundtrip working, then iterate on the strategy contract separately.
6. **`automata-sbtc-vault`** and **`automata-intent`** can ship together once the agent supports Stacks `unsignedTxs` — they share the same wallet plumbing.

---

## 5. Known gaps / v2 items

- **Router doesn't enforce per-call source.** A malicious calldata array could call arbitrary contracts. v1 trusts the agent to build correct sequences. v2 should whitelist target contracts (LI.FI, Circle CCTP, Aave, Mento) at deploy time.
- **YieldVault has no strategy contract yet.** v1 holds funds idle until a strategy is set. Build `MentoStrategy.sol` next so deposits earn from day one.
- **Stacker doesn't auto-distribute BTC rewards.** PoX-4 pays rewards directly to the `pox-addr` each user supplied — no on-chain distribution logic is needed. But you'll want an off-chain dashboard that maps `pox-addr` rewards back to enrolled users.
- **Intent registry has no escrow.** Users post intents but don't lock funds against them. v2: lock sBTC or STX in the registry at `post-intent`, release to solver on `fulfill-intent`. Requires careful proof verification.
- **Trait reference is inlined in `automata-sbtc-vault`.** Before mainnet, switch to `use-trait` against the canonical SIP-010 trait contract.
