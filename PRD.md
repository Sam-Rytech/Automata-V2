You are building the complete frontend for AUTOMATA — a cross-chain 
AI agent platform. Build all 5 pages listed below. Use every detail 
in this prompt exactly as written. Do not invent features, copy, or 
sections not listed here.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT AUTOMATA IS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Automata is a cross-chain AI agent platform. Users send, swap, 
bridge, and stake tokens across Base, Celo, Ethereum, and Stellar 
by typing a plain English message or dragging nodes on a canvas. 
The AI agent (Gemini) handles routing, fees, and execution. The 
blockchain is invisible. The user thinks in outcomes, not technology.

Core principle: stupidly simple. One message. Every chain.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DESIGN SYSTEM — APPLY TO EVERY PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COLORS:
  --bg-primary:    #0F0F1A   page background
  --bg-card:       #1A1A2E   cards, panels, modals
  --accent-pink:   #E91E8C   primary CTAs, active states, highlights
  --accent-purple: #6A0DAD   secondary accent, borders, headings
  --text-white:    #FFFFFF   all primary text
  --text-muted:    #888888   labels, placeholders, secondary text
  --border:        rgba(255,255,255,0.08)
  --success:       #22C55E
  --warning:       #F59E0B
  --error:         #EF4444

TYPOGRAPHY:
  Display font: "Syne" (Google Fonts) — for all hero headlines and 
  section headings. Heavy weight. Tight letter spacing.
  Body font: "IBM Plex Mono" — for all body text, labels, addresses, 
  and UI copy. This gives a terminal/fintech credibility.
  Never use Inter, Roboto, or any generic sans-serif.

AESTHETIC DIRECTION — READ THIS CAREFULLY:
  Reference 1 — Blackalgo.com:
    - Deep navy background (#0F0F1A)
    - Subtle animated dot grid overlaid on the background
    - Section number labels in small monospace: "01 ——", "02 ——"
    - Corner crosshair decorations on cards (CSS only, 4 corner marks)
    - Cards have a very faint inner glow on the border using accent color
    - Buttons are sharp rectangles, NOT pill-shaped. 
      Bordered outline style: [ Launch App ]
    - Navigation has a faint border bottom, glassmorphism 
      (backdrop-filter: blur)

  Reference 2 — Halo AI studio:
    - Enormous breathing room between sections
    - One statement per section — no cluttered paragraphs
    - Oversized display text dominates the viewport
    - Minimal nav — 4 links max, one CTA button

  Reference 3 — Sandra AI:
    - Deep blue-to-dark radial gradient behind the hero orb
    - The 3D orb is the visual centerpiece — it must glow, pulse, 
      and feel alive using CSS animations or Three.js
    - Connected nodes float around the orb (chain logos)

ANIMATIONS — USE FRAMER MOTION OR CSS KEYFRAMES:
  - Hero orb: continuous slow pulse + faint particle ring rotation
  - Chain nodes around orb: slow orbit animation, each offset by 
    different delay
  - Cards: fade + slide up on scroll enter (Intersection Observer)
  - Buttons: subtle scale-up on hover, glow intensifies
  - Number/stat counters: count up animation when scrolled into view
  - Page transitions: fade in

NO ICONS — use real UI mockup screenshots or inline HTML mockups 
that look like actual product screens. No icon libraries.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 1 — LANDING PAGE  /
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NAVIGATION:
  Left: wordmark "AUTOMATA" in Syne bold, white
  Center: How it works · Chains · Models
  Right: [ Launch App ] — sharp bordered button, accent-pink on hover
  Style: glassmorphism, sticky, border-bottom rgba(255,255,255,0.06)

──── SECTION 1: HERO (full viewport height) ────

Background: #0F0F1A with animated dot grid (CSS)
Center: radial gradient glow behind the orb (accent-purple fading to 
transparent, large and soft)

THE 3D ORB:
  Build using Three.js (CDN). Create a sphere geometry with:
    - Wireframe mesh overlay on a solid core
    - MeshStandardMaterial, emissive accent-pink, roughness 0.2
    - Ambient rotation animation (slow Y-axis spin)
    - PointLight orbiting it creating dynamic lighting
    - Outer pulsing ring: a TorusGeometry around it that slowly 
      scales in and out
  Size: ~320px canvas centered in viewport

CHAIN NODES around the orb:
  4 floating labels/chips positioned around the orb:
    "BASE" left, "CELO" right, "ETHEREUM" top-left, "STELLAR" 
    bottom-right
  Each chip: dark card, chain name in IBM Plex Mono, connected to 
  orb with a faint dashed SVG line
  Animation: each chip slowly bobs up and down (CSS keyframes), 
  offset delays so they never sync

TEXT below the orb:
  Label (monospace, muted, small): "CROSS-CHAIN AI AGENT — v1.0"
  Headline (Syne, massive, white): 
    Line 1: "One message."
    Line 2: "Every chain."
  Subtext (IBM Plex Mono, muted, 16px max-width 480px centered):
    "Type what you want. Automata finds the route, estimates fees, 
    and moves your assets — across Base, Celo, Ethereum, and Stellar."
  
  Two CTA buttons (side by side):
    [ Start Chatting ] — filled accent-pink, sharp corners
    [ Build a Flow ] — outlined, white border, white text

  Scroll indicator at bottom: faint animated down arrow

──── SECTION 2: HOW IT WORKS — "01 ——" ────

Section label: "01 —— HOW IT WORKS" (IBM Plex Mono, muted, small)
Headline (Syne, large): "Two ways to move money."

SPLIT MOCKUP — this is the centerpiece of this section:
  Build two side-by-side inline HTML UI mockups. These must look 
  like real product screens, not illustrations.

  LEFT MOCKUP — CHAT INTERFACE:
    Title bar: "AUTOMATA — Chat" in monospace
    Background #1A1A2E, rounded corners, faint pink glow border
    Show a real conversation thread (3 messages):
      User message (right-aligned, pink bubble):
        "Bridge 100 USDC from Base to Stellar and swap to XLM"
      Agent message (left-aligned, dark card):
        "On it. Found the best route via Circle CCTP V2.
        Transfer fee: $0.42 · Est. time: 45 sec"
        Below: a transaction plan card showing:
          Step 1: Burn USDC on Base
          Step 2: Attest via Circle
          Step 3: Mint on Stellar
          Step 4: Swap to XLM via Horizon
        Two buttons: [ Confirm & Sign ] (pink) [ Cancel ]
      User message: "Confirmed."
    Input bar at bottom with placeholder "Type a command..."

  RIGHT MOCKUP — FLOW BUILDER:
    Title bar: "AUTOMATA — Flow Builder" in monospace
    Background #1A1A2E, rounded corners, faint purple glow border
    Show 3 connected nodes left-to-right with flowing connector lines:
      Node 1: "BRIDGE" — top border accent-purple
        Sub: "USDC · Base → Celo"
      Connector: animated dashed line with arrow
      Node 2: "SWAP" — top border accent-pink
        Sub: "USDC → cUSD · Celo"
      Connector: animated dashed line with arrow
      Node 3: "STAKE" — top border #22C55E (success)
        Sub: "cUSD → Aave · Celo"
    Bottom bar: [ Simulate ] [ Execute ] (pink, larger)
    Status strip below: "Ready to execute · Est. fee $1.20"

──── SECTION 3: CAPABILITIES — "02 ——" ────

Section label: "02 —— CAPABILITIES" (monospace, muted)
Headline (Syne): "Everything your money needs."

4 cards in a 2×2 grid. Each card has:
  - Corner crosshair decorations (CSS ::before/::after on corners)
  - Background #1A1A2E
  - Top accent line: 2px solid accent-pink or accent-purple
  - No icons — instead, a small inline HTML preview of that action

  Card 1 — SEND:
    "Transfer USDC to any wallet on any chain."
    Mini mockup: address field + amount + [ Send ] button
  
  Card 2 — SWAP:
    "Exchange tokens at the best rate, automatically."
    Mini mockup: "USDC → XLM" with rate "1 USDC = 8.42 XLM"
  
  Card 3 — BRIDGE:
    "Move assets across Base, Celo, Ethereum, Stellar."
    Mini mockup: chain selector "Base ——→ Stellar" with USDC amount
  
  Card 4 — EARN:
    "Deposit into yield protocols. Your money works for you."
    Mini mockup: "APY 4.2% · USDC on Aave" with balance counter

──── SECTION 4: SUPPORTED MODELS — "03 ——" ────

Section label: "03 —— INTELLIGENCE" (monospace, muted)
Headline (Syne): "Bring your own brain."
Subtext: "Automata works with your own API key. Choose the model 
you trust."

3 cards in a row:

  Card 1 — GEMINI 2.0 FLASH (Google):
    Background #1A1A2E, faint blue glow border
    Model name: "Gemini 2.0 Flash" (Syne, white)
    By: "Google DeepMind"
    Tag: [ RECOMMENDED ] (small green badge)
    Note: "Default model. Fast, powerful, free tier available."
  
  Card 2 — GPT-4o (OpenAI):
    Background #1A1A2E, faint green glow border
    Model name: "GPT-4o" (Syne, white)
    By: "OpenAI"
    Note: "Industry-leading reasoning. Bring your API key."
  
  Card 3 — CLAUDE (Anthropic):
    Background #1A1A2E, faint purple glow border
    Model name: "Claude 3.5" (Syne, white)
    By: "Anthropic"
    Note: "Exceptional at multi-step reasoning and safety."

Below cards: "Enter your API key once in Settings. It never leaves 
your device." (muted, centered, small)

──── SECTION 5: CHAINS — "04 ——" ────

Section label: "04 —— SUPPORTED CHAINS" (monospace, muted)
Headline (Syne): "Four chains. Native USDC. No bridges needed."

Horizontal strip of 4 chain cards:
  Base · Celo · Ethereum · Stellar
  Each: dark card, chain name in Syne bold, one-line description:
    Base: "Low fees. Fast finality. Coinbase-backed."
    Celo: "Mobile-first. MiniPay. Africa-native."
    Ethereum: "The settlement layer. Maximum security."
    Stellar: "Built for payments. XLM and USDC native."

Below: "Powered by Circle CCTP V2 — burn-and-mint bridging. 
No wrapped tokens. No custodial risk." (IBM Plex Mono, muted)

──── SECTION 6: FINAL CTA ────

Full-width dark panel, large centered:
  Headline (Syne, massive): "Your money.  
  Your agent.  
  Every chain."
  
  Button: [ Launch Automata ] (large, filled accent-pink, sharp)
  
  Below button (muted small): 
    "Testnet · Phase 1 · Base · Celo · Ethereum · Stellar"

FOOTER:
  "AUTOMATA" wordmark left
  Status: "v1.0 · Testnet"
  Right: GitHub · Docs · Twitter

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 2 — CHAT INTERFACE  /chat
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Full-screen app layout. No landing page nav. App nav instead.

LEFT SIDEBAR (280px, #1A1A2E, full height):
  Top: "AUTOMATA" wordmark + version badge "v1.0"
  Wallet section:
    Label: "CONNECTED WALLET" (monospace, muted, tiny)
    Address: "0x1a2b...3c4d" (IBM Plex Mono, white, truncated)
    Network badges in a row: BASE · CELO · ETH · XLM
  
  Balances section:
    Label: "BALANCES" (monospace, muted, tiny)
    List items (each row):
      Amount + token symbol left, chain badge right
      "124.50 USDC" — "BASE"
      "50.00 USDC" — "CELO"
      "0.00 XLM" — "STELLAR"
      "0.12 ETH" — "ETH"
  
  Mode toggle:
    Label: "EXECUTION MODE"
    Two buttons side by side:
      [ ASSISTED ] — active state: pink border + pink text
      [ AUTONOMOUS ] — inactive state: muted
  
  Bottom nav links:
    Chat (active), Flow Builder, History, Settings

MAIN CHAT AREA (full remaining width):
  Background #0F0F1A
  
  Empty state (shown before any message):
    Center screen, large muted text: "What do you want to do?"
    4 suggestion chips in a 2×2 grid:
      "Check my USDC balance across all chains"
      "Bridge 50 USDC from Base to Celo"
      "Swap USDC to XLM on Stellar"
      "Stake USDC on Aave"
    Each chip: dark card, monospace text, click fills input

  Message thread area:
    User messages: right-aligned, accent-pink background, white text, 
      sharp corners
    Agent messages: left-aligned, #1A1A2E card, subtle border
    
    Agent "thinking" state: 
      Animated pulsing dots + text cycling through:
      "Checking balances..." → "Finding best route..." → 
      "Estimating fees..."
    
    Transaction Plan Card (agent response, before confirmation):
      Dark card with pink left border
      Header: "TRANSACTION PLAN" (monospace, muted)
      Steps list (numbered, monospace):
        1. Burn 100 USDC on Base via CCTP V2
        2. Circle attestation (~45 sec)
        3. Mint 100 USDC on Stellar
        4. Swap to XLM via Horizon DEX
      Fee row: "Transfer fee: $0.42"
      Time row: "Estimated time: ~60 seconds"
      Two sharp buttons: [ Confirm & Sign ] (pink) [ Cancel ]
    
    Success Card (after signing):
      Green left border
      "Transaction confirmed"
      Tx hash in monospace with [ View on Explorer ] link
      Chain path: Base ——→ Stellar

  Input bar (fixed bottom):
    Dark background, faint top border
    Text input: "Type a command in plain English..."
    Sharp [ Send ] button, accent-pink

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 3 — FLOW BUILDER  /build
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Three-column layout: palette | canvas | config

LEFT PALETTE (200px, #1A1A2E):
  Header: "NODES" (monospace, muted, tiny)
  4 draggable node cards, each showing:
    Node type name (Syne, white, bold)
    One-line description (monospace, muted, 11px)
    Top border color:
      BRIDGE — accent-purple
      SWAP — accent-pink
      STAKE — #22C55E
      SEND — #F59E0B
  Drag handle visible on hover

CANVAS (flex-1, #0F0F1A):
  Animated dot grid background
  Show a pre-built example flow (BRIDGE → SWAP → STAKE):
    Each node is a card (180px wide):
      Colored top border (by type)
      Node type label (monospace, muted, tiny): "BRIDGE"
      Main content (Syne, white): "USDC · Base → Celo"
      Status: small green dot + "Configured"
      Corner crosshair decorations
    Nodes connected by animated flowing lines with directional arrows
    Active node (BRIDGE selected): pink outer glow

RIGHT CONFIG PANEL (280px, #1A1A2E):
  Header: "CONFIGURE NODE" (monospace, muted, tiny)
  Shows BRIDGE node config:
    Field: From Chain — dropdown showing "Base"
    Field: To Chain — dropdown showing "Celo"
    Field: Token — "USDC"
    Field: Amount — input "100"
  All fields: dark input, subtle border, IBM Plex Mono

BOTTOM BAR (full width, #1A1A2E, border-top):
  Left: execution mode toggle
  Center status: "3 nodes configured · Est. fee $1.20 · Ready"
  Right: [ Simulate ] (outlined) [ Execute ] (filled pink, larger)
  
  Status panel (expands upward when executing):
    Real-time steps with animated states:
      ✓ Burning USDC on Base... (completed, green)
      ⟳ Waiting for Circle attestation... (in progress, pulsing amber)
      ○ Minting on Celo... (pending, muted)
      ○ Swap USDC → cUSD... (pending, muted)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 4 — HISTORY  /history
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same sidebar as /chat (collapsed to icons on mobile).

Main area:
  Header: "TRANSACTION HISTORY" (Syne, large, white)
  Sub: wallet address in IBM Plex Mono, muted

Filter tabs (sharp, bordered):
  [ ALL ] [ BRIDGE ] [ SWAP ] [ STAKE ] [ SEND ]
  Active tab: pink bottom border + pink text

Transaction rows (each row is a card, full width):
  Left: Type badge (colored by type, sharp corners, monospace text)
  Center-left: Description "100 USDC · Base → Stellar" (white, Syne)
              Date-time below (muted, monospace, small)
  Center: Chain path "BASE ——→ STELLAR" with chain badges
  Right: Status badge — CONFIRMED (green) / PENDING (amber) / 
         FAILED (red)
         Tx hash below (monospace, muted) + external link

Empty state (no transactions):
  Center: large muted text "No transactions yet."
  Sub: "Start in the chat or flow builder."
  [ Launch Chat ] button

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAGE 5 — SETTINGS  /settings
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Same sidebar as /chat.

Main area — two columns:
  Left nav (200px): section list
    AI Model, Wallet, Execution, Appearance
    Active item: pink left border

  Right content area:

  AI MODEL SECTION:
    Header: "AI MODEL" (Syne)
    Label: "Gemini API Key"
    Password input + [ Save ] button (pink)
    Help text: "Get your free key at aistudio.google.com" 
      (monospace, muted, small, clickable link)
    Status indicator row: 
      ● Connected (green dot) or ○ Not configured (muted)
    
    Model selector — 3 cards in a row (same as landing page 
    Section 3 but more compact). Selected model gets pink border.
    "Gemini 2.0 Flash" selected by default.

  WALLET SECTION:
    Header: "WALLET" (Syne)
    Full address display (IBM Plex Mono, white, full)
    Wallet type badge: "EMBEDDED WALLET" or "EXTERNAL WALLET"
    Connected chains: BASE · CELO · ETH · STELLAR (badges)
    [ Disconnect ] button — outlined, white, NOT pink

  EXECUTION MODE SECTION:
    Header: "EXECUTION MODE" (Syne)
    Two option cards side by side:
      ASSISTED: "Agent proposes a plan. You review and sign."
        Active: pink border
      AUTONOMOUS: "Agent executes automatically. You get notified."
        Inactive: muted border

  APPEARANCE SECTION:
    Header: "APPEARANCE" (Syne)
    Theme row: "Dark" with a lock badge "ONLY MODE"
    (placeholder for future themes)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GLOBAL RULES — APPLY WITHOUT EXCEPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

COPY:
  Never say "gas fee" — say "transfer fee" or "network fee"
  Never expose blockchain jargon unprompted
  Keep all UI copy short, confident, and plain English
  Error messages must be human: "You don't have enough USDC on Base"
  not "INSUFFICIENT_FUNDS 0x..."

UI:
  All buttons are sharp rectangles — never pill-shaped
  All inputs: dark background, subtle border, IBM Plex Mono text
  All section labels: "01 ——" format, IBM Plex Mono, muted
  All headings: Syne font
  Corner crosshair decorations on all feature cards
  Dot grid on all dark backgrounds (CSS radial-gradient or canvas)
  Mobile: bottom tab navigation, minimum 375px viewport

TECH STACK:
  Next.js 14, Tailwind CSS, shadcn/ui, Framer Motion
  React Flow for flow builder canvas
  Privy for wallet connection
  Three.js for hero orb (via CDN in the landing hero only)

NEVER:
  - Use icon libraries (Heroicons, Lucide, etc.) — use text labels 
    and HTML mockups only
  - Use Inter, Roboto, or system fonts
  - Use pill-shaped buttons
  - Use gradients on buttons
  - Show raw blockchain errors or transaction hashes without 
    a human-readable label
  - Leave blank/empty states — always show skeleton or prompt