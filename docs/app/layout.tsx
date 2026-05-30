import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata: Metadata = {
  title: { template: '%s — Automata Docs', default: 'Automata Docs' },
  description:
    'Complete technical documentation for Automata — a cross-chain AI agent platform for Base, Celo, Ethereum, and Stellar.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ background: '#0F0F1A', color: '#fff' }}>
        <Sidebar />
        {/* Main content — offset by sidebar width on desktop */}
        <main
          style={{
            marginLeft: '256px',
            minHeight: '100vh',
            maxWidth: '860px',
            padding: '3rem 3.5rem',
          }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}
