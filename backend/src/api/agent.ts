import express from 'express'
import { runAgent } from '../agent/agent'
import { saveSession, getSession } from '../services/sessionService'

export const agentRouter = express.Router()

agentRouter.post('/execute', async (req, res) => {
  try {
    const { message, walletAddress, geminiApiKey, sessionId, mode } = req.body

    if (!message || !walletAddress || !geminiApiKey) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Retrieve history from Prisma if a sessionId was provided
    let conversationHistory: any[] = []
    if (sessionId) {
      const savedHistory = await getSession(sessionId)
      if (savedHistory) conversationHistory = savedHistory
    }

    // Run the agent loop
    const result = await runAgent(
      message,
      walletAddress,
      geminiApiKey,
      conversationHistory
    )

    // Persist the updated history to PostgreSQL
    const newSessionId = await saveSession(
      walletAddress,
      result.updatedHistory,
      sessionId
    )

    res.json({
      response: result.response,
      sessionId: newSessionId, // Return the DB ID to the frontend
      unsignedTransactions: result.unsignedTxs,
    })
  } catch (error: any) {
    console.error('Agent execution error:', error)
    res.status(500).json({ error: error.message ?? 'Agent execution failed' })
  }
})
