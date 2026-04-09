# Design System Strategy: Kinetic Depth & Institutional AI

## 1. Overview & Creative North Star

### Creative North Star: "The Sovereign Terminal"
This design system is engineered to feel like a high-end, institutional-grade AI terminal. It moves away from the friendly, rounded "SaaS" aesthetic toward a visual language of precision, authority, and multi-layered data depth. 

We achieve this through **Kinetic Depth**: a principle where the UI is not a flat canvas but a volumetric space. By utilizing intentional asymmetry, sharp geometric framing, and "glassmorphism" stacks, we create an environment that feels both tactile and technologically advanced. The layout rejects the standard "centered container" in favor of an expansive, edge-to-edge terminal feel, using dot-grid overlays and bracketed syntax to reinforce the feeling of a live, calculating intelligence.

---

## 2. Colors & Surface Architecture

The palette is anchored in deep, obsidian space, punctuated by high-energy kinetic accents.

### Color Roles
- **Base Layer (Background):** `#0F0F1A` — The "Deep Base." This is the foundation of the entire experience.
- **Floating Surfaces:** `#1A1A2E` — Used for cards, navigation, and floating modules to create separation from the base.
- **Primary Kinetic Accent:** `#ff88b8` (Pink) — Used for critical actions and active states.
- **Secondary Kinetic Accent:** `#c37fff` (Purple) — Used for secondary data streams and depth effects.

### The "No-Line" Rule
Standard 1px solid borders are strictly prohibited for defining sections. Content boundaries must be established through **Tonal Shifting**. Use the `surface-container` hierarchy to define areas. A `surface-container-low` section sitting on a `surface` background provides all the definition a professional interface requires.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent glass:
1.  **Background (`#0F0F1A`):** The bottom-most layer.
2.  **Surface Container Low:** Standard content areas.
3.  **Surface Container High (`#1A1A2E`):** Floating interactive modules.
4.  **Glassmorphism:** For top-level floating elements, use a semi-transparent `surface-variant` with a `backdrop-filter: blur(20px)`. This allows the kinetic glows to bleed through the UI, integrating the layers.

### Signature Textures
- **Dot-Grid Overlays:** Apply a subtle 12px dot grid across the `background` layer using `on-surface-variant` at 5% opacity.
- **Kinetic Glows:** Main CTAs or active modules should feature a subtle gradient transition from `primary` (`#ff88b8`) to `primary-container` (`#ff6ead`) to provide visual "soul."

---

## 3. Typography

The typography strategy relies on the tension between massive, high-contrast headlines and dense, functional metadata.

### The Scale
- **Display (Space Grotesk):** Massive and impactful. `display-lg` (3.5rem) should be used for core value propositions. The tight tracking and sharp terminals of Space Grotesk convey a "tech-brutalist" authority.
- **Body (Manrope):** All functional text, descriptions, and data must use Manrope. Its geometric neutrality ensures readability against complex backgrounds.
- **Label (Space Grotesk):** Used for "Terminal Metadata"—small, uppercase labels (0.6875rem) that often sit inside brackets or near icons.

### Editorial Hierarchy
Use intentional asymmetry. Align massive headlines to the left with significant negative space to the right, mimicking a high-end editorial layout.

---

## 4. Elevation & Kinetic Depth

### The Layering Principle
Depth is achieved by stacking `surface-container` tiers. To create a "lifted" effect, place a `surface-container-highest` element over a `surface-container-low` background. 

### Multi-Layered Shadows & Glows
For floating "Terminal" windows, avoid standard black shadows. Instead, use **Ambient Kinetic Glows**:
- **Outer Glow:** A diffused, 40px blur shadow using `secondary` (`#6A0DAD`) at 15% opacity.
- **Inner Glow:** A 1px "Inner Stroke" using `outline-variant` at 20% opacity to catch the light on the edge of the glass.

### The "Ghost Border" Fallback
If structural containment is required, use a "Ghost Border": the `outline-variant` token at 10% opacity. Never use 100% opaque borders, as they flatten the kinetic depth of the system.

---

## 5. Components

### Buttons: The [ Bracketed ] Variant
- **Style:** All buttons are strictly rectangular (0px border-radius). 
- **Primary:** Background `primary`, text `on-primary`.
- **Secondary:** Transparent background, framed by `[ ]` brackets on either side using the `primary` color.
- **Hover:** Add a `primary` outer glow (8px blur, 30% opacity) to simulate the button "powering up."

### Cards: The Glass Terminal
- **Background:** `surface-container-high` (`#1A1A2E`) at 80% opacity.
- **Blur:** `backdrop-filter: blur(12px)`.
- **Details:** Add a small `label-sm` code snippet or "Status: Active" indicator in the top-right corner to reinforce the terminal aesthetic.

### Input Fields
- **Style:** Underline only or Ghost Border (10% opacity). 
- **Focus State:** The bottom border transitions to `primary` with a subtle `primary` glow bleeding downward.

### Dot-Grid Indicators
Use the dot grid as a functional element. Active tabs or selection states can be indicated by a single `primary` colored dot on the grid rather than a traditional underline.

---

## 6. Do's and Don'ts

### Do
- **Do** use massive whitespace between sections to let the kinetic depth "breathe."
- **Do** use high-contrast typography (ExtraBold headlines vs. Regular body).
- **Do** treat "Inner Glows" as the primary way to define the edge of a component.
- **Do** align technical metadata (labels) to a strict grid.

### Don't
- **Don't** use any border-radius. This system is strictly 0px (Sharp).
- **Don't** use standard drop shadows (e.g., #000000 at 25%). Only use tinted ambient glows.
- **Don't** use divider lines to separate list items; use vertical spacing and subtle shifts in surface tone.
- **Don't** use "playful" or rounded iconography. Use sharp, thin-stroke linear icons.