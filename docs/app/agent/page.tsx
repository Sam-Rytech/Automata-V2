import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = {
  title: 'AI Agent',
  description: 'Gemini 2.5 Flash tool-use loop, sanitizeHistory, system prompt breakdown, and all 10 tools with parameters.',
  openGraph: {
    title: 'AI Agent — Automata Docs',
    description: 'Gemini 2.5 Flash tool-use loop, sanitizeHistory, system prompt breakdown, and all 10 tools with parameters.',
  },
}

export default function AgentPage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>04 ——</p>
      <h1>AI Agent</h1>
      <p>
        The Automata agent is a Gemini 2.5 Flash model augmented with 10 function-calling tools.
        It lives in <code>backend/src/agent/agent.ts</code> and is invoked on every{' '}
        <code>POST /api/chat</code> request.
      </p>

      <h2>The Tool-Use Loop</h2>
      <p>
        Gemini supports function calling: the model can request that a specific tool be executed,
        receive the result, and continue reasoning until it has a final text response. Automata&apos;s
        loop is bounded at <strong>10 iterations</strong> to prevent infinite execution.
      </p>

      <CodeBlock language="typescript" filename="backend/src/agent/agent.ts">
{`export async function runAgent(
  userMessage: string,
  apiKey: string,
  history: ConversationMessage[] = [],
  walletAddress: string = '0x0000000000000000000000000000000000000000',
  stellarAddress?: string
): Promise<{ reply: string; updatedHistory: ConversationMessage[]; unsignedTxs: any[] }> {

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT,
    tools: AGENT_TOOLS,
  })

  const chat = model.startChat({ history: sanitizeHistory(history) })
  const unsignedTxs: any[] = []
  const MAX_TOOL_ITERATIONS = 10
  let iterations = 0

  let response = (await chat.sendMessage(userMessage)).response

  while (response.functionCalls() && response.functionCalls()!.length > 0) {
    if (iterations >= MAX_TOOL_ITERATIONS) {
      console.warn('[Agent] Tool loop cap reached — breaking')
      break
    }
    iterations++

    const toolCalls = response.functionCalls()!

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      toolCalls.map(async (tc) => {
        const result = await executeTool(tc.name, tc.args, walletAddress, stellarAddress)
        if (result.unsignedTx) unsignedTxs.push(result.unsignedTx)
        return {
          functionResponse: {
            name: tc.name,
            response: { result: JSON.stringify(result.data) },
          },
        }
      })
    )

    response = (await chat.sendMessage(toolResults)).response
  }

  return { reply: response.text(), updatedHistory: [...], unsignedTxs }
}`}
      </CodeBlock>

      <h2>History Sanitization</h2>
      <p>
        Gemini&apos;s <code>startChat</code> API accepts only <code>text</code> parts in the initial
        history — it rejects entries containing <code>functionCall</code> or{' '}
        <code>functionResponse</code> parts. The <code>sanitizeHistory</code> function strips these
        before starting a new chat, preventing crashes on multi-turn conversations.
      </p>
      <CodeBlock language="typescript">
{`function sanitizeHistory(history: ConversationMessage[]): Content[] {
  return history.filter((msg) =>
    msg.parts.every(
      (part) => !('functionCall' in part) && !('functionResponse' in part)
    )
  ) as Content[]
}`}
      </CodeBlock>

      <h2>System Prompt</h2>
      <p>
        The system prompt in <code>backend/src/agent/prompts.ts</code> governs every aspect of
        agent behaviour. Key sections:
      </p>
      <table>
        <thead><tr><th>Section</th><th>Rule</th></tr></thead>
        <tbody>
          <tr><td>Personality</td><td>Plain English only. Never use blockchain jargon. Say &quot;move&quot; not &quot;bridge&quot;, &quot;transfer fee&quot; not &quot;gas fee&quot;.</td></tr>
          <tr><td>Execution rules</td><td>When the user gives a clear instruction, execute immediately — do not ask for confirmation before building.</td></tr>
          <tr><td>Swap rules</td><td>Never ask for slippage tolerance. Call get_route first, set minDestAmount = 90% of expected output. Never expose the word &quot;slippage&quot; to the user.</td></tr>
          <tr><td>Stellar rules</td><td>Always use the user&apos;s Stellar address as fromAddress. If trustline missing, inform the user. USDC is a real supported asset on Stellar.</td></tr>
          <tr><td>Safety rules</td><td>Never request private keys. Only build unsigned txs — never execute. Only show fees when calculable — never say &quot;unable to estimate&quot;.</td></tr>
          <tr><td>Yield / Earn</td><td>Call get_yield_rates when user mentions earning, yield, APY, vaults. Present top options, ask for confirmation, then call build_stake_tx. Quotes expire in 60s — refresh if needed.</td></tr>
          <tr><td>x402</td><td>Agent is pre-authorized to spend up to 0.001 USDC per query on Stellar to bypass x402 payment gates for premium yield data.</td></tr>
        </tbody>
      </table>

      <h2>Tool Definitions</h2>
      <p>
        All tools are declared in <code>backend/src/agent/tools.ts</code> as Gemini{' '}
        <code>FunctionDeclaration</code> objects. The model reads these definitions and decides when
        to call them.
      </p>

      <h3>get_balances</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>walletAddress</td><td>string</td><td>Yes</td><td>The 0x or Stellar G address to check</td></tr>
          <tr><td>stellarAddress</td><td>string</td><td>No</td><td>Separate Stellar address if different from EVM</td></tr>
        </tbody>
      </table>
      <p>
        Routes to <code>balanceService.getBalances()</code>. Reads USDC + native balances on Base,
        Celo, and Ethereum via viem <code>readContract</code>, and XLM + USDC on Stellar via
        Horizon <code>loadAccount</code>.
      </p>

      <h3>get_route</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>fromChain</td><td>string</td><td>Yes</td></tr>
          <tr><td>toChain</td><td>string</td><td>Yes</td></tr>
          <tr><td>fromToken</td><td>string</td><td>Yes</td></tr>
          <tr><td>toToken</td><td>string</td><td>Yes</td></tr>
          <tr><td>amount</td><td>string</td><td>Yes</td></tr>
          <tr><td>walletAddress</td><td>string</td><td>Yes</td></tr>
        </tbody>
      </table>
      <p>
        Routes to <code>routeService.getRoute()</code>. Calls the LI.FI SDK to find the optimal
        bridging/swap path. Routes are cached for 2 minutes keyed by a generated <code>routeId</code>.
        The cached route object is required by <code>build_swap_tx</code>.
      </p>

      <h3>get_yield_rates</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>chain</td><td>string</td><td>No — omit to search all chains</td></tr>
          <tr><td>token</td><td>string</td><td>No — omit to search all tokens</td></tr>
          <tr><td>protocol</td><td>string</td><td>No — omit to search all protocols</td></tr>
        </tbody>
      </table>
      <p>
        Routes to <code>yieldService.getYieldRates()</code>. For Base and Ethereum, reads live APY
        directly from the Aave V3 Pool contract (<code>getReserveData</code>, ray-to-APY conversion).
        For Celo, returns an estimated Mento rate. Results are cached for 5 minutes.
      </p>

      <h3>build_bridge_tx</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>fromChain</td><td>string</td><td>Yes</td></tr>
          <tr><td>toChain</td><td>string</td><td>Yes</td></tr>
          <tr><td>amount</td><td>string</td><td>Yes — USDC amount as human-readable string</td></tr>
          <tr><td>walletAddress</td><td>string</td><td>Yes — sender</td></tr>
          <tr><td>recipientAddress</td><td>string</td><td>Yes — can equal walletAddress</td></tr>
        </tbody>
      </table>
      <p>
        Routes to <code>bridgeService.buildBridgeTx()</code>. Builds two transactions:{' '}
        <code>ERC20.approve(TokenMessenger, amount)</code> and{' '}
        <code>TokenMessenger.depositForBurn(amount, destDomain, recipient, burnToken)</code>.
        Only supports USDC. Returns an error string for Stellar destination (deferred).
      </p>

      <h3>build_swap_tx</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>walletAddress</td><td>string</td><td>Yes</td></tr>
          <tr><td>fromToken</td><td>string</td><td>Yes</td></tr>
          <tr><td>toToken</td><td>string</td><td>Yes</td></tr>
          <tr><td>fromChain</td><td>string</td><td>Yes</td></tr>
          <tr><td>amount</td><td>string</td><td>Yes</td></tr>
          <tr><td>routeId</td><td>string</td><td>EVM only — from get_route cache</td></tr>
          <tr><td>fromAddress</td><td>string</td><td>Stellar only — Stellar sender address</td></tr>
          <tr><td>minDestAmount</td><td>string</td><td>Stellar only — slippage protection</td></tr>
        </tbody>
      </table>
      <p>
        Two code paths: if <code>fromChain === &quot;stellar&quot;</code>, calls{' '}
        <code>buildStellarPathPayment()</code> to build an XDR path payment envelope. For EVM chains,
        retrieves the cached LI.FI route and calls <code>getStepTransaction(step)</code> to get the
        live transaction calldata.
      </p>

      <h3>build_stake_tx</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>opportunityId</td><td>string</td><td>Yes — vault slug from get_yield_rates</td></tr>
          <tr><td>walletAddress</td><td>string</td><td>Yes</td></tr>
          <tr><td>amount</td><td>string</td><td>Yes — human-readable (e.g. &quot;10.00&quot;)</td></tr>
          <tr><td>tokenDecimals</td><td>number</td><td>Yes — 6 for USDC, 18 for ETH</td></tr>
        </tbody>
      </table>
      <p>
        Routes to <code>yieldService.buildEarnDepositTx()</code>. Fetches vault details from{' '}
        <code>earn.li.fi/v1/earn/vaults</code>, then gets a deposit quote from{' '}
        <code>li.quest/v1/quote</code>. Returns approval + deposit transactions. Quote TTL: 55 seconds.
      </p>

      <h3>verify_earn_position</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>walletAddress</td><td>string</td><td>Yes</td></tr>
        </tbody>
      </table>
      <p>
        Calls <code>yieldService.getEarnPositions()</code> which reads{' '}
        <code>earn.li.fi/v1/earn/portfolio/{'{'}walletAddress{'}'}/positions</code>. Called after a
        deposit is signed to confirm the position landed.
      </p>

      <h3>build_transfer_tx</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>chain</td><td>string</td><td>Yes</td></tr>
          <tr><td>token</td><td>string</td><td>Yes</td></tr>
          <tr><td>amount</td><td>string</td><td>Yes</td></tr>
          <tr><td>fromAddress</td><td>string</td><td>Yes</td></tr>
          <tr><td>toAddress</td><td>string</td><td>Yes</td></tr>
        </tbody>
      </table>
      <p>
        For EVM USDC: encodes <code>ERC20.transfer(to, amount)</code> calldata via viem{' '}
        <code>encodeFunctionData</code>. For Stellar: calls <code>buildStellarTransfer()</code> to
        build an XDR payment operation. Supports XLM and Circle USDC on Stellar.
      </p>

      <h3>estimate_fees</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>actions</td><td>Action[]</td><td>Yes — array of planned actions</td></tr>
        </tbody>
      </table>
      <p>
        Currently a stub returning a flat estimate of <code>$0.30 × actions.length</code>. Real fee
        estimation (reading gas from RPC + current gas price) is a Phase 5 TODO.
      </p>

      <h3>resolve_recipient</h3>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Required</th></tr></thead>
        <tbody>
          <tr><td>identifier</td><td>string</td><td>Yes — phone number or ENS name</td></tr>
        </tbody>
      </table>
      <p>
        Currently a stub. Returns an unresolved error for both ENS and phone numbers. MiniPay phone
        number resolution and ENS lookup are Phase 5 items.
      </p>

      <h2>Error Handling</h2>
      <p>
        The agent loop catches three categories of error and returns a human-readable message rather
        than throwing to the Express handler:
      </p>
      <CodeBlock language="typescript">
{`// API_KEY_INVALID or "API key" in error message
"I couldn't connect to the AI — the API key looks invalid.
 Please check your Gemini API key in settings."

// 429 / quota / Too Many Requests
"I'm getting rate limited by the AI provider.
 Please wait a moment and try again."

// timeout / ECONNRESET
"The request timed out. Please check your connection and try again."`}
      </CodeBlock>
      <p>
        All other errors are logged to <code>console.error</code> and return a generic fallback.
        The <code>updatedHistory</code> returned on error is the <em>original</em> history — the
        failed attempt is not appended, so the conversation can be retried cleanly.
      </p>
    </div>
  )
}
