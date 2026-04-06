import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './prompts';
import { AGENT_TOOLS } from './tools';

export type MessageRole = 'user' | 'model';

export interface ConversationMessage {
  role: MessageRole;
  parts: Part[];
}

// --- Tool Handlers ---
// These are the actual functions Gemini can "call".
// Right now they return mock data. We will replace these
// with real blockchain calls (Viem, Stellar SDK) in Phase 3.

async function handle_get_balances(args: { walletAddress: string }) {
  console.log(`[Tool] get_balances called for ${args.walletAddress}`);
  // TODO Phase 3: replace with real Viem + Stellar balance fetches
  return {
    address: args.walletAddress,
    balances: [
      { chain: 'Base',     token: 'USDC', amount: '100.00' },
      { chain: 'Celo',     token: 'USDC', amount: '50.00'  },
      { chain: 'Ethereum', token: 'USDC', amount: '200.00' },
      { chain: 'Stellar',  token: 'USDC', amount: '75.00'  },
    ],
  };
}

async function handle_get_route(args: {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  amount: string;
}) {
  console.log(`[Tool] get_route called: ${args.amount} ${args.fromToken} from ${args.fromChain} to ${args.toChain}`);
  // TODO Phase 3: replace with real LI.FI / Circle CCTP V2 route fetch
  return {
    fromChain:   args.fromChain,
    toChain:     args.toChain,
    fromToken:   args.fromToken,
    toToken:     args.toToken,
    amount:      args.amount,
    estimatedFee: '0.50 USDC',
    estimatedTime: '~30 seconds',
    route: 'Circle CCTP V2',
  };
}

// Routes a function name to its handler
async function executeTool(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case 'get_balances':
      return JSON.stringify(await handle_get_balances(args as { walletAddress: string }));
    case 'get_route':
      return JSON.stringify(await handle_get_route(args as any));
    default:
      return JSON.stringify({ error: `Unknown tool: ${name}` });
  }
}

// --- Main Agent Runner ---

export async function runAgent(
  userMessage: string,
  apiKey: string,
  history: ConversationMessage[] = []
): Promise<{ reply: string; updatedHistory: ConversationMessage[] }> {
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
    });

    // Start chat with existing conversation history
    const chat = model.startChat({ history: history as Content[] });

    // Add the new user message to history
    const updatedHistory: ConversationMessage[] = [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    let response = (await chat.sendMessage(userMessage)).response;

    // --- The Reason-Act Loop ---
    // Keep looping as long as Gemini wants to call tools
    while (response.functionCalls() && response.functionCalls()!.length > 0) {
      const toolCalls = response.functionCalls()!;
      
      // Record Gemini's tool-calling turn in history
      updatedHistory.push({
        role: 'model',
        parts: toolCalls.map(tc => ({ functionCall: tc })),
      });

      // Execute every tool Gemini requested (could be multiple)
      const toolResults: Part[] = await Promise.all(
        toolCalls.map(async (tc) => ({
          functionResponse: {
            name: tc.name,
            response: { result: await executeTool(tc.name, tc.args as Record<string, any>) },
          },
        }))
      );

      // Record tool results in history
      updatedHistory.push({ role: 'user', parts: toolResults });

      // Send results back to Gemini so it can form its final answer
      response = (await chat.sendMessage(toolResults)).response;
    }

    const reply = response.text();

    // Record Gemini's final plain-English reply in history
    updatedHistory.push({
      role: 'model',
      parts: [{ text: reply }],
    });

    return { reply, updatedHistory };

  } catch (error: any) {
    // Surface errors in plain English, never crash the process
    const message = error?.message ?? 'Unknown error';

    if (message.includes('API_KEY_INVALID') || message.includes('API key')) {
      return {
        reply: "I couldn't connect to the AI — the API key looks invalid. Please check your Gemini API key and try again.",
        updatedHistory: history,
      };
    }

    if (message.includes('timeout') || message.includes('ECONNRESET')) {
      return {
        reply: "The request timed out. Please check your connection and try again.",
        updatedHistory: history,
      };
    }

    console.error('[Agent Error]', error);
    return {
      reply: "Something went wrong on my end. Please try again in a moment.",
      updatedHistory: history,
    };
  }
}
