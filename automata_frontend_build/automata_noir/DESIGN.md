# Design System Specification

## 1. Overview & Creative North Star: "The Synthetic Oracle"

This design system is engineered for a cross-chain AI future where precision meets prestige. Our Creative North Star is **"The Synthetic Oracle"**—an aesthetic that balances the cold, uncompromising data of a terminal with the ethereal, high-end polish of a luxury fintech platform. 

We break the "generic SaaS" mold by leaning into intentional brutality: sharp corners, technical crosshairs, and monospaced data, all floating within a deep, atmospheric "Tech-Noir" void. The goal is to move beyond mere "web design" and into the realm of a custom instrument for the next generation of on-chain intelligence.

---

## 2. Colors: Tonal Depth & The Noir Palette

The color strategy is defined by high-contrast accents piercing through deep, layered navies. We do not use standard grays; every neutral is tinted with a midnight blue to maintain tonal immersion.

### Palette Tokens
- **Background (`surface`):** `#0F0F1A` — The base void.
- **Surface Low (`surface_container_low`):** `#1A1A2E` — Primary card and panel base.
- **Primary Accent (`primary`):** `#E91E8C` — Use for critical calls to action and state highlights.
- **Secondary Accent (`secondary`):** `#6A0DAD` — Use for data visualization and subtle depth.
- **On-Surface (`primary_text`):** `#FFFFFF` — Editorial headlines and active text.
- **Muted (`secondary_text`):** `#888888` — Metadata and non-interactive labels.
- **Semantic:** Success: `#22C55E` | Warning: `#F59E0B` | Error: `#EF4444`

### The "No-Line" Rule
Prohibit the use of `1px solid` borders for general layout sectioning. Separation must be achieved through **Surface Hierarchy**. A navigation sidebar is distinguished from the main dashboard not by a line, but by moving from `surface` to `surface_container_low`.

### The Glass & Gradient Rule
For persistent UI elements like global navigation, utilize Glassmorphism. Use `surface` at 60% opacity with a `backdrop-filter: blur(20px)`. This creates an "Editorial Overlap" where content feels like it is passing beneath a sophisticated lens.

---

## 3. Typography: Editorial Brutalism

We utilize a high-contrast pairing: a heavy, aggressive Display face and a highly functional, technical UI face.

- **Display (Syne, Extra Bold):** Use for headlines and large section indicators. 
    - *Styling:* Tighten letter-spacing by `-0.05em`. 
    - *Purpose:* To convey "The Synthetic Oracle" authority—unwavering and loud.
- **Body & UI (IBM Plex Mono):** Use for all functional text, terminal outputs, and buttons.
    - *Styling:* Standard tracking. 
    - *Purpose:* To provide "Fintech Credibility." The monospaced nature suggests the underlying code and data integrity of the cross-chain platform.

### Section Labeling
Adhere to the editorial format: `01 —— [LABEL]`. Use `label-md` (IBM Plex Mono) in all-caps for these indicators to anchor the layout.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows have no place here. Depth is a matter of atmospheric light and physical stacking.

- **The Layering Principle:** Stacking follows a logic of "Closer to the user = Lighter."
    - *Level 0:* `surface` (The Void)
    - *Level 1:* `surface_container_low` (Standard Cards)
    - *Level 2:* `surface_container_high` (Active Modals)
- **Ambient Glows:** Instead of drop shadows, use **Radial Glows**. Place a 5% opacity `primary` or `secondary` radial gradient behind key panels to simulate light reflecting off a dark surface.
- **The "Ghost Border" Fallback:** If a border is required for input field definition, use `rgba(255,255,255,0.08)`. Never use a 100% opaque border.
- **Signature Decorations:** Every main container must feature `crosshair` decorations in the corners. These are 8px L-shaped lines using the `outline_variant` token.

---

## 5. Components: Precision Primitives

### Buttons
- **Shape:** 0px border-radius (Strictly Sharp).
- **Primary:** No gradients. Solid `#E91E8C` background with `#FFFFFF` text.
- **Ghost (Default):** Transparent background, 1px border of `rgba(255,255,255,0.2)`. 
- **Interaction:** On hover, the border expands to 2px or shifts to the `primary` pink.

### Cards & Panels
- Forbid divider lines. Use vertical white space or a subtle shift from `surface_container_low` to `surface_container` to separate child content.
- Backgrounds should include a **subtle animated dot grid** (1px dots every 24px) at 5% opacity to provide a sense of technical scale.

### Inputs & Terminal Fields
- Background: `surface_container_lowest` (`#0C0C1F`).
- Typography: `IBM Plex Mono`.
- State: Active fields should use a 1px "Ghost Border" of the `primary` accent.

### Additional Signature Component: The Agent Node
A specialized card for AI agents featuring a `primary` to `secondary` vertical linear gradient sliver (2px wide) on the far left edge to indicate "Active Status."

---

## 6. Do’s and Don’ts

### Do:
- **Use Intentional Asymmetry:** Align text to the left but allow large Display headers to bleed off-grid or overlap containers slightly.
- **Embrace the Void:** Use generous padding (64px+) between sections to let the Tech-Noir atmosphere breathe.
- **Reference the "01 ——" Format:** Ensure every major section is numbered. It reinforces the sense of a sequential, logical AI process.

### Don’t:
- **No Pill Shapes:** Under no circumstances should a button or tag have rounded ends. It breaks the "Oracle" precision.
- **No Heavy Shadows:** Avoid "floating" items with black shadows. If it needs to float, use a blur and a subtle glow.
- **No Default Icons:** Use thin-stroke (1px) technical icons that match the `IBM Plex Mono` weight. Avoid filled, "bubbly" icon sets.