import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { runAgent, ConversationMessage } from './agent/agent';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

const sessions = new Map<string, ConversationMessage[]>();

app.post('/api/chat', async (req, res) => {
  const { message, sessionId, geminiApiKey, walletAddress } = req.body;

  if (!message || !sessionId || !geminiApiKey) {
    return res.status(400).json({ error: 'message, sessionId, and geminiApiKey are required.' });
  }

  const history = sessions.get(sessionId) ?? [];

  const contextualMessage = walletAddress
    ? `[User wallet address: ${walletAddress}]\n${message}`
    : message;

  const { reply, updatedHistory, unsignedTxs } = await runAgent(
    contextualMessage,
    geminiApiKey,
    history,
    walletAddress
  );

  sessions.set(sessionId, updatedHistory);
  return res.json({ reply, sessionId, unsignedTxs });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Automata backend running on port ${PORT}`);
});
