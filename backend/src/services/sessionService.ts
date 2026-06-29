// backend/src/services/sessionService.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function saveSession(
  walletAddress: string,
  history: any[],
  sessionId?: string
): Promise<string> {
  // 1. Ensure the user exists in the database
  const user = await prisma.user.upsert({
    where: { walletAddress },
    update: {},
    create: { walletAddress },
  })

  // 2. Update existing session or create a new one
  if (sessionId) {
    const updated = await prisma.session.update({
      where: { id: sessionId },
      data: { history },
    })
    return updated.id
  } else {
    const created = await prisma.session.create({
      data: {
        userId: user.id,
        history,
      },
    })
    return created.id
  }
}

export async function getSession(sessionId: string): Promise<any[] | null> {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  })
  return session ? (session.history as any[]) : null
}
