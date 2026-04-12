import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { runAgent, ConversationMessage } from './agent/agent';
import { pollTransactionStatus } from './services/txMonitorService';
import { PrismaClient } from '@prisma/client';


dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;
const prisma = new PrismaClient();

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
  const { message, sessionId, geminiApiKey, walletAddress, stellarAddress } = req.body;

  if (!message || !sessionId || !geminiApiKey) {
    return res.status(400).json({
      error: 'message, sessionId, and geminiApiKey are required.',
    });
  }

  const history = sessions.get(sessionId) ?? [];

  // Inject both EVM and Stellar addresses as context so the agent can use them in tool calls
  const contextualMessage = walletAddress
    ? `[User EVM wallet address: ${walletAddress}]${stellarAddress ? `\n[User Stellar wallet address: ${stellarAddress}]` : ''}\n${message}`
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

app.post('/api/flows', async (req, res) => {
  const { walletAddress, name, description, actions } = req.body;
  if (!walletAddress || !name || !actions) return res.status(400).json({ error: 'Missing required fields' });

  try {
    // 1. Ensure the user exists
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    });

    // 2. Save the flow
    const flow = await prisma.flow.create({
      data: {
        userId: user.id,
        name,
        description,
        actions, // JSON object of the nodes/edges
      },
    });
    return res.json(flow);
  } catch (err: any) {
    console.error('[/api/flows] Save Error:', err);
    return res.status(500).json({ error: 'Failed to save flow to database.' });
  }
});

// Get user flows
app.get('/api/flows/:walletAddress', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { walletAddress: req.params.walletAddress } });
    if (!user) return res.json([]); // No user = no flows yet

    const flows = await prisma.flow.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(flows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch flows.' });
  }
});

// ── /api/history ───────────────────────────────────────────────────────────────

// Save a transaction receipt
app.post('/api/history', async (req, res) => {
  const { walletAddress, txHash, chainId, actionType, status, details } = req.body;
  if (!walletAddress || !actionType || !status) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const tx = await prisma.transaction.create({
      data: { walletAddress, txHash, chainId, actionType, status, details },
    });
    return res.json(tx);
  } catch (err: any) {
    console.error('[/api/history] Save Error:', err);
    return res.status(500).json({ error: 'Failed to save transaction history.' });
  }
});

// Get user history
app.get('/api/history/:walletAddress', async (req, res) => {
  try {
    const history = await prisma.transaction.findMany({
      where: { walletAddress: req.params.walletAddress },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(history);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch history.' });
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
          type: 'error',
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
