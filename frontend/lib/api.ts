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
  xdr?: string;         // Stellar only — unsigned XDR transaction envelope
};

// The shape of the full response from POST /api/chat
export type AgentResponse = {
  reply: string;
  unsignedTxs: UnsignedTx[];
  sessionId: string;
};

export async function sendAgentMessage(
  message: string,
  walletAddress: string,
  geminiApiKey: string,
  sessionId: string | null = null
): Promise<AgentResponse> {
  if (!geminiApiKey) throw new Error('NO_API_KEY');
  if (!walletAddress) throw new Error('NO_WALLET');

  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, walletAddress, geminiApiKey, sessionId: sessionId ?? undefined }),
  });

  if (!res.ok) {
    let errorMessage = 'Something went wrong. Please try again.';
    try {
      const err = await res.json();
      if (res.status === 429) errorMessage = 'The agent is busy. Please wait a moment and try again.';
      else if (res.status === 401) errorMessage = 'Your AI key is invalid. Update it in Settings.';
      else if (err.error) errorMessage = err.error;
    } catch { }
    throw new Error(errorMessage);
  }

  return res.json();
}

// Submit a signed Stellar transaction via the backend
export async function submitStellarTx(xdr: string, walletId: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/stellar/sign-and-submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xdr, walletId }),
  });

  if (!res.ok) {
    let errorMessage = 'Stellar transaction failed.';
    try {
      const err = await res.json();
      if (err.error) errorMessage = err.error;
    } catch { }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return data.txHash;
}

// --- DATABASE API WRAPPERS ---

export async function saveFlowToDb(walletAddress: string, name: string, actions: any) {
  const res = await fetch(`${API_BASE}/api/flows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, name, actions, description: 'Created via Flow Builder' }),
  });
  if (!res.ok) throw new Error('Failed to save flow to database');
  return res.json();
}

export async function getFlowsFromDb(walletAddress: string) {
  const res = await fetch(`${API_BASE}/api/flows/${walletAddress}`);
  if (!res.ok) throw new Error('Failed to fetch flows');
  return res.json();
}

export async function saveHistoryToDb(
  walletAddress: string,
  txHash: string | undefined,
  actionType: string,
  status: string,
  details: any
) {
  const res = await fetch(`${API_BASE}/api/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, txHash, chainId: details?.chainId || 'VARIOUS', actionType, status, details }),
  });
  if (!res.ok) throw new Error('Failed to save transaction history');
  return res.json();
}

export async function getHistoryFromDb(walletAddress: string) {
  const res = await fetch(`${API_BASE}/api/history/${walletAddress}`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}
