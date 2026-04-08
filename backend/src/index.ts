import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { runAgent, ConversationMessage } from './agent/agent';
import { pollTransactionStatus } from './services/txMonitorService';

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

// ── Session store ─────────────────────────────────────────────────────────────
// Keyed by sessionId. Cleared after a transaction is built so the next message
// starts a fresh context (avoids the agent re-using stale transaction history).

const sessions = new Map<string, ConversationMessage[]>();

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── /api/chat ─────────────────────────────────────────────────────────────────

app.post('/api/chat', async (req, res) => {
  const { message, sessionId, geminiApiKey, walletAddress } = req.body;

  if (!message || !sessionId || !geminiApiKey) {
    return res.status(400).json({
      error: 'message, sessionId, and geminiApiKey are required.',
    });
  }

  const history = sessions.get(sessionId) ?? [];

  // Inject the wallet address as context so the agent can use it in tool calls
  const contextualMessage = walletAddress
    ? `[User wallet address: ${walletAddress}]\n${message}`
    : message;

  try {
    const { reply, updatedHistory, unsignedTxs } = await runAgent(
      contextualMessage,
      geminiApiKey,
      history,
      walletAddress
    );

    // Clear session once transactions are ready — next message is a fresh intent
    if (unsignedTxs.length > 0) {
      sessions.delete(sessionId);
    } else {
      sessions.set(sessionId, updatedHistory);
    }

    return res.json({ reply, sessionId, unsignedTxs });

  } catch (err: any) {
    console.error('[/api/chat] Error:', err);
    return res.status(500).json({ error: err.message ?? 'Agent execution failed.' });
  }
});

// ── HTTP server ───────────────────────────────────────────────────────────────
// WebSocket requires an underlying HTTP server — createServer wraps the Express
// app so both HTTP and WebSocket share the same port.

const server = createServer(app);

// ── WebSocket server ──────────────────────────────────────────────────────────
// Frontend connects here after signing a transaction to receive real-time status.
//
// Protocol:
//   Client → Server:  { type: "monitor", txHash: "0x...", chainId: "base" }
//   Server → Client:  { type: "status", txHash, chainId, status, confirmations, ... }
//                     { type: "error",  message: "..." }
//                     { type: "connected", message: "Automata WebSocket ready" }

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');

  // Confirm the connection immediately so the frontend doesn't have to guess
  ws.send(JSON.stringify({ type: 'connected', message: 'Automata WebSocket ready' }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'monitor' && message.txHash && message.chainId) {
        console.log(`[WebSocket] Monitoring: ${message.txHash} on ${message.chainId}`);

        // Fire-and-forget — do NOT await. Awaiting would block this handler
        // thread and prevent receiving further messages on this connection.
        pollTransactionStatus(ws, message.txHash, message.chainId).catch(err => {
          console.error('[WebSocket] pollTransactionStatus error:', err);
        });

      } else {
        ws.send(JSON.stringify({
          type:    'error',
          message: 'Unknown message type or missing fields. Expected: { type: "monitor", txHash, chainId }',
        }));
      }

    } catch {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON message' }));
    }
  });

  ws.on('close', () => {
    console.log('[WebSocket] Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('[WebSocket] Error:', err);
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
// server.listen() instead of app.listen() — HTTP + WebSocket share the same port.

server.listen(PORT, () => {
  console.log(`Automata backend running on port ${PORT} (HTTP + WebSocket)`);
});