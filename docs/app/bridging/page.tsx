import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = {
  title: 'Bridging (CCTP V2)',
  description: 'CCTP V2 four-step bridge flow, approve/burn calldata, Iris polling, and the frontend executor implementation.',
  openGraph: {
    title: 'Bridging — Automata Docs',
    description: 'CCTP V2 four-step bridge flow, approve/burn calldata, Iris polling, and the frontend executor implementation.',
  },
}

export default function BridgingPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>05 ——</p>
      <h1>Bridging (CCTP V2)</h1>
      <p>
        Automata uses <strong>Circle&apos;s Cross-Chain Transfer Protocol V2</strong> for USDC bridging.
        CCTP V2 is a burn-and-mint protocol — USDC is burned on the source chain, Circle attests
        to the burn, and USDC is minted natively on the destination chain. No wrapped tokens, no
        custodial bridges.
      </p>

      <h2>Why CCTP V2</h2>
      <ul>
        <li>Native USDC on both sides — no bridge-wrapped USDC (e.g. axlUSDC, madUSDC)</li>
        <li>Circle acts as the attestation authority — minimal trust surface</li>
        <li>Free for users — no bridge fee beyond the network transaction fee</li>
        <li>Supported on all four Phase 1 chains natively</li>
        <li>~90 second end-to-end on mainnet (attestation latency)</li>
      </ul>

      <h2>Contract Addresses</h2>
      <p>
        CCTP V2 contracts are deployed at the same address on every chain via CREATE2. Verified
        on Basescan and Etherscan as of April 2026.
      </p>
      <table>
        <thead><tr><th>Contract</th><th>Address (all EVM chains)</th></tr></thead>
        <tbody>
          <tr>
            <td>TokenMessenger V2</td>
            <td><code>0x28b5a0e9C621a5BADaa536219b3a228C8168cF5d</code></td>
          </tr>
          <tr>
            <td>MessageTransmitter V2</td>
            <td><code>0x81D40F21F12A8F0E3252Bccb954D722d4c464B64</code></td>
          </tr>
        </tbody>
      </table>

      <table>
        <thead><tr><th>Chain</th><th>USDC Address</th><th>CCTP Domain</th></tr></thead>
        <tbody>
          <tr><td>Ethereum</td><td><code>0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48</code></td><td>0</td></tr>
          <tr><td>Base</td><td><code>0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913</code></td><td>6</td></tr>
          <tr><td>Celo</td><td><code>0xcebA9300f2b948710d2653dD7B07f33A8B32118C</code></td><td>7</td></tr>
          <tr><td>Stellar</td><td>Circle-issued (Soroban)</td><td>27</td></tr>
        </tbody>
      </table>

      <h2>The Bridge Flow (EVM → EVM)</h2>
      <p>Bridging USDC between two EVM chains requires four transactions across two signing steps:</p>
      <CodeBlock language="text">
{`Step 1 — Approve (user signs on source chain)
  Contract:  USDC ERC-20
  Function:  approve(spender=TokenMessenger, amount)
  Purpose:   Allow the TokenMessenger to pull USDC from the user's wallet

Step 2 — Burn (user signs on source chain)
  Contract:  TokenMessenger V2
  Function:  depositForBurn(amount, destinationDomain, mintRecipient, burnToken)
  Parameters:
    amount             uint256  — USDC amount in smallest units (6 decimals)
    destinationDomain  uint32   — target chain's CCTP domain ID
    mintRecipient      bytes32  — recipient address padded to 32 bytes
    burnToken          address  — USDC contract on source chain
  Result: emits MessageSent(message) event

  ← User waits ~90 seconds for Circle to attest the burn ←

Step 3 — Attestation (server-side, invisible to user)
  Backend polls: GET https://iris-api.circle.com/v2/messages/{domain}?transactionHash={hash}
  Returns: { messages[0].message, messages[0].attestation }
  Polling: every 5 seconds, max 60 attempts (5 minutes)

Step 4 — Mint (user signs on destination chain)
  Contract:  MessageTransmitter V2 (same address on destination chain)
  Function:  receiveMessage(message, attestation)
  Result: USDC minted to mintRecipient on destination chain`}
      </CodeBlock>

      <h3>buildBridgeTx — source code</h3>
      <CodeBlock language="typescript" filename="backend/src/services/bridgeService.ts">
{`export async function buildBridgeTx(params: {
  fromChain: string; toChain: string; amount: string;
  walletAddress: string; recipientAddress: string;
}): Promise<any> {

  const amountInUnits = parseUnits(amount, 6)  // USDC has 6 decimals

  // TX 1: approve
  const approveData = encodeFunctionData({
    abi: ERC20_APPROVE_ABI,
    functionName: 'approve',
    args: [TOKEN_MESSENGER_V2[fromChain], amountInUnits],
  })

  const approveTx = {
    to: USDC_ADDRESS[fromChain],
    data: approveData,
    value: '0',
    chainId: fromChain,
    description: \`Authorise \${amount} USDC to move from \${fromChain}\`,
    txType: 'approve',
  }

  // TX 2: depositForBurn
  const mintRecipient = addressToBytes32(recipientAddress)
  const burnData = encodeFunctionData({
    abi: DEPOSIT_FOR_BURN_ABI,
    functionName: 'depositForBurn',
    args: [amountInUnits, CCTP_DOMAIN[toChain], mintRecipient, USDC_ADDRESS[fromChain]],
  })

  const burnTx = {
    to: TOKEN_MESSENGER_V2[fromChain],
    data: burnData,
    value: '0',
    chainId: fromChain,
    description: \`Send \${amount} USDC from \${fromChain} to \${toChain}\`,
    txType: 'burn',
    bridgeMeta: { sourceChain: fromChain, destinationChain: toChain,
                  sourceDomain: CCTP_DOMAIN[fromChain], recipientAddress, amount },
  }

  return {
    description: \`Move \${amount} USDC from \${fromChain} to \${toChain}\`,
    unsignedTxs: [approveTx, burnTx],
    summary: { fromChain, toChain, amount, estimatedTimeSeconds: 90, estimatedFeeUSD: '< $0.01' },
  }
}`}
      </CodeBlock>

      <h3>Address encoding</h3>
      <p>
        CCTP requires recipient addresses to be padded to 32 bytes. The helper{' '}
        <code>addressToBytes32</code> handles this:
      </p>
      <CodeBlock language="typescript">
{`function addressToBytes32(address: string): \`0x\${string}\` {
  const clean = address.toLowerCase().replace('0x', '')
  return \`0x\${clean.padStart(64, '0')}\`
  // e.g. "0xabc..." → "0x000...0abc..."
}`}
      </CodeBlock>
      <p>
        For Stellar recipients, the Ed25519 public key is decoded from the base-58 Stellar address
        format using <code>StrKey.decodeEd25519PublicKey()</code>:
      </p>
      <CodeBlock language="typescript">
{`function stellarAddressToBytes32(stellarAddress: string): \`0x\${string}\` {
  const { StrKey } = require('@stellar/stellar-sdk')
  const rawBytes = StrKey.decodeEd25519PublicKey(stellarAddress) as Buffer
  return \`0x\${rawBytes.toString('hex').padStart(64, '0')}\`
}`}
      </CodeBlock>

      <h2>Circle Iris V2 — Attestation Polling</h2>
      <CodeBlock language="typescript" filename="backend/src/services/bridgeService.ts">
{`const IRIS_API = 'https://iris-api.circle.com/v2/messages'
const POLL_INTERVAL_MS = 5_000
const MAX_POLL_ATTEMPTS = 60  // 5 minutes max

export async function pollAttestation(
  sourceDomain: number,
  burnTxHash: string
): Promise<{ message: string; attestation: string }> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const url = \`\${IRIS_API}/\${sourceDomain}?transactionHash=\${burnTxHash}\`
    const res = await fetch(url)
    const json = await res.json()

    if (
      json?.messages?.[0]?.status === 'complete' &&
      json?.messages?.[0]?.attestation &&
      json?.messages?.[0]?.message
    ) {
      return {
        message:     json.messages[0].message,
        attestation: json.messages[0].attestation,
      }
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
  throw new Error(\`Attestation timed out after \${MAX_POLL_ATTEMPTS} attempts\`)
}`}
      </CodeBlock>

      <h2>The Frontend Bridge Flow</h2>
      <p>
        The <code>useTransactionExecutor</code> hook in the frontend orchestrates the full
        sign → attest → sign sequence transparently:
      </p>
      <CodeBlock language="typescript" filename="frontend/app/hooks/useTransactionExecutor.ts">
{`// After the burn tx is confirmed:
if (meta?.destinationChain && meta?.destinationChain !== 'stellar'
    && tx.txType === 'burn') {

  // Poll Circle Iris via the backend
  const attestRes = await fetch(\`\${BACKEND_URL}/api/bridge/attest\`, {
    method: 'POST',
    body: JSON.stringify({ burnTxHash, sourceChain, destinationChain, recipientAddress, amount })
  })
  const { unsignedTx: mintTx } = await attestRes.json()

  // Switch to destination chain
  await activeWallet.switchChain(CHAIN_IDS[meta.destinationChain])

  // Sign the mint transaction
  lastTxHash = await provider.request({
    method: 'eth_sendTransaction',
    params: [{ to: mintTx.to, data: mintTx.data, value: mintTx.value || '0x0', from: activeWallet.address }]
  })
}`}
      </CodeBlock>

      <h2>Stellar Bridge (Deferred)</h2>
      <p>
        Bridging USDC from an EVM chain to Stellar requires Circle to publish verified CCTP
        contract addresses on Stellar&apos;s mainnet. This is not yet available as of v2.0.0.
      </p>
      <p>
        The <code>/api/bridge/relay</code> endpoint and <code>stellarBridgeRelay.ts</code> service
        are fully implemented and will be activated when Circle publishes the Stellar addresses.
        The agent currently returns a friendly message for Stellar bridge attempts:
      </p>
      <CodeBlock language="text">
{`"Native USDC bridging to Stellar via Circle CCTP V2 is coming soon.
In the meantime I can bridge your USDC to Celo or Ethereum, or swap it to XLM
on Stellar's DEX. Which would you prefer?"`}
      </CodeBlock>

      <h2>Error Cases</h2>
      <table>
        <thead><tr><th>Error</th><th>Cause</th><th>Agent Response</th></tr></thead>
        <tbody>
          <tr><td>Unsupported source chain</td><td>Chain not in TOKEN_MESSENGER_V2 map</td><td>Human-readable error string returned to agent</td></tr>
          <tr><td>Unsupported destination chain</td><td>Chain not in CCTP_DOMAIN map</td><td>Human-readable error string</td></tr>
          <tr><td>Same source and destination</td><td>fromChain === toChain</td><td>&quot;Choose two different chains&quot;</td></tr>
          <tr><td>Invalid amount</td><td>parseUnits throws</td><td>&quot;Invalid amount: X&quot;</td></tr>
          <tr><td>Attestation timeout</td><td>60 polls, no complete status</td><td>500 from /api/bridge/attest</td></tr>
        </tbody>
      </table>
    </div>
  )
}
