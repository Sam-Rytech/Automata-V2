# Automata Docs — Handover

**Session date:** 2026-05-31
**Live URL:** https://docs-alpha-sepia.vercel.app
**Vercel project:** jadonamites-projects/docs

---

## What was built this session

Full docs site overhaul — 18 static pages, three-column layout (sidebar / content / TOC), fixed top header with search, syntax highlighting, breadcrumb chips, mobile drawer. Build passes clean, deployed to Vercel.

---

## Current file structure

```
docs/
├── app/
│   ├── globals.css              all layout + component styles
│   ├── layout.tsx               root — Header + Sidebar + BreadcrumbChip + TOC
│   ├── page.tsx                 Introduction
│   └── [14 other route pages]
├── components/
│   ├── Header.tsx               fixed top bar — logo left, ⌘K search right
│   ├── Sidebar.tsx              grouped nav (OVERVIEW/REFERENCE/PROTOCOL/IMPL/META)
│   ├── TableOfContents.tsx      right rail — IntersectionObserver, auto-slugifies h2/h3
│   ├── BreadcrumbChip.tsx       colored category chip above every H1
│   ├── NavCards.tsx             intro page quick-nav grid
│   └── CodeBlock.tsx            copy button + tokenizer (TS/JSON/bash/Solidity)
├── vercel.json
└── HANDOVER.md (this file, gitignored)
```

---

## Layout constants (globals.css :root)

```
--header-h:  48px
--sidebar-w: 220px
--toc-w:     216px
```

- Header: `position: fixed; top: 0; left: 0; right: 0; height: 48px`
- Sidebar: `position: fixed; top: 48px; left: 0; height: calc(100vh - 48px); width: 220px`
- TOC: `position: fixed; top: 48px; right: 0; width: 216px` — shows only at ≥1300px
- Main content: `margin-left: 220px; margin-top: 48px; margin-right: 216px (≥1300px)`

---

## What still needs fixing — priority order

### 1. CRITICAL — Content body padding doesn't match Stacks Docs

**The problem:** Stacks Docs wraps the body content in a well-framed padding — the text sits in a contained column with clear breathing room on both sides *within* the content area. Our content fills edge-to-edge between sidebar and TOC with no inner framing. It feels raw.

**What Stacks does:**
- Content column has a `max-width` (~720-760px) centered in the available space between sidebar and TOC rail
- Left/right padding inside the content column is generous (~32-40px each side)
- The result: content feels contained and readable, not stretched wall-to-wall

**Fix to implement:**
```css
/* In globals.css .main-content */
.main-content {
  margin-left: var(--sidebar-w);
  margin-top: var(--header-h);
  padding: 2rem 3.5rem 4rem;   /* generous inner padding */
  max-width: 900px;             /* cap the column width */
}

/* On wide screens, center between sidebar and TOC */
@media (min-width: 1300px) {
  .main-content {
    margin-right: var(--toc-w);
    /* content should feel centered in remaining space, not left-jammed */
  }
}
```

The key is: generous inner padding + max-width cap + the content feeling centered in the available space (not pinned to the sidebar).

---

### 2. Sidebar group labels barely visible

`color: #6060a0` on `#111120` — acceptable but could go brighter. Target: `#7070aa`.

---

### 3. No search in sidebar (mobile)

On mobile the header is present but the search dropdown positioning may break. Test on 375px viewport.

---

### 4. Missing: `/concepts` page still thin on Flow Builder detail

The `actions[]` JSON shape section was added last session but the page could still use:
- Full Flow Builder node → API call walkthrough with a real example
- Diagram or ASCII showing node graph → intent string → API → UnsignedTx

---

### 5. No Pagefind static search

Header search is client-side (filters by title/desc only). Pagefind would give full-text search across all page content. Add as a post-build step in `package.json`:
```json
"postbuild": "npx pagefind --source .next/server/app --output-path public/pagefind"
```
Then replace the Header search dropdown with a Pagefind UI component.

---

### 6. No OG image

`/og-default.png` is referenced in metadata but the file doesn't exist. Create a 1200×630px image and put it in `docs/public/og-default.png`.

---

### 7. Custom domain not wired

Target: `docs.automata.xyz`
Steps: Vercel dashboard → jadonamites-projects/docs → Settings → Domains → Add `docs.automata.xyz` → Add CNAME `cname.vercel-dns.com` in DNS provider.

---

## Key Automata monorepo facts

- Monorepo at `~/Projects/Automata-V2/`
- Backend: port 3001 (HTTP + WebSocket), `cd backend && npm run dev`
- Frontend: port 3000, `cd frontend && npm run dev`
- x402 server: port 3002, `cd x402-yield-server && npm run dev`
- Docs: port 3002 also — conflict with x402 if running both
- Agent: `backend/src/agent/agent.ts` — Gemini 2.5 Flash, max 10 tool iterations
- All contracts undeployed (AutomataRouter.sol, AutomataYieldVault.sol, 3 Clarity)
- Sessions are in-memory (Map) — lost on restart
- Gemini API key stored in localStorage, never server-side

---

## Pending from STATUS.md

1. Wire Stacks tools into `tools.ts` + `toolExecutor.ts` (highest TP value)
2. Deploy `AutomataRouter.sol` to Celo testnet via Remix (~30 min)
3. Implement real Mento `swapIn()` calldata in `stakeService.ts`
4. Migrate sessions from in-memory Map to Prisma
5. Delete dead files: `scripts/artist.cjs`, `scripts/Elite.cjs`, `}`, `10`
