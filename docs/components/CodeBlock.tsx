'use client'

import { useState } from 'react'

interface CodeBlockProps {
  language?: string
  children: string
  filename?: string
}

type Token = { text: string; type?: string }

const TS_KW = new Set([
  'const', 'let', 'var', 'type', 'interface', 'export', 'import', 'from',
  'function', 'return', 'async', 'await', 'if', 'else', 'for', 'while',
  'class', 'extends', 'implements', 'default', 'new', 'this', 'true',
  'false', 'null', 'undefined', 'typeof', 'keyof', 'readonly', 'public',
  'private', 'static', 'as', 'of', 'in', 'throw', 'try', 'catch',
  'finally', 'switch', 'case', 'break', 'void', 'string', 'number',
  'boolean', 'object', 'any', 'never', 'unknown', 'enum', 'namespace',
])

const JSON_KW = new Set(['true', 'false', 'null'])

const SOL_KW = new Set([
  'pragma', 'contract', 'function', 'public', 'private', 'external',
  'internal', 'returns', 'return', 'event', 'emit', 'require',
  'modifier', 'mapping', 'address', 'uint256', 'uint', 'bool', 'bytes',
  'bytes32', 'string', 'memory', 'storage', 'calldata', 'view',
  'pure', 'payable', 'nonReentrant', 'override', 'virtual', 'if', 'else',
  'for', 'while', 'new', 'delete', 'true', 'false', 'revert', 'assembly',
])

function tokenize(code: string, lang: string): Token[] {
  if (lang === 'text') return [{ text: code }]

  const isTS  = ['typescript', 'ts', 'javascript', 'js', 'tsx', 'jsx'].includes(lang)
  const isJSON = lang === 'json'
  const isBash = ['bash', 'sh', 'shell'].includes(lang)
  const isSol  = lang === 'solidity'

  const keywords = isJSON ? JSON_KW : isSol ? SOL_KW : TS_KW

  const tokens: Token[] = []
  let i = 0

  const push = (text: string, type?: string) => {
    const last = tokens[tokens.length - 1]
    if (!type && last && !last.type) last.text += text
    else tokens.push({ text, type })
  }

  while (i < code.length) {
    // Single-line comment
    if ((isTS || isSol) && code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i)
      const s = end === -1 ? code.slice(i) : code.slice(i, end)
      push(s, 'comment'); i += s.length; continue
    }
    // Block comment
    if ((isTS || isSol) && code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2)
      const s = end === -1 ? code.slice(i) : code.slice(i, end + 2)
      push(s, 'comment'); i += s.length; continue
    }
    // Bash comment
    if (isBash && code[i] === '#') {
      const end = code.indexOf('\n', i)
      const s = end === -1 ? code.slice(i) : code.slice(i, end)
      push(s, 'comment'); i += s.length; continue
    }
    // Strings
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const q = code[i]; let j = i + 1
      while (j < code.length) {
        if (code[j] === '\\') { j += 2; continue }
        if (code[j] === q) { j++; break }
        if (q !== '`' && code[j] === '\n') break
        j++
      }
      push(code.slice(i, j), 'string'); i = j; continue
    }
    // Numbers
    if (/\d/.test(code[i]) && (i === 0 || !/[a-zA-Z_$]/.test(code[i - 1]))) {
      let j = i
      while (j < code.length && /[\d.eExX_a-fA-F]/.test(code[j])) j++
      push(code.slice(i, j), 'number'); i = j; continue
    }
    // Identifiers / keywords
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++
      const word = code.slice(i, j)
      if (keywords.has(word)) push(word, 'keyword')
      else if (/^[A-Z]/.test(word) && word.length > 1) push(word, 'type')
      else push(word)
      i = j; continue
    }
    push(code[i]); i++
  }
  return tokens
}

const TOK: Record<string, string> = {
  keyword: 'tok-keyword',
  string:  'tok-string',
  comment: 'tok-comment',
  number:  'tok-number',
  type:    'tok-type',
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
        <code>
          {tokenize(children.trim(), language).map((tok, idx) =>
            tok.type
              ? <span key={idx} className={TOK[tok.type] || ''}>{tok.text}</span>
              : tok.text
          )}
        </code>
      </pre>
    </div>
  )
}

export function Inline({ children }: { children: React.ReactNode }) {
  return (
    <code style={{
      fontFamily: 'var(--font-mono, "IBM Plex Mono"), monospace',
      background: 'rgba(255,255,255,0.07)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '3px',
      padding: '0.1em 0.35em',
      fontSize: '0.875em',
      color: '#E91E8C',
    }}>
      {children}
    </code>
  )
}
