# Personal Portfolio — Design Spec

**Date:** 2026-08-07
**Status:** Approved (pending implementation)
**Audience:** an academic and a coder seeking a clean, accessible, sci-fi/ecology-themed personal site hosted on GitHub Pages.

---

## 1. Purpose

A personal portfolio for a dual identity: academic (research, publications, talks) and coder (projects, demos, code). The site must be:

- **Clean and accessible** — semantic HTML, WCAG AA contrast, full keyboard support, screen-reader friendly.
- **Minimalist but distinctive** — paper-like calm by default, with green (ecology) and cyan (sci-fi) accents used sparingly.
- **Visually memorable** — a single generative canvas piece in the hero ties the two themes together.
- **Easy to maintain** — no build step, no framework, no CMS. Edit a file, push, publish.

The site is a **prototype** intended to be filled in with real content over time. The scaffolding must be complete and the aesthetic must be landed; the words can be placeholders.

---

## 2. Stack & Architecture

- **Plain HTML, CSS, and JavaScript.** No frameworks, no bundler, no TypeScript.
- **Static deployment to GitHub Pages** via `.github/workflows/pages.yml` publishing the repo root.
- **No external dependencies in the critical path.** Optional: one Google Font for headings (e.g., Inter or a humanist sans). System font stack as fallback.
- **No CDN runtime dependencies.** All CSS and JS are local. Fonts are progressive — system stack renders first, web font swaps in if loadable.

### File Structure

```
/
├── index.html                  Home (hero + generative canvas + intro)
├── research.html               Academic: interests, publications, talks
├── projects.html               Code: repos, demos, tech stack
├── writing.html                Posts index + link to post template
├── cv.html                     Resume (HTML, optionally PDF link)
├── contact.html                Email, social, GitHub
├── assets/
│   ├── css/
│   │   ├── tokens.css          Design tokens (color, spacing, type scale)
│   │   ├── base.css            Reset, typography, layout primitives
│   │   ├── components.css      Cards, nav, footer, buttons, forms
│   │   └── themes.css          Light/dark palettes + system detection
│   ├── js/
│   │   ├── layout.js           Shared header/footer injection + active link
│   │   ├── theme.js            Theme toggle (system/light/dark) + persistence
│   │   └── generative.js       Canvas 2D particle/flow-field piece
│   └── img/                    Static images, favicons, SVG icons
├── content/
│   └── posts/                  Individual post HTML files (writing pages)
├── docs/
│   └── superpowers/
│       └── specs/              This document and others
└── .github/
    └── workflows/
        └── pages.yml           GitHub Pages deploy
```

### Why this shape

- Every page is a self-contained HTML file that loads the same three CSS files and three JS files. Trivial to cache, trivial to preview (just open the file).
- Shared chrome (header, footer) is injected by a small `layout.js` so editing nav happens in one place.
- Content can live as plain HTML for now; a JSON/markdown loader is a future addition, not a v1 concern.

---

## 3. Pages

### 3.1 Home (`index.html`)

- **Hero section:** site title (your name), one-line tagline, the generative canvas positioned behind or beside the text. Three quick links: Research / Projects / Writing.
- **Intro section:** short paragraph (2–3 sentences) framing both identities.
- **No lengthy content** — the canvas carries visual weight here.

### 3.2 Research (`research.html`)

- **Interests:** bulleted list of research areas.
- **Publications:** list (most recent first). Each entry: title, venue, year, optional author highlight, links (DOI, PDF, preprint).
- **Talks & presentations:** list with title, venue, date, optional slides/video link.

### 3.3 Projects (`projects.html`)

- **Card grid** of projects. Each card: title, one-line description, language/tool tags, links (repo, demo). 2–3 cards per row on desktop, 1 column on mobile.

### 3.4 Writing (`writing.html`)

- **Posts index:** date, title, one-line summary. Sorted newest first.
- **Post template:** `content/posts/<slug>.html` — a single article with title, date, byline, body. Linked from the index.

### 3.5 CV (`cv.html`)

- **HTML resume** styled for screen and print (`@media print` rules). Optional PDF link at the top.

### 3.6 Contact (`contact.html`)

- **Email** (with copy-to-clipboard button, no JS-only fallbacks).
- **Social links:** GitHub, ORCID, optional Mastodon/Bluesky/LinkedIn.
- Each link is a real `<a>` with `rel="me"` where appropriate.

---

## 4. Aesthetic & Theme System

### 4.1 Palette philosophy

Minimalist base with restrained accents. The base is calm and paper-like; the accents are the personality.

**Base (light theme):**
- Background: near-white warm (#FBFAF6)
- Surface: white (#FFFFFF)
- Text primary: near-black ink (#1A1A1A)
- Text secondary: muted gray (#5C5C5C)
- Border: soft hairline (#E5E2DA)

**Base (dark theme):**
- Background: deep ink (#0F1417)
- Surface: slightly lifted (#161B1F)
- Text primary: warm off-white (#ECEAE2)
- Text secondary: muted (#A1A09A)
- Border: hairline (#2A2F33)

**Accents (both themes):**
- **Ecology:** sage/moss green
  - Light: `#3F7B5F` (passes AA on white)
  - Dark: `#7FB89A` (passes AA on near-black)
- **Sci-fi:** cyan/teal
  - Light: `#1F6B7A` (passes AA on white)
  - Dark: `#7CC8D8` (passes AA on near-black)

Accents are used for: links, hover states, focus rings, the generative canvas tint, small inline SVG glyphs. Never as large fills.

### 4.2 Typography

- **Body:** system-ui stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
- **Headings:** same family, but with tighter letter-spacing and a slightly heavier weight. No separate display font — keeps the file count low and avoids a font load.
- **Type scale:** 1.250 (major third) — 1rem, 1.25rem, 1.563rem, 1.953rem, 2.441rem.
- **Line height:** 1.6 for body, 1.25 for headings.
- **Measure:** max ~70ch for prose.

### 4.3 Motifs

Subtle, never decorative-for-its-own-sake:

- **Hairline dividers** between sections — a 1px line in `--border`, sometimes a dashed variant.
- **Small inline SVG glyphs** as bullet markers or section icons: a leaf, an orbit line, a circuit node. 16px, monochrome, set to `--text-secondary`.
- **Generative canvas** in the hero is the *only* loud visual element.
- **Section labels** in monospace, uppercase, small — gives a subtle "schematic" / "log" feel.

### 4.4 Theme toggle

- Three states: **system** (default), **light**, **dark**.
- Persisted in `localStorage` under a versioned key (`portfolio-theme`).
- A small icon button in the header cycles through the three states, with `aria-label` reflecting the current state.
- `prefers-color-scheme` is the source of truth when the user hasn't chosen.

---

## 5. Generative Canvas Piece

A single canvas 2D animation in the hero of `index.html`. Concept: **"pollen drift"** — slow-moving particles following a soft flow field, with thin connecting lines drawn between particles that are close. Suggests ecology (pollen, drift, organic motion) and sci-fi (sensor network, signal mesh) at once.

### Behavior

- **Particle count:** ~80–120, tuned to viewport size.
- **Motion:** each particle is advected by a 2D Perlin/simplex-style flow field (a simple value-noise function in JS is sufficient — no library).
- **Connections:** draw a line between particle pairs within ~80px. Line opacity falls off with distance.
- **Wrap:** particles that leave the viewport wrap to the opposite edge.
- **Color:** particles and lines tinted by the active theme's accent (mix of sage and cyan, biased by per-particle random).
- **Frame rate:** target 30fps via `requestAnimationFrame`; pause when `document.hidden` or when the canvas is off-screen.

### Accessibility

- **`prefers-reduced-motion: reduce`:** render a single static frame (the particles in their initial positions) and stop the loop.
- **Decorative role:** the canvas has `aria-hidden="true"` and an empty `<canvas>` fallback. It conveys no information.
- **No input:** the canvas is purely visual; clicks pass through to underlying content (via `pointer-events: none`).

### Performance

- Resize observer resizes the canvas (`devicePixelRatio` aware) and re-seeds particles if dimensions change drastically.
- Particle updates in a single tight loop; no allocations per frame.

---

## 6. Accessibility

- **Semantic HTML:** `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>` on every page.
- **Skip-to-content link** as the first focusable element on every page.
- **Visible focus rings** in both themes (2px outline in the sci-fi accent).
- **Contrast:** every text/background pair meets WCAG AA (4.5:1 for body, 3:1 for large text). Choose accent shades that satisfy this on both backgrounds.
- **Keyboard traversal:** every interactive element is reachable and operable by keyboard.
- **Screen readers:** the canvas is decorative; everything else is real text. Nav uses `<nav aria-label="Primary">`.
- **Reduced motion:** all animations, including the canvas loop and CSS transitions, are disabled when `prefers-reduced-motion: reduce` is set.
- **Forms** (if any are added later): labels associated with inputs, error messages tied via `aria-describedby`.

---

## 7. Out of Scope (YAGNI)

- No CMS, no comments, no analytics, no search, no RSS.
- No i18n / l10n.
- No fancy page transitions or scroll-linked animations.
- No test framework — this is a static site; manual smoke testing is sufficient.
- No bundler, no TypeScript, no frontend framework.
- No backend — the contact page is just links.

These can be added later without restructuring; the architecture is intentionally small.

---

## 8. Success Criteria

The prototype is done when:

1. All six pages exist and render correctly with placeholder content.
2. The site is live on GitHub Pages and reachable by the repository URL.
3. Lighthouse scores (Accessibility ≥ 95, Performance ≥ 95, Best Practices ≥ 95, SEO ≥ 95) on the home page.
4. The theme toggle works in all three states and persists across reloads.
5. The generative canvas animates smoothly, respects `prefers-reduced-motion`, and pauses when hidden.
6. The site is fully navigable by keyboard from the skip link to the footer.
7. The site passes a basic W3C HTML validation check on every page.
