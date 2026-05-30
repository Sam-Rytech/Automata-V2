import type { Metadata } from 'next'
import { Syne, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import TableOfContents from '@/components/TableOfContents'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  display: 'swap',
  variable: '--font-syne',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: { template: '%s — Automata Docs', default: 'Automata Docs' },
  description:
    'Complete technical documentation for Automata — a cross-chain AI agent platform for Base, Celo, Ethereum, and Stellar.',
  openGraph: {
    siteName: 'Automata Docs',
    type: 'website',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${ibmPlexMono.variable}`}>
      <body>
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
        <TableOfContents />
      </body>
    </html>
  )
}
