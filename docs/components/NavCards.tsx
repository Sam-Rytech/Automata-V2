'use client'

import Link from 'next/link'

const cards = [
  { href: '/getting-started', label: 'Getting Started', desc: 'Prerequisites, local setup, environment variables, and first test curl.' },
  { href: '/architecture', label: 'Architecture', desc: 'Three-layer system overview: Frontend → Backend → Blockchain.' },
  { href: '/api-reference', label: 'API Reference', desc: 'All REST endpoints and WebSocket events with full request/response schemas.' },
  { href: '/agent', label: 'AI Agent', desc: 'Gemini tool-use loop, all 10 tools, system prompt, and error handling.' },
  { href: '/bridging', label: 'Bridging (CCTP V2)', desc: 'Circle CCTP V2 burn-and-mint flow, Circle Iris attestation polling.' },
  { href: '/contracts', label: 'Smart Contracts', desc: 'AutomataRouter and AutomataYieldVault — full function-level documentation.' },
]

export default function NavCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1rem',
        marginTop: '1rem',
      }}
    >
      {cards.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          style={{
            display: 'block',
            background: '#1A1A2E',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '1.1rem 1.25rem',
            textDecoration: 'none',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(233,30,140,0.4)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.4rem' }}>
            {c.label}
          </div>
          <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.75rem', color: '#666', lineHeight: '1.5' }}>
            {c.desc}
          </div>
        </Link>
      ))}
    </div>
  )
}
