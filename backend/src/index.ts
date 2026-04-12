import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { runAgent, ConversationMessage } from './agent/agent';
import { pollTransactionStatus } from './services/txMonitorService';
import { handleBurnConfirmed } from './services/bridgeService';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;
const prisma = new PrismaClient();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

const sessions = new Map<string, ConversationMessage[]>();

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId, geminiApiKey, walletAddress, stellarAddress } = req.body;

  if (!message || !sessionId || !geminiApiKey) {
    return res.status(400).json({
      error: 'message, sessionId, and geminiApiKey are required.',
    });
  }

  const history = sessions.get(sessionId) ?? [];

  const contextualMessage = walletAddress
    ? `[User EVM wallet address: ${walletAddress}]${stellarAddress ? `\n[User Stellar wallet address: ${stellarAddress}]` : ''}\n${message}`
    : message;

  try {
    const { reply, updatedHistory, unsignedTxs } = await runAgent(
      contextualMessage,
      geminiApiKey,
      history,
      walletAddress,
      stellarAddress
    );

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

// ── /api/bridge/relay ─────────────────────────────────────────────────────────
// Called by the frontend after the burn tx confirms on Base.
// Starts the background relay that polls Circle and mints USDC on Stellar.

app.post('/api/bridge/relay', async (req, res) => {
  const { burnTxHash, recipientAddress, amount } = req.body;

  if (!burnTxHash || !recipientAddress || !amount) {
    return res.status(400).json({ error: 'burnTxHash, recipientAddress, and amount are required.' });
  }

  // Respond immediately — relay runs in background
  res.json({ status: 'relay_started', burnTxHash });

  handleBurnConfirmed({
    burnTxHash,
    recipientAddress,
    amount,
    onSuccess: (txHash) => {
      console.log(`[Bridge] Stellar mint complete: ${txHash}`);
    },
    onError: (err) => {
      console.error(`[Bridge] Relay failed for ${burnTxHash}:`, err);
    },
  });
});

app.post('/api/flows', async (req, res) => {
  const { walletAddress, name, description, actions } = req.body;
  if (!walletAddress || !name || !actions) return res.status(400).json({ error: 'Missing required fields' });

  try {
    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {},
      create: { walletAddress },
    });

    const flow = await prisma.flow.create({
      data: {
        userId: user.id,
        name,
        description,
        actions,
      },
    });
    return res.json(flow);
  } catch (err: any) {
    console.error('[/api/flows] Save Error:', err);
    return res.status(500).json({ error: 'Failed to save flow to database.' });
  }
});

app.get('/api/flows/:walletAddress', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { walletAddress: req.params.walletAddress } });
    if (!user) return res.json([]);

    const flows = await prisma.flow.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(flows);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch flows.' });
  }
});

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

const server = createServer(app);

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('[WebSocket] Client connected');

  ws.send(JSON.stringify({ type: 'connected', message: 'Automata WebSocket ready' }));

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());

      if (message.type === 'monitor' && message.txHash && message.chainId) {
        console.log(`[WebSocket] Monitoring: ${message.txHash} on ${message.chainId}`);

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

server.listen(PORT, () => {
  console.log(`Automata backend running on port ${PORT} (HTTP + WebSocket)`);
});
