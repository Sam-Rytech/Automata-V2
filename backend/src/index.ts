import express from 'express';
import cors from 'cors';
import { runAgent, ConversationMessage } from './agent/agent';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// In-memory session store
// TODO Phase 3: move this into the database using Prisma
const sessions = new Map<string, ConversationMessage[]>();

app.post('/api/chat', async (req, res) => {
  const { message, sessionId, geminiApiKey } = req.body;

  if (!message || !sessionId || !geminiApiKey) {
    return res.status(400).json({ error: 'message, sessionId, and geminiApiKey are required.' });
  }

  const history = sessions.get(sessionId) ?? [];

  const { reply, updatedHistory } = await runAgent(message, geminiApiKey, history);

  sessions.set(sessionId, updatedHistory);

  return res.json({ reply, sessionId });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Automata backend running on port ${PORT}`);
});
