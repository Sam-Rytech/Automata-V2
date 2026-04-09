const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

// The shape of a message in the conversation history
export type Message = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

// The shape of an unsigned transaction returned by the agent
export type UnsignedTx = {
  chainId: string;      // "base", "celo", "ethereum", or "stellar"
  to: string;           // contract or recipient address
  data: string;         // hex-encoded calldata
  value: string;        // native token amount in wei (usually "0" for ERC-20)
  description: string;  // plain English description shown to user before signing
};

// The shape of the full response from POST /api/chat
export type AgentResponse = {
  response: string;            // the agent's plain-English reply
  unsignedTxs: UnsignedTx[];   // transactions for user to sign (may be empty)
  sessionId: string;           // session identifier for conversation continuity
};

/**
 * Send a message to the Automata AI agent.
 *
 * @param message       - What the user typed
 * @param walletAddress - The user's EVM wallet address (from Privy)
 * @param geminiApiKey  - The user's own Gemini API key (stored in localStorage)
 * @param sessionId     - Conversation session ID (pass null for a new conversation)
 */
export async function sendAgentMessage(
  message: string,
  walletAddress: string,
  geminiApiKey: string,
  sessionId: string | null = null
): Promise<AgentResponse> {

  if (!geminiApiKey) {
    throw new Error('NO_API_KEY');
  }

  if (!walletAddress) {
    throw new Error('NO_WALLET');
  }

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      walletAddress,
      geminiApiKey,
      sessionId: sessionId ?? undefined,
    }),
  });

  if (!res.ok) {
    let errorMessage = 'Something went wrong. Please try again.';
    try {
      const err = await res.json();
      if (res.status === 429) errorMessage = 'The agent is busy. Please wait a moment and try again.';
      else if (res.status === 401) errorMessage = 'Your AI key is invalid. Update it in Settings.';
      else if (err.error) errorMessage = err.error;
    } catch {
      // if response body is not JSON, use the generic message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}
