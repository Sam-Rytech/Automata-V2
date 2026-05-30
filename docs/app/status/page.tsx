import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Project Status' }

function Badge({ color, label }: { color: string; label: string }) {
  const colors: Record<string, { bg: string; border: string; text: string }> = {
    green:  { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22C55E' },
    yellow: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', text: '#F59E0B' },
    red:    { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#EF4444' },
  }
  const c = colors[color] || colors.yellow
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: 'IBM Plex Mono, monospace',
        fontSize: '0.7rem',
        fontWeight: 600,
        padding: '2px 8px',
        borderRadius: '3px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

export default function StatusPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>14 ——</p>
      <h1>Project Status</h1>
      <p>
        Honest accounting of what is done, what looks done but isn&apos;t, and what hasn&apos;t been
        started. Last updated: 2026-05-30.
      </p>

      <h2>✅ Working End-to-End</h2>
      <table>
        <thead><tr><th>Feature</th><th>Status</th><th>Notes</th></tr></thead>
        <tbody>
          <tr>
            <td>Gemini agent loop</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Tool-use loop bounded at 10 iterations. History sanitization prevents crashes on multi-turn conversations.</td>
          </tr>
          <tr>
            <td>Circle CCTP V2 bridge (EVM→EVM)</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Real approve + depositForBurn calldata. Attestation polling against Circle Iris V2 API. Tested Base → Celo.</td>
          </tr>
          <tr>
            <td>LI.FI swap routing</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Real SDK integration. 2-minute quote cache. getStepTransaction() for live calldata.</td>
          </tr>
          <tr>
            <td>Aave V3 yield reads</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>On-chain APY reads from Pool.getReserveData() on Base and Ethereum. Ray-to-APY conversion. 5-minute cache.</td>
          </tr>
          <tr>
            <td>LI.FI Earn API integration</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Vault discovery via earn.li.fi. Deposit quotes via li.quest Composer API. 55-second quote TTL.</td>
          </tr>
          <tr>
            <td>Stellar balance reads</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>XLM + USDC balances via Horizon loadAccount(). Graceful empty return on missing trustlines.</td>
          </tr>
          <tr>
            <td>Stellar transfers (XLM + USDC)</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>buildStellarTransfer() builds XDR payment operations. Both XLM native asset and Circle USDC supported.</td>
          </tr>
          <tr>
            <td>Stellar DEX path payments</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>buildStellarPathPayment() with pathPaymentStrictSend. Empty path = Horizon auto-routes.</td>
          </tr>
          <tr>
            <td>EVM balance reads</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>viem readContract for USDC ERC-20 balances + getNativeBalance for ETH/CELO on all 3 EVM chains.</td>
          </tr>
          <tr>
            <td>Frontend — all 5 pages</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Landing, /chat, /build, /history, /settings all built and rendered.</td>
          </tr>
          <tr>
            <td>Privy wallet integration</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Embedded wallets (Google OAuth) + external connectors. EVM signing via eth_sendTransaction.</td>
          </tr>
          <tr>
            <td>React Flow canvas</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Drag-drop node builder renders and connects. 4 node types: BRIDGE, SWAP, STAKE, SEND.</td>
          </tr>
          <tr>
            <td>Prisma schema</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>User, Flow, Session, Transaction models. Migrations passing. Studio UI working.</td>
          </tr>
          <tr>
            <td>x402 yield server</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>Custom Stellar x402 middleware. Returns correct 402 payload with payment instructions.</td>
          </tr>
          <tr>
            <td>WebSocket server</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>ws server on same port as HTTP. Handles monitor messages. pollTransactionStatus() wired.</td>
          </tr>
          <tr>
            <td>Transaction history (DB)</td>
            <td><Badge color="green" label="LIVE" /></td>
            <td>POST /api/history and GET /api/history/:wallet working. Frontend logs on both success and failure.</td>
          </tr>
        </tbody>
      </table>

      <h2>🟡 Partial — Looks Done But Isn&apos;t</h2>
      <table>
        <thead><tr><th>Feature</th><th>Status</th><th>What&apos;s Missing</th></tr></thead>
        <tbody>
          <tr>
            <td>Mento / Celo staking</td>
            <td><Badge color="yellow" label="STUB" /></td>
            <td><code>stakeService.ts</code> returns a placeholder. Real <code>swapIn()</code> calldata for Mento not implemented. Users who try to stake cUSD on Celo will fail silently.</td>
          </tr>
          <tr>
            <td>Stacks integration</td>
            <td><Badge color="yellow" label="PARTIAL" /></td>
            <td>3 Clarity contracts written + ~80% test coverage. Zero agent wiring — <code>enroll_stacker</code>, <code>deposit_sbtc</code>, <code>post_intent</code> not in <code>tools.ts</code> or <code>toolExecutor.ts</code>. Agent cannot interact with Stacks at all.</td>
          </tr>
          <tr>
            <td>Flow builder execution</td>
            <td><Badge color="yellow" label="PARTIAL" /></td>
            <td>Canvas renders and connects nodes visually. Full execution sequencing untested. Saved flows cannot be loaded or edited in the UI (API endpoints exist, UI doesn&apos;t wire them).</td>
          </tr>
          <tr>
            <td>WebSocket tx monitoring</td>
            <td><Badge color="yellow" label="PARTIAL" /></td>
            <td>Server code and client wiring exist but real-device testing hasn&apos;t happened.</td>
          </tr>
          <tr>
            <td>Session persistence</td>
            <td><Badge color="yellow" label="IN-MEMORY" /></td>
            <td>Sessions live in <code>Map&lt;sessionId, history&gt;</code> — reset on every server restart. Session Prisma model exists but is unused.</td>
          </tr>
          <tr>
            <td>ENS / phone resolver</td>
            <td><Badge color="yellow" label="STUB" /></td>
            <td><code>resolverService.ts</code> returns &quot;not yet implemented&quot; for all inputs.</td>
          </tr>
          <tr>
            <td>Fee estimation</td>
            <td><Badge color="yellow" label="STUB" /></td>
            <td><code>feeService.ts</code> returns a flat $0.30 × actions.length. No real gas reads.</td>
          </tr>
          <tr>
            <td>Multi-model AI support</td>
            <td><Badge color="yellow" label="UI ONLY" /></td>
            <td>Settings page shows Gemini / GPT-4o / Claude cards. Only Gemini actually works — other models are UI placeholders.</td>
          </tr>
          <tr>
            <td>MiniPay integration</td>
            <td><Badge color="yellow" label="WIRED" /></td>
            <td><code>MiniPayProvider.tsx</code> is wired but untested on a real Celo MiniPay device (Opera Mini with MiniPay embedded wallet).</td>
          </tr>
          <tr>
            <td>x402 agent payment</td>
            <td><Badge color="yellow" label="SYSTEM PROMPT" /></td>
            <td>Agent is instructed to pay in the system prompt but lacks an operational Stellar wallet on the server to actually execute payments autonomously.</td>
          </tr>
        </tbody>
      </table>

      <h2>🔴 Not Deployed</h2>
      <table>
        <thead><tr><th>Item</th><th>Status</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>AutomataRouter.sol</td><td><Badge color="red" label="UNDEPLOYED" /></td><td>Written and reviewed. Never deployed on any chain. Celo testnet deployment is ~30 min in Remix.</td></tr>
          <tr><td>AutomataYieldVault.sol</td><td><Badge color="red" label="UNDEPLOYED" /></td><td>Written. No strategy contract exists yet (Mento integration pending).</td></tr>
          <tr><td>automata-stacker.clar</td><td><Badge color="red" label="UNDEPLOYED" /></td><td>Written + tested. Never deployed to Stacks testnet or mainnet.</td></tr>
          <tr><td>automata-sbtc-vault.clar</td><td><Badge color="red" label="UNDEPLOYED" /></td><td>Written. Not wired to agent. Not deployed.</td></tr>
          <tr><td>automata-intent.clar</td><td><Badge color="red" label="UNDEPLOYED" /></td><td>Written. No escrow or proof validation (v2 feature). Not deployed.</td></tr>
          <tr><td>Stellar CCTP relay</td><td><Badge color="red" label="DEFERRED" /></td><td>Circle has not published Stellar mainnet CCTP contract addresses. Relay is implemented, waiting on Circle.</td></tr>
          <tr><td>Contract address config</td><td><Badge color="red" label="MISSING" /></td><td><code>backend/src/config/contracts.ts</code> doesn&apos;t exist. Addresses are hardcoded in service files.</td></tr>
        </tbody>
      </table>

      <h2>Priority Actions to Unblock</h2>
      <ol>
        <li>
          <strong>Wire Stacks tools</strong> — add <code>enroll_stacker</code>,{' '}
          <code>deposit_sbtc</code>, <code>post_intent</code> to <code>tools.ts</code> and{' '}
          <code>toolExecutor.ts</code>. Highest TP (Talent Protocol) value work currently unblocked.
        </li>
        <li>
          <strong>Deploy AutomataRouter</strong> — 30 minutes in Remix on Celo testnet. Save the
          address to a new <code>backend/src/config/contracts.ts</code> file.
        </li>
        <li>
          <strong>Implement Mento swapIn() calldata</strong> in <code>stakeService.ts</code>. The
          Phase 5 TODO is blocking the entire Celo earn flow.
        </li>
        <li>
          <strong>Migrate sessions to Prisma</strong> — add session creation and lookup to{' '}
          <code>/api/chat</code>. The model is already defined; it&apos;s a ~30-line change.
        </li>
        <li>
          <strong>Delete dead files</strong> — <code>scripts/artist.cjs</code> (28KB unused build
          artifact), <code>scripts/Elite.cjs</code> (4.9KB unused), and the empty files{' '}
          <code>{'"}"'}</code> and <code>{"10"}</code> in the root.
        </li>
      </ol>

      <h2>Git Health</h2>
      <p>
        The last 50+ commits are dominated by import reorganisation, quote style normalisation,
        and repeated &quot;chore: revert experimental changes&quot; commits. No meaningful feature commits
        in the recent history. Find what is generating these auto-style commits and stop it before
        it obscures real work.
      </p>
    </div>
  )
}
