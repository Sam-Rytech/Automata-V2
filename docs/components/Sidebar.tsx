'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const GROUPS = [
  {
    label: 'OVERVIEW',
    items: [
      { label: 'Introduction', href: '/' },
      { label: 'Getting Started', href: '/getting-started' },
      { label: 'Architecture', href: '/architecture' },
      { label: 'Core Concepts', href: '/concepts' },
    ],
  },
  {
    label: 'REFERENCE',
    items: [
      { label: 'API Reference', href: '/api-reference' },
      { label: 'AI Agent', href: '/agent' },
    ],
  },
  {
    label: 'PROTOCOL',
    items: [
      { label: 'Supported Chains', href: '/chains' },
      { label: 'Bridging (CCTP V2)', href: '/bridging' },
      { label: 'Swaps & Routing', href: '/swaps' },
      { label: 'Earn & Yield', href: '/yield' },
    ],
  },
  {
    label: 'IMPLEMENTATION',
    items: [
      { label: 'Smart Contracts', href: '/contracts' },
      { label: 'Frontend', href: '/frontend' },
      { label: 'Database', href: '/database' },
      { label: 'x402 Protocol', href: '/x402' },
    ],
  },
  {
    label: 'META',
    items: [{ label: 'Project Status', href: '/status' }],
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { setMobileOpen(false); setSearch('') }, [pathname])

  const filtered = search.trim()
    ? GROUPS.map(g => ({
        ...g,
        items: g.items.filter(i => i.label.toLowerCase().includes(search.toLowerCase())),
      })).filter(g => g.items.length > 0)
    : GROUPS

  return (
    <>
      {/* Mobile hamburger */}
      <button className="mobile-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>☰</span>
      </button>

      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}

      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`} aria-label="Documentation navigation">

        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-name">AUTOMATA</span>
          <span className="sidebar-logo-badge">DOCS</span>
          <button className="sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">✕</button>
        </div>

        {/* Search */}
        <div className="sidebar-search-wrap">
          <div className="sidebar-search-icon">⌕</div>
          <input
            type="text"
            placeholder="Search docs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="sidebar-search-input"
            aria-label="Search documentation"
          />
          {search && (
            <button className="sidebar-search-clear" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" aria-label="Main navigation">
          {filtered.map(group => (
            <div key={group.label} className="sidebar-group">
              <p className="sidebar-group-label">{group.label}</p>
              {group.items.map(item => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="sidebar-no-results">No results for &quot;{search}&quot;</p>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-credit">
            Built by <span style={{ color: '#E91E8C' }}>JADONAMITΞ</span>
          </div>
          <div className="sidebar-footer-chains">Stacks · Celo · Base · Stellar</div>
        </div>
      </aside>
    </>
  )
}
