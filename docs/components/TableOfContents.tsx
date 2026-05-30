'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface TOCItem {
  id: string
  text: string
  level: 2 | 3
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function TableOfContents() {
  const [items, setItems] = useState<TOCItem[]>([])
  const [active, setActive] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    const headings = document.querySelectorAll<HTMLElement>('.doc-content h2, .doc-content h3')
    const toc: TOCItem[] = []
    headings.forEach((h) => {
      const text = h.textContent?.trim() || ''
      const id = slugify(text)
      h.id = id
      toc.push({ id, text, level: h.tagName === 'H2' ? 2 : 3 })
    })
    setItems(toc)
    setActive(toc[0]?.id || '')
  }, [pathname])

  useEffect(() => {
    if (items.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-10% 0% -70% 0%', threshold: 0 }
    )
    document.querySelectorAll('.doc-content h2, .doc-content h3').forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <aside className="toc-rail" aria-label="On this page">
      <p className="toc-label">ON THIS PAGE</p>
      <nav>
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`toc-link${item.level === 3 ? ' toc-link-sub' : ''}${active === item.id ? ' toc-link-active' : ''}`}
          >
            {item.text}
          </a>
        ))}
      </nav>
    </aside>
  )
}
