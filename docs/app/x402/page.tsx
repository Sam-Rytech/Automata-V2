import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = {
  title: 'x402 Protocol',
  description: 'The HTTP 402 payment protocol — payload structure and autonomous agent payment flow.',
  openGraph: {
    title: 'x402 Protocol — Automata Docs',
    description: 'The HTTP 402 payment protocol — payload structure and autonomous agent payment flow.',
  },
}

export default function X402Page() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>12 ——</p>
      <h1>x402 Protocol</h1>
      <p>
        x402 is an HTTP payment protocol that enables machine-to-machine micropayments at the
        network layer. When a server returns HTTP 402 Payment Required, the client (in this case
        the Automata AI agent) can autonomously pay and retry the request — without any human
        interaction.
      </p>

      <h2>The Problem x402 Solves</h2>
      <p>
        Premium financial data (live yield rates, market feeds, risk metrics) is valuable. Existing
        API monetisation models require subscription accounts, API key management, and billing
        systems. x402 allows any HTTP endpoint to require a micro-payment per request — the payment
        is verified on-chain before the response is served.
      </p>

      <h2>The x402 Yield Server</h2>
      <p>
        Located at <code>x402-yield-server/src/index.ts</code>. Runs on port 3002. Exposes one
        protected endpoint and one health check.
      </p>

      <h3>Protected endpoint: GET /api/yield</h3>
      <CodeBlock language="typescript" filename="x402-yield-server/src/index.ts">
{`// Payment configuration
const PAY_TO_ADDRESS      = process.env.PAYMENT_ADDRESS  // Stellar G... address
const STELLAR_USDC_CONTRACT = 'CCW67TSZV3NEJEXQCESSVDTZEQB2B4CEPMU74WPEVN2KPEV5J66KILUI'  // USDC on Stellar (Soroban)

// x402 Middleware
const stellarX402Middleware = (req, res, next) => {
  const paymentHeader = req.headers['x-payment'] || req.headers['authorization']

  if (!paymentHeader) {
    // Strict x402 standard response
    return res.status(402).json({
      x402Version: 1,
      error: "X-PAYMENT header is required",
      accepts: [{
        scheme:             "exact",
        network:            "stellar",
        maxAmountRequired:  "10000",   // 0.001 USDC in stroops
        resource:           \`\${req.protocol}://\${req.get('host')}\${req.originalUrl}\`,
        payTo:              PAY_TO_ADDRESS,
        asset:              STELLAR_USDC_CONTRACT,
        maxTimeoutSeconds:  60
      }]
    })
  }
  next()
}

// Protected route
app.get('/api/yield', stellarX402Middleware, (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    rates: [
      { protocol: 'Aave',  network: 'Base',     asset: 'USDC', apy: '4.2%' },
      { protocol: 'Mento', network: 'Celo',     asset: 'USDC', apy: '6.8%' },
      { protocol: 'Aave',  network: 'Ethereum', asset: 'USDC', apy: '3.1%' },
    ]
  })
})`}
      </CodeBlock>

      <h2>x402 Response Structure</h2>
      <p>When the payment header is missing, the server returns:</p>
      <CodeBlock language="json">
{`HTTP/1.1 402 Payment Required
Content-Type: application/json

{
  "x402Version": 1,
  "error": "X-PAYMENT header is required",
  "accepts": [{
    "scheme":            "exact",
    "network":           "stellar",
    "maxAmountRequired": "10000",
    "resource":          "http://localhost:3002/api/yield",
    "payTo":             "G...",
    "asset":             "CCW67TSZV3NEJEXQCESSVDTZEQB2B4CEPMU74WPEVN2KPEV5J66KILUI",
    "maxTimeoutSeconds": 60
  }]
}`}
      </CodeBlock>

      <table>
        <thead><tr><th>Field</th><th>Value</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td>scheme</td><td>&quot;exact&quot;</td><td>Exact amount required (not &quot;up to X&quot;)</td></tr>
          <tr><td>network</td><td>&quot;stellar&quot;</td><td>Payment must be on Stellar</td></tr>
          <tr><td>maxAmountRequired</td><td>&quot;10000&quot;</td><td>10,000 stroops = 0.001 USDC</td></tr>
          <tr><td>payTo</td><td>G... address</td><td>Stellar wallet to pay</td></tr>
          <tr><td>asset</td><td>Soroban contract ID</td><td>USDC on Stellar (mainnet)</td></tr>
          <tr><td>maxTimeoutSeconds</td><td>60</td><td>Payment receipt valid for 60 seconds</td></tr>
        </tbody>
      </table>

      <h2>Agent Autonomous Payment</h2>
      <p>
        The Automata agent is pre-authorized in its system prompt to spend up to 0.001 USDC per
        query to bypass x402 gates:
      </p>
      <blockquote>
        &quot;You are equipped with an autonomous operational budget on the Stellar Mainnet. If a user
        asks for current yield rates, investment strategies, or APY data, you must use the
        &apos;get_yield_rates&apos; tool. Do not hesitate to use this tool; you are pre-authorized to spend
        up to 0.001 USDC per query to bypass x402 payment gateways and fetch premium, real-time
        data for the user. When you do this, smoothly mention to the user that you autonomously
        paid for premium data to give them the best answer.&quot;
      </blockquote>

      <h2>Payment Flow</h2>
      <CodeBlock language="text">
{`1. Agent calls get_yield_rates tool
2. yieldService makes GET request to /api/yield
3. Server returns 402 with payment instructions
4. Agent reads the 402 response:
   - network: "stellar"
   - amount: 10000 stroops (0.001 USDC)
   - payTo: G...
5. Agent builds a Stellar USDC payment transaction (0.001 USDC)
6. Agent signs the payment using its operational Stellar wallet
7. Agent submits the payment to Stellar Horizon
8. Agent includes the payment receipt in the X-PAYMENT header
9. Agent retries GET /api/yield with the payment header
10. Server verifies the payment on-chain → returns yield data
11. Agent presents the data to the user and mentions:
    "I autonomously paid a small fee for premium data to give you the best answer."`}
      </CodeBlock>

      <div className="callout callout-info">
        <strong>Current implementation status:</strong> The x402 middleware is implemented and
        returns the correct 402 payload. The agent&apos;s autonomous Stellar payment capability is
        described in the system prompt but not yet fully wired to an operational Stellar wallet
        on the server. This is a Phase 2 / Stellar integration item.
      </div>

      <h2>USDC on Stellar — Soroban Contract</h2>
      <p>
        USDC on Stellar mainnet is a Soroban (Stellar smart contract) token:
      </p>
      <CodeBlock language="text">
{`Contract ID: CCW67TSZV3NEJEXQCESSVDTZEQB2B4CEPMU74WPEVN2KPEV5J66KILUI`}
      </CodeBlock>
      <p>
        This is different from the classic Stellar USDC asset (<code>USDC:GA5Z...</code>). The
        Soroban contract is the newer standard used for DeFi on Stellar.
      </p>

      <h2>Running the x402 Server</h2>
      <CodeBlock language="bash">
{`cd x402-yield-server
npm install
npm run dev

# Server starts on port 3002
# Health check: GET http://localhost:3002/health  → { "status": "ok" }
# Protected:    GET http://localhost:3002/api/yield  → 402 without X-PAYMENT header`}
      </CodeBlock>

      <h3>Environment variables</h3>
      <CodeBlock language="bash" filename="x402-yield-server/.env">
{`PORT=3002
PAYMENT_ADDRESS=G...  # Your Stellar wallet address that receives micropayments`}
      </CodeBlock>
    </div>
  )
}
