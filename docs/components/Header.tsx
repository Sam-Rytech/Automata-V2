'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

const PAGES = [
  { label: 'Introduction',     href: '/',                desc: 'What Automata is, chains, integrations' },
  { label: 'Getting Started',  href: '/getting-started', desc: 'Install, env vars, first curl test' },
  { label: 'Architecture',     href: '/architecture',    desc: 'System diagram, tech stack, data flow' },
  { label: 'Core Concepts',    href: '/concepts',        desc: 'Chat vs Flow Builder, unsigned tx model' },
  { label: 'API Reference',    href: '/api-reference',   desc: 'All 8 endpoints and WebSocket protocol' },
  { label: 'AI Agent',         href: '/agent',           desc: 'Gemini tool-use loop, all 10 tools' },
  { label: 'Supported Chains', href: '/chains',          desc: 'Base, Celo, Ethereum, Stellar addresses' },
  { label: 'Bridging',         href: '/bridging',        desc: 'CCTP V2 burn-and-mint flow' },
  { label: 'Swaps & Routing',  href: '/swaps',           desc: 'LI.FI routes, Stellar path payments' },
  { label: 'Earn & Yield',     href: '/yield',           desc: 'Aave V3, LI.FI Earn, APY math' },
  { label: 'Smart Contracts',  href: '/contracts',       desc: 'AutomataRouter, AutomataYieldVault' },
  { label: 'Frontend',         href: '/frontend',        desc: 'Design tokens, Privy, useTransactionExecutor' },
  { label: 'Database',         href: '/database',        desc: 'Prisma schema, model docs' },
  { label: 'x402 Protocol',    href: '/x402',            desc: 'HTTP 402 autonomous payment flow' },
  { label: 'Project Status',   href: '/status',          desc: 'What works, what is partial, next actions' },
]

export default function Header() {
  const [query, setQuery]   = useState('')
  const [open, setOpen]     = useState(false)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.trim().length > 0
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(query.toLowerCase()) ||
        p.desc.toLowerCase().includes(query.toLowerCase())
      )
    : []

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') { setQuery(''); setOpen(false); inputRef.current?.blur() }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [])

  return (
    <header className="site-header">
      {/* Logo */}
      <Link href="/" className="header-logo-link">
        <span className="header-logo-name">AUTOMATA</span>
        <span className="header-logo-badge">DOCS</span>
      </Link>

      <span className="header-version">v2.0.0</span>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Search */}
      <div className="header-search-wrap">
        <span className="header-search-icon">⌕</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search docs…"
          value={query}
          className="header-search-input"
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); setOpen(true) }}
          onBlur={() => { setTimeout(() => { setOpen(false); setFocused(false) }, 150) }}
          aria-label="Search documentation"
          aria-expanded={open && results.length > 0}
        />
        <span className="header-search-kbd">⌘K</span>

        {open && results.length > 0 && (
          <div className="header-search-dropdown" role="listbox">
            {results.map(r => (
              <Link
                key={r.href}
                href={r.href}
                role="option"
                className="header-search-result"
                onClick={() => { setQuery(''); setOpen(false) }}
              >
                <span className="header-search-result-title">{r.label}</span>
                <span className="header-search-result-desc">{r.desc}</span>
              </Link>
            ))}
          </div>
        )}

        {open && query.trim().length > 0 && results.length === 0 && (
          <div className="header-search-dropdown">
            <div className="header-search-empty">No results for &quot;{query}&quot;</div>
          </div>
        )}
      </div>
    </header>
  )
}
