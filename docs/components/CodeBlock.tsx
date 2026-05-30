'use client'

import { useState } from 'react'

interface CodeBlockProps {
  language?: string
  children: string
  filename?: string
}

export default function CodeBlock({ language = 'text', children, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(children.trim()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-filename">{filename || ''}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="code-block-lang">{language}</span>
          <button
            onClick={copy}
            className={`code-copy-btn${copied ? ' code-copy-btn-done' : ''}`}
            aria-label="Copy code"
          >
            {copied ? '✓ copied' : 'copy'}
          </button>
        </div>
      </div>
      <pre className="code-block-pre">
        <code style={{ fontFamily: 'var(--font-mono, "IBM Plex Mono"), monospace', color: '#c0d0e0' }}>
          {children.trim()}
        </code>
      </pre>
    </div>
  )
}

interface InlineProps {
  children: React.ReactNode
}

export function Inline({ children }: InlineProps) {
  return (
    <code
      style={{
        fontFamily: 'var(--font-mono, "IBM Plex Mono"), monospace',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '3px',
        padding: '0.1em 0.35em',
        fontSize: '0.875em',
        color: '#E91E8C',
      }}
    >
      {children}
    </code>
  )
}
