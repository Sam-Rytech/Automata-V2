'use client'

import { usePathname } from 'next/navigation'

const CATEGORY: Record<string, { label: string; color: string; bg: string }> = {
  '/':               { label: 'OVERVIEW',       color: '#E91E8C', bg: 'rgba(233,30,140,0.12)' },
  '/getting-started':{ label: 'OVERVIEW',       color: '#E91E8C', bg: 'rgba(233,30,140,0.12)' },
  '/architecture':   { label: 'OVERVIEW',       color: '#E91E8C', bg: 'rgba(233,30,140,0.12)' },
  '/concepts':       { label: 'OVERVIEW',       color: '#E91E8C', bg: 'rgba(233,30,140,0.12)' },
  '/api-reference':  { label: 'REFERENCE',      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  '/agent':          { label: 'REFERENCE',      color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  '/chains':         { label: 'PROTOCOL',       color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  '/bridging':       { label: 'PROTOCOL',       color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  '/swaps':          { label: 'PROTOCOL',       color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  '/yield':          { label: 'PROTOCOL',       color: '#22C55E', bg: 'rgba(34,197,94,0.1)'   },
  '/contracts':      { label: 'IMPLEMENTATION', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  '/frontend':       { label: 'IMPLEMENTATION', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  '/database':       { label: 'IMPLEMENTATION', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  '/x402':           { label: 'IMPLEMENTATION', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  '/status':         { label: 'META',           color: '#888',    bg: 'rgba(255,255,255,0.06)' },
}

export default function BreadcrumbChip() {
  const pathname = usePathname()
  const cat = CATEGORY[pathname] ?? { label: 'DOCS', color: '#E91E8C', bg: 'rgba(233,30,140,0.12)' }

  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <span style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono, "IBM Plex Mono"), monospace',
        fontSize: '0.62rem',
        fontWeight: 600,
        color: cat.color,
        background: cat.bg,
        border: `1px solid ${cat.color}40`,
        borderRadius: '3px',
        padding: '2px 8px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}>
        {cat.label}
      </span>
    </div>
  )
}
