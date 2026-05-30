import type { Metadata } from 'next'
import CodeBlock from '@/components/CodeBlock'

export const metadata: Metadata = {
  title: 'Database',
  description: 'Full Prisma schema, model-by-model documentation, and the session persistence limitation in v2.0.0.',
  openGraph: {
    title: 'Database — Automata Docs',
    description: 'Full Prisma schema, model-by-model documentation, and the session persistence limitation in v2.0.0.',
  },
}

export default function DatabasePage() {
  return (
    <div className="doc-content">
      <p style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>11 ——</p>
      <h1>Database</h1>
      <p>
        Automata uses <strong>PostgreSQL</strong> (v16) via <strong>Prisma</strong> ORM. The schema
        defines four models: User, Flow, Session, and Transaction.
      </p>

      <h2>Full Schema</h2>
      <CodeBlock language="prisma" filename="backend/prisma/schema.prisma">
{`generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String    @id @default(cuid())
  walletAddress   String    @unique
  encryptedApiKey String?
  agentMode       String    @default("assisted")   // "assisted" | "autonomous"
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  flows           Flow[]
  sessions        Session[]
}

model Flow {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  name        String
  description String?
  actions     Json     // Array of Action objects
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  history   Json     // ConversationMessage[] — Gemini content parts
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Transaction {
  id            String   @id @default(cuid())
  walletAddress String
  txHash        String?
  chainId       String
  actionType    String   // "AGENT_EXECUTION" | "FLOW" | "BRIDGE" | etc.
  status        String   // "SUCCESS" | "FAILED" | "PENDING"
  details       Json     // Freeform — steps, error messages, chain path, etc.
  createdAt     DateTime @default(now())
}`}
      </CodeBlock>

      <h2>Model Details</h2>

      <h3>User</h3>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>id</td><td>String (cuid)</td><td>Auto-generated</td></tr>
          <tr><td>walletAddress</td><td>String (unique)</td><td>EVM 0x address — primary identifier</td></tr>
          <tr><td>encryptedApiKey</td><td>String?</td><td>Optional — encrypted Gemini key for future server-side storage</td></tr>
          <tr><td>agentMode</td><td>String</td><td>"assisted" (default) or "autonomous"</td></tr>
        </tbody>
      </table>
      <p>
        Users are created via <code>upsert</code> — if a wallet address doesn&apos;t exist, it&apos;s created
        automatically when a flow is saved or history is logged.
      </p>

      <h3>Flow</h3>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>id</td><td>String (cuid)</td><td>Auto-generated</td></tr>
          <tr><td>userId</td><td>String</td><td>FK to User</td></tr>
          <tr><td>name</td><td>String</td><td>Required — human-readable name</td></tr>
          <tr><td>description</td><td>String?</td><td>Optional</td></tr>
          <tr><td>actions</td><td>Json</td><td>Array of Action objects (from shared/types/Action.ts)</td></tr>
        </tbody>
      </table>
      <p>
        Flows are created via <code>POST /api/flows</code> and fetched via{' '}
        <code>GET /api/flows/:walletAddress</code>. The UI does not yet load saved flows into the
        canvas — this is a known TODO.
      </p>

      <h3>Session</h3>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>id</td><td>String (cuid)</td><td>Auto-generated</td></tr>
          <tr><td>userId</td><td>String</td><td>FK to User</td></tr>
          <tr><td>history</td><td>Json</td><td>Array of ConversationMessage objects</td></tr>
        </tbody>
      </table>
      <div className="callout callout-warn">
        <strong>Known limitation:</strong> Sessions are currently stored in an in-memory{' '}
        <code>Map&lt;sessionId, ConversationMessage[]&gt;</code> in <code>index.ts</code>, not in
        the database. The Session model exists in the schema but is not yet used. Sessions are lost
        on every server restart. Migrating to Prisma persistence is a priority action.
      </div>

      <h3>Transaction</h3>
      <table>
        <thead><tr><th>Field</th><th>Type</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td>id</td><td>String (cuid)</td><td>Auto-generated</td></tr>
          <tr><td>walletAddress</td><td>String</td><td>EVM address — no FK, denormalised for quick lookup</td></tr>
          <tr><td>txHash</td><td>String?</td><td>On-chain hash — null if tx failed pre-submission</td></tr>
          <tr><td>chainId</td><td>String</td><td>"base" | "celo" | "ethereum" | "stellar" | "VARIOUS"</td></tr>
          <tr><td>actionType</td><td>String</td><td>"AGENT_EXECUTION" | "FLOW" | "BRIDGE" | etc.</td></tr>
          <tr><td>status</td><td>String</td><td>"SUCCESS" | "FAILED"</td></tr>
          <tr><td>details</td><td>Json</td><td>Freeform — step count, error message, chain path, etc.</td></tr>
        </tbody>
      </table>
      <p>
        Transactions are logged by <code>useTransactionExecutor</code> after execution. Both success
        and failure cases are logged.
      </p>

      <h2>Setup Commands</h2>
      <CodeBlock language="bash">
{`# From backend/ directory

# Create and apply migration
npx prisma migrate dev --name init

# View data in the browser
npx prisma studio

# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes without creating a migration file (development only)
npx prisma db push`}
      </CodeBlock>

      <h2>Prisma Client Usage</h2>
      <CodeBlock language="typescript" filename="backend/src/index.ts">
{`import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// User upsert — creates if not exists
const user = await prisma.user.upsert({
  where:  { walletAddress },
  update: {},
  create: { walletAddress },
})

// Save a flow
const flow = await prisma.flow.create({
  data: { userId: user.id, name, description, actions },
})

// Log a transaction
const tx = await prisma.transaction.create({
  data: { walletAddress, txHash, chainId, actionType, status, details },
})

// Fetch history for a wallet (newest first)
const history = await prisma.transaction.findMany({
  where:   { walletAddress },
  orderBy: { createdAt: 'desc' },
})`}
      </CodeBlock>
    </div>
  )
}
