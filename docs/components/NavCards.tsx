'use client'

import Link from 'next/link'
import { useState } from 'react'

const cards = [
  { href: '/getting-started', label: 'Getting Started', desc: 'Prerequisites, local setup, environment variables, and first test curl.' },
  { href: '/architecture', label: 'Architecture', desc: 'Three-layer system overview: Frontend → Backend → Blockchain.' },
  { href: '/api-reference', label: 'API Reference', desc: 'All REST endpoints and WebSocket events with full request/response schemas.' },
  { href: '/agent', label: 'AI Agent', desc: 'Gemini tool-use loop, all 10 tools, system prompt, and error handling.' },
  { href: '/bridging', label: 'Bridging (CCTP V2)', desc: 'Circle CCTP V2 burn-and-mint flow, Circle Iris attestation polling.' },
  { href: '/contracts', label: 'Smart Contracts', desc: 'AutomataRouter and AutomataYieldVault — full function-level documentation.' },
]

function NavCard({ href, label, desc }: { href: string; label: string; desc: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        background: hovered ? '#1e1e38' : '#16162c',
        border: `1px solid ${hovered ? 'rgba(233,30,140,0.35)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '7px',
        padding: '1rem 1.1rem',
        textDecoration: 'none',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.3)' : 'none',
        transition: 'border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s',
      }}
    >
      <div style={{
        fontFamily: 'var(--font-syne, Syne), sans-serif',
        fontWeight: 700,
        fontSize: '0.9rem',
        color: hovered ? '#fff' : '#ddd',
        marginBottom: '0.35rem',
        transition: 'color 0.15s',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-mono, "IBM Plex Mono"), monospace',
        fontSize: '0.72rem',
        color: '#555',
        lineHeight: '1.5',
      }}>
        {desc}
      </div>
    </Link>
  )
}

export default function NavCards() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
      gap: '0.85rem',
      marginTop: '1rem',
    }}>
      {cards.map((c) => <NavCard key={c.href} {...c} />)}
    </div>
  )
}
