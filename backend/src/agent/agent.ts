import { GoogleGenerativeAI, Content, Part } from '@google/generative-ai';
import { SYSTEM_PROMPT } from './prompts';
import { AGENT_TOOLS } from './tools';
import { executeTool } from './toolExecutor';

export type MessageRole = 'user' | 'model';

export interface ConversationMessage {
  role: MessageRole;
  parts: Part[];
}

function sanitizeHistory(history: ConversationMessage[]): Content[] {
  return history.filter(msg =>
    msg.parts.every(part =>
      !('functionCall' in part) && !('functionResponse' in part)
    )
  ) as Content[];
}

export async function runAgent(
  userMessage: string,
  apiKey: string,
  history: ConversationMessage[] = [],
  walletAddress: string = '0x0000000000000000000000000000000000000000'
): Promise<{ reply: string; updatedHistory: ConversationMessage[]; unsignedTxs: any[] }> {

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-04-17',
      systemInstruction: SYSTEM_PROMPT,
      tools: AGENT_TOOLS,
    });

    const chat = model.startChat({ history: sanitizeHistory(history) });

    const updatedHistory: ConversationMessage[] = [
      ...history,
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const unsignedTxs: any[] = [];

    let response = (await chat.sendMessage(userMessage)).response;

    while (response.functionCalls() && response.functionCalls()!.length > 0) {
      const toolCalls = response.functionCalls()!;

      updatedHistory.push({
        role: 'model',
        parts: toolCalls.map(tc => ({ functionCall: tc })),
      });

      const toolResults: Part[] = await Promise.all(
        toolCalls.map(async (tc) => {
          console.log(`[Tool] ${tc.name}`, tc.args);
          const result = await executeTool(tc.name, tc.args as Record<string, any>, walletAddress);

          if (result.unsignedTx) {
            unsignedTxs.push(result.unsignedTx);
          }

          return {
            functionResponse: {
              name: tc.name,
              response: { result: JSON.stringify(result.data) },
            },
          };
        })
      );

      updatedHistory.push({ role: 'user', parts: toolResults });
      response = (await chat.sendMessage(toolResults)).response;
    }

    const reply = response.text();

    updatedHistory.push({
      role: 'model',
      parts: [{ text: reply }],
    });

    return { reply, updatedHistory, unsignedTxs };

  } catch (error: any) {
    const message = error?.message ?? 'Unknown error';

    if (message.includes('API_KEY_INVALID') || message.includes('API key')) {
      return {
        reply: "I couldn't connect to the AI — the API key looks invalid. Please check your Gemini API key in settings.",
        updatedHistory: history,
        unsignedTxs: [],
      };
    }

    if (message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')) {
      return {
        reply: "I'm getting rate limited by the AI provider. Please wait a moment and try again.",
        updatedHistory: history,
        unsignedTxs: [],
      };
    }

    if (message.includes('timeout') || message.includes('ECONNRESET')) {
      return {
        reply: "The request timed out. Please check your connection and try again.",
        updatedHistory: history,
        unsignedTxs: [],
      };
    }

    console.error('[Agent Error]', error);
    return {
      reply: "Something went wrong on my end. Please try again in a moment.",
      updatedHistory: history,
      unsignedTxs: [],
    };
  }
}
