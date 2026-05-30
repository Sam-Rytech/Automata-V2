'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Introduction', href: '/' },
  { label: 'Getting Started', href: '/getting-started' },
  { label: 'Architecture', href: '/architecture' },
  { label: 'Core Concepts', href: '/concepts' },
  { label: 'API Reference', href: '/api-reference' },
  { label: 'AI Agent', href: '/agent' },
  { label: 'Supported Chains', href: '/chains' },
  { label: 'Bridging (CCTP V2)', href: '/bridging' },
  { label: 'Swaps & Routing', href: '/swaps' },
  { label: 'Earn & Yield', href: '/yield' },
  { label: 'Smart Contracts', href: '/contracts' },
  { label: 'Frontend', href: '/frontend' },
  { label: 'Database', href: '/database' },
  { label: 'x402 Protocol', href: '/x402' },
  { label: 'Project Status', href: '/status' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="sidebar-desktop fixed top-0 left-0 h-screen w-64 flex flex-col"
      style={{
        background: '#1A1A2E',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        zIndex: 50,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-6 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '1.1rem',
            color: '#fff',
            letterSpacing: '-0.02em',
          }}
        >
          AUTOMATA
        </span>
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.65rem',
            color: '#E91E8C',
            background: 'rgba(233,30,140,0.1)',
            border: '1px solid rgba(233,30,140,0.2)',
            padding: '1px 6px',
            borderRadius: '3px',
          }}
        >
          DOCS
        </span>
      </div>

      {/* Version badge */}
      <div className="px-6 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#555' }}>
          v2.0.0 · Phase 1
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        {NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'block',
                padding: '0.45rem 0.75rem',
                marginBottom: '0.1rem',
                borderRadius: '5px',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: '0.8rem',
                color: isActive ? '#E91E8C' : '#888',
                background: isActive ? 'rgba(233,30,140,0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #E91E8C' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#ccc'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = '#888'
                  ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-6 py-4"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.7rem', color: '#444' }}>
          Built by{' '}
          <span style={{ color: '#E91E8C' }}>JADONAMITΞ</span>
        </div>
        <div style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.65rem', color: '#333', marginTop: '0.25rem' }}>
          Stacks · Celo · Base · Stellar
        </div>
      </div>
    </aside>
  )
}
