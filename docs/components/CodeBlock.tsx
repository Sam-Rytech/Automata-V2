import React from 'react'

interface CodeBlockProps {
  language?: string
  children: string
  filename?: string
}

export default function CodeBlock({ language = 'text', children, filename }: CodeBlockProps) {
  return (
    <div
      style={{
        marginBottom: '1.5rem',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.5rem 1rem',
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {filename ? (
          <span
            style={{
              fontFamily: 'IBM Plex Mono, monospace',
              fontSize: '0.75rem',
              color: '#888',
            }}
          >
            {filename}
          </span>
        ) : (
          <span />
        )}
        <span
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: '0.7rem',
            color: '#E91E8C',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {language}
        </span>
      </div>

      {/* Code */}
      <pre
        style={{
          background: '#0a0a14',
          padding: '1.25rem 1.5rem',
          overflowX: 'auto',
          margin: 0,
          fontSize: '0.8rem',
          lineHeight: '1.65',
        }}
      >
        <code
          style={{
            fontFamily: 'IBM Plex Mono, monospace',
            color: '#c0d0e0',
          }}
        >
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
        fontFamily: 'IBM Plex Mono, monospace',
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
