# Personal Portfolio Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a six-page static personal portfolio — academic + coder identity, sci-fi/ecology aesthetic, generative hero canvas — deployed to GitHub Pages with placeholder content.

**Architecture:** Every page is a self-contained HTML file loading the same four CSS files and three JS files. Shared header/footer are injected client-side by `layout.js` into placeholder elements, with a `<noscript>` nav fallback so the site is navigable and crawlable without JS. Theme is a three-state (system/light/dark) toggle persisted in `localStorage`, applied as a `data-theme` attribute on `<html>`. The hero canvas is a dependency-free value-noise flow field.

**Tech Stack:** Plain HTML5, CSS (custom properties), vanilla ES2020 JavaScript, Canvas 2D. No bundler, no framework, no runtime dependencies. GitHub Actions → GitHub Pages.

## Global Constraints

Copied verbatim from the spec. Every task's requirements implicitly include this section.

- **No frameworks, no bundler, no TypeScript.** Plain HTML, CSS, and JavaScript only.
- **No CDN runtime dependencies.** All CSS and JS are local.
- **No external dependencies in the critical path.** Body font is the system stack: `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. No web font is loaded in v1.
- **Type scale is 1.250 (major third):** 1rem, 1.25rem, 1.563rem, 1.953rem, 2.441rem.
- **Line height:** 1.6 body, 1.25 headings. **Measure:** max ~70ch for prose.
- **Light palette:** bg `#FBFAF6`, surface `#FFFFFF`, text `#1A1A1A`, text-secondary `#5C5C5C`, border `#E5E2DA`.
- **Dark palette:** bg `#0F1417`, surface `#161B1F`, text `#ECEAE2`, text-secondary `#A1A09A`, border `#2A2F33`.
- **Accents — ecology (green):** light `#3F7B5F`, dark `#7FB89A`. **Sci-fi (cyan):** light `#1F6B7A`, dark `#7CC8D8`. Used only for links, hover, focus rings, canvas tint, and small inline SVG glyphs — **never as large fills.**
- **localStorage key is exactly `portfolio-theme`.**
- **Accessibility is a gate, not a polish pass:** semantic landmarks on every page, skip-to-content as first focusable element, 2px visible focus ring in the sci-fi accent, WCAG AA contrast (4.5:1 body / 3:1 large), full keyboard operability.
- **`prefers-reduced-motion: reduce` disables all motion**, including the canvas loop and CSS transitions.
- **Out of scope (do not build):** CMS, comments, analytics, search, RSS, i18n, page transitions, scroll-linked animation, test framework, backend.

---

## File Structure

| File | Responsibility |
|---|---|
| `index.html` | Home: hero, canvas mount, intro, three quick links |
| `research.html` | Interests, publications, talks |
| `projects.html` | Project card grid |
| `writing.html` | Posts index |
| `content/posts/hello-world.html` | Post template / first placeholder post |
| `cv.html` | HTML resume, screen + print |
| `contact.html` | Email with copy button, social links |
| `assets/css/tokens.css` | Design tokens: type scale, spacing, radii, raw palette values |
| `assets/css/themes.css` | Semantic color mapping for light/dark/system |
| `assets/css/base.css` | Reset, typography, layout primitives, focus, print |
| `assets/css/components.css` | Header/nav, footer, cards, buttons, tags, section labels, hairlines |
| `assets/js/layout.js` | Header/footer injection, active-link marking |
| `assets/js/theme.js` | Three-state theme cycle + persistence |
| `assets/js/generative.js` | Pollen-drift flow-field canvas |
| `assets/img/` | Favicon, inline SVG source |
| `.github/workflows/pages.yml` | Deploy repo root to GitHub Pages |

**Load order matters:** `tokens.css` → `themes.css` → `base.css` → `components.css`. `theme.js` must be loaded in `<head>` as a blocking classic script (to avoid a flash of the wrong theme); `layout.js` and `generative.js` are `defer`.

---

## Task 1: Repository scaffold and Pages deployment

**Files:**
- Create: `.github/workflows/pages.yml`
- Create: `index.html` (minimal placeholder, fleshed out in Task 9)
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: nothing.
- Produces: a git repository with `main` as the default branch and a working Pages deploy. All later tasks commit into this repo.

- [ ] **Step 1: Initialize the repository**

The directory currently contains only `docs/`. Run from `C:\Users\hosek\portfolio`:

```bash
git init -b main
```

- [ ] **Step 2: Create `.gitignore`**

```
.DS_Store
Thumbs.db
*.log
node_modules/
```

- [ ] **Step 3: Create `README.md`**

```markdown
# Personal Portfolio

Static personal site — academic and coder. Plain HTML/CSS/JS, no build step.

Deployed to GitHub Pages from the repository root on every push to `main`.

## Local preview

Open `index.html` directly, or serve the directory:

    python -m http.server 8000

Then visit <http://localhost:8000>.

## Design spec

See `docs/superpowers/specs/2026-08-07-personal-portfolio-design.md`.
```

- [ ] **Step 4: Create the placeholder `index.html`**

This is a temporary stub so the deploy has something to serve. Task 9 replaces it entirely.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Portfolio</title>
</head>
<body>
  <main>
    <h1>Portfolio</h1>
    <p>Under construction.</p>
  </main>
</body>
</html>
```

- [ ] **Step 5: Create `.github/workflows/pages.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 6: Verify the stub renders**

Open `index.html` in a browser. Expected: the heading "Portfolio" and the paragraph "Under construction." No console errors.

- [ ] **Step 7: Commit**

```bash
git add .gitignore README.md index.html .github/workflows/pages.yml docs
git commit -m "chore: scaffold repository and GitHub Pages deploy"
```

- [ ] **Step 8: Push and enable Pages**

Create the GitHub repository (via `gh repo create` or the web UI), then:

```bash
git remote add origin <repo-url>
git push -u origin main
```

In the repository's **Settings → Pages**, set **Source** to **GitHub Actions**. Re-run the workflow if it ran before the setting was applied.

Expected: the workflow run succeeds and the deployment URL serves the "Under construction" page.

---

## Task 2: Design tokens

**Files:**
- Create: `assets/css/tokens.css`

**Interfaces:**
- Consumes: nothing.
- Produces: the complete custom-property vocabulary used by every later CSS file. Raw palette values (`--c-*`), type scale (`--fs-*`), spacing (`--sp-*`), radii (`--radius-*`), line heights, measure, and transition duration. Themes.css maps `--c-*` onto semantic names; nothing outside `themes.css` may reference a `--c-*` value directly.

- [ ] **Step 1: Write `assets/css/tokens.css`**

```css
/* Design tokens. Raw values only — semantic mapping lives in themes.css. */

:root {
  /* Raw palette — light */
  --c-light-bg:        #FBFAF6;
  --c-light-surface:   #FFFFFF;
  --c-light-text:      #1A1A1A;
  --c-light-text-2:    #5C5C5C;
  --c-light-border:    #E5E2DA;
  --c-light-eco:       #3F7B5F;
  --c-light-scifi:     #1F6B7A;

  /* Raw palette — dark */
  --c-dark-bg:         #0F1417;
  --c-dark-surface:    #161B1F;
  --c-dark-text:       #ECEAE2;
  --c-dark-text-2:     #A1A09A;
  --c-dark-border:     #2A2F33;
  --c-dark-eco:        #7FB89A;
  --c-dark-scifi:      #7CC8D8;

  /* Type scale — 1.250 major third */
  --fs-0: 1rem;
  --fs-1: 1.25rem;
  --fs-2: 1.563rem;
  --fs-3: 1.953rem;
  --fs-4: 2.441rem;
  --fs-sm: 0.875rem;
  --fs-xs: 0.75rem;

  --lh-body: 1.6;
  --lh-heading: 1.25;
  --measure: 70ch;

  /* Font stacks */
  --font-body: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
               "Liberation Mono", monospace;

  /* Spacing — 4px base */
  --sp-1: 0.25rem;
  --sp-2: 0.5rem;
  --sp-3: 0.75rem;
  --sp-4: 1rem;
  --sp-5: 1.5rem;
  --sp-6: 2rem;
  --sp-7: 3rem;
  --sp-8: 4rem;
  --sp-9: 6rem;

  /* Radii + layout */
  --radius-sm: 3px;
  --radius-md: 6px;
  --content-width: 68rem;

  /* Motion */
  --dur: 160ms;
  --ease: cubic-bezier(0.2, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur: 0ms; }
}
```

- [ ] **Step 2: Verify the file parses**

Open `assets/css/tokens.css` in a browser tab directly (`file://.../tokens.css`). Expected: the file displays as text with no browser parse complaint. Then confirm the block count: the file defines exactly one `:root` block plus one reduced-motion override.

- [ ] **Step 3: Commit**

```bash
git add assets/css/tokens.css
git commit -m "feat: add design tokens"
```

---

## Task 3: Theme system (CSS)

**Files:**
- Create: `assets/css/themes.css`

**Interfaces:**
- Consumes: `--c-*` raw values from `tokens.css`.
- Produces: the semantic color API used everywhere else — `--bg`, `--surface`, `--text`, `--text-2`, `--border`, `--eco`, `--scifi`, `--focus`. Applied three ways: bare `:root` (light default), `@media (prefers-color-scheme: dark)` guarded with `:not([data-theme="light"])`, and `:root[data-theme="dark"]`. `theme.js` (Task 7) sets `data-theme` to `light`, `dark`, or removes it for system.

- [ ] **Step 1: Write `assets/css/themes.css`**

```css
/* Semantic color mapping. Three states: system (no attribute), light, dark. */

:root {
  --bg:      var(--c-light-bg);
  --surface: var(--c-light-surface);
  --text:    var(--c-light-text);
  --text-2:  var(--c-light-text-2);
  --border:  var(--c-light-border);
  --eco:     var(--c-light-eco);
  --scifi:   var(--c-light-scifi);
  --focus:   var(--c-light-scifi);
  color-scheme: light;
}

/* System preference is dark, and the user has not forced light. */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg:      var(--c-dark-bg);
    --surface: var(--c-dark-surface);
    --text:    var(--c-dark-text);
    --text-2:  var(--c-dark-text-2);
    --border:  var(--c-dark-border);
    --eco:     var(--c-dark-eco);
    --scifi:   var(--c-dark-scifi);
    --focus:   var(--c-dark-scifi);
    color-scheme: dark;
  }
}

/* User explicitly chose dark — wins regardless of system preference. */
:root[data-theme="dark"] {
  --bg:      var(--c-dark-bg);
  --surface: var(--c-dark-surface);
  --text:    var(--c-dark-text);
  --text-2:  var(--c-dark-text-2);
  --border:  var(--c-dark-border);
  --eco:     var(--c-dark-eco);
  --scifi:   var(--c-dark-scifi);
  --focus:   var(--c-dark-scifi);
  color-scheme: dark;
}

/* User explicitly chose light — wins regardless of system preference. */
:root[data-theme="light"] {
  --bg:      var(--c-light-bg);
  --surface: var(--c-light-surface);
  --text:    var(--c-light-text);
  --text-2:  var(--c-light-text-2);
  --border:  var(--c-light-border);
  --eco:     var(--c-light-eco);
  --scifi:   var(--c-light-scifi);
  --focus:   var(--c-light-scifi);
  color-scheme: light;
}
```

- [ ] **Step 2: Verify with a throwaway probe**

Temporarily replace the body of the stub `index.html` with:

```html
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/themes.css">
<body style="background: var(--bg); color: var(--text)">
  <p>Theme probe. <a href="#" style="color: var(--scifi)">link</a></p>
</body>
```

Expected, checked in DevTools by toggling the emulated `prefers-color-scheme`:
- System light → warm off-white background `#FBFAF6`, near-black text.
- System dark → deep ink background `#0F1417`, warm off-white text.
- Setting `document.documentElement.dataset.theme = "light"` while emulating dark → returns to the light palette.
- Setting it to `"dark"` while emulating light → dark palette.

Revert `index.html` to the Task 1 stub afterward.

- [ ] **Step 3: Commit**

```bash
git add assets/css/themes.css
git commit -m "feat: add light/dark/system theme mapping"
```

---

## Task 4: Base stylesheet

**Files:**
- Create: `assets/css/base.css`

**Interfaces:**
- Consumes: semantic colors from `themes.css`, scale/spacing from `tokens.css`.
- Produces: element defaults and three layout primitives used by every page â€” `.wrap` (centered max-width container), `.prose` (measure-constrained text column), `.stack` (vertical rhythm). Also the global `:focus-visible` ring, `.skip-link`, `.visually-hidden`, and the `@media print` baseline.

- [ ] **Step 1: Write `assets/css/base.css`**

```css
/* Reset */
*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; }

html {
  -webkit-text-size-adjust: 100%;
  scroll-behavior: smooth;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: var(--fs-0);
  line-height: var(--lh-body);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

img, svg, canvas { display: block; max-width: 100%; }
img { height: auto; }

/* Typography */
h1, h2, h3, h4 {
  line-height: var(--lh-heading);
  letter-spacing: -0.015em;
  font-weight: 650;
  text-wrap: balance;
}

h1 { font-size: var(--fs-4); }
h2 { font-size: var(--fs-3); }
h3 { font-size: var(--fs-2); }
h4 { font-size: var(--fs-1); }

p, li { text-wrap: pretty; }

a {
  color: var(--scifi);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.18em;
  transition: color var(--dur) var(--ease);
}

a:hover { color: var(--eco); }

code, kbd, samp, pre { font-family: var(--font-mono); font-size: 0.9em; }

hr {
  border: 0;
  border-top: 1px solid var(--border);
  margin-block: var(--sp-7);
}

/* Focus â€” 2px ring in the sci-fi accent, both themes */
:focus-visible {
  outline: 2px solid var(--focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Layout primitives */
.wrap {
  width: 100%;
  max-width: var(--content-width);
  margin-inline: auto;
  padding-inline: var(--sp-5);
}

.prose { max-width: var(--measure); }

.stack > * + * { margin-top: var(--sp-4); }
.stack-lg > * + * { margin-top: var(--sp-7); }

main { flex: 1 0 auto; padding-block: var(--sp-8); }

/* Skip link â€” first focusable element on every page */
.skip-link {
  position: absolute;
  left: var(--sp-4);
  top: var(--sp-4);
  z-index: 100;
  padding: var(--sp-2) var(--sp-4);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  text-decoration: none;
  transform: translateY(-200%);
}

.skip-link:focus { transform: translateY(0); }

.visually-hidden {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print baseline â€” cv.html extends this */
@media print {
  body { background: #fff; color: #000; }
  .site-header, .site-footer, .skip-link, .hero-canvas { display: none !important; }
  main { padding-block: 0; }
  a { color: #000; text-decoration: underline; }
  a[href^="http"]::after { content: " (" attr(href) ")"; font-size: 0.85em; }
}
```

- [ ] **Step 2: Verify against a probe page**

Temporarily point the stub `index.html` at `tokens.css`, `themes.css`, and `base.css`, and paste in a probe body:

```html
<a class="skip-link" href="#main">Skip to content</a>
<main id="main" class="wrap prose stack">
  <h1>Heading one</h1>
  <h2>Heading two</h2>
  <p>Body copy that should wrap at roughly seventy characters of measure so
  the line length stays comfortable to read across a wide viewport.</p>
  <p><a href="#">A link</a></p>
</main>
```

Expected:
- Pressing Tab on load reveals the skip link sliding in at the top-left; Enter moves focus to `#main`.
- The paragraph wraps at roughly 70 characters even on a wide window.
- Tabbing to the link shows a 2px cyan outline, offset 2px.
- Hovering the link turns it green.

Revert `index.html` to the Task 1 stub.

- [ ] **Step 3: Commit**

```bash
git add assets/css/base.css
git commit -m "feat: add base stylesheet and layout primitives"
```

---

## Task 5: Component stylesheet

**Files:**
- Create: `assets/css/components.css`

**Interfaces:**
- Consumes: tokens and semantic colors.
- Produces: the class contract that `layout.js` and every HTML page depend on. Exact names, fixed here and referenced verbatim later: `.site-header`, `.site-nav`, `.site-nav a[aria-current="page"]`, `.brand`, `.theme-toggle`, `.site-footer`, `.card-grid`, `.card`, `.card-links`, `.tag-list`, `.tag`, `.btn`, `.section-label`, `.entry-list`, `.entry`, `.entry-meta`, `.entry-links`, `.me`, `.glyph`, `.glyph-list`, `.hero`, `.hero-canvas`, `.hero-body`, `.tagline`, `.quick-links`.

- [ ] **Step 1: Write `assets/css/components.css`**

```css
/* ---------- Header + nav ---------- */

.site-header {
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  position: sticky;
  top: 0;
  z-index: 50;
}

.site-header .wrap {
  display: flex;
  align-items: center;
  gap: var(--sp-5);
  min-height: 3.5rem;
  flex-wrap: wrap;
}

.brand {
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--text);
  text-decoration: none;
  margin-right: auto;
}

.brand:hover { color: var(--eco); }

.site-nav ul {
  display: flex;
  gap: var(--sp-5);
  list-style: none;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
}

.site-nav a {
  color: var(--text-2);
  text-decoration: none;
  font-size: var(--fs-sm);
  padding-block: var(--sp-2);
  border-bottom: 2px solid transparent;
}

.site-nav a:hover { color: var(--text); }

.site-nav a[aria-current="page"] {
  color: var(--text);
  border-bottom-color: var(--eco);
}

.theme-toggle {
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-2);
  cursor: pointer;
  transition: color var(--dur) var(--ease), border-color var(--dur) var(--ease);
}

.theme-toggle:hover { color: var(--text); border-color: var(--text-2); }
.theme-toggle svg { width: 16px; height: 16px; }

/* ---------- Footer ---------- */

.site-footer {
  border-top: 1px solid var(--border);
  padding-block: var(--sp-6);
  color: var(--text-2);
  font-size: var(--fs-sm);
}

.site-footer .wrap {
  display: flex;
  justify-content: space-between;
  gap: var(--sp-4);
  flex-wrap: wrap;
}

/* ---------- Section labels â€” monospace schematic feel ---------- */

.section-label {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-2);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}

.section-label::after {
  content: "";
  flex: 1;
  border-top: 1px dashed var(--border);
}

/* ---------- Cards ---------- */

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: var(--sp-5);
  list-style: none;
  padding: 0;
  margin: 0;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--sp-5);
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  transition: border-color var(--dur) var(--ease);
}

.card:hover { border-color: var(--eco); }
.card h3 { font-size: var(--fs-1); }
.card p { color: var(--text-2); font-size: var(--fs-sm); flex: 1; }

.card-links {
  display: flex;
  gap: var(--sp-4);
  font-size: var(--fs-sm);
}

/* ---------- Tags ---------- */

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--sp-2);
  list-style: none;
  padding: 0;
  margin: 0;
}

.tag {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--text-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 2px var(--sp-2);
}

/* ---------- Buttons ---------- */

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-2);
  font: inherit;
  font-size: var(--fs-sm);
  padding: var(--sp-2) var(--sp-4);
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  text-decoration: none;
  cursor: pointer;
  transition: border-color var(--dur) var(--ease), color var(--dur) var(--ease);
}

.btn:hover { border-color: var(--eco); color: var(--eco); }

/* ---------- Entry lists (publications, talks, posts) ---------- */

.entry-list { list-style: none; padding: 0; margin: 0; }

.entry {
  padding-block: var(--sp-4);
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.entry:last-child { border-bottom: 0; }
.entry h3 { font-size: var(--fs-1); }
.entry-meta { color: var(--text-2); font-size: var(--fs-sm); }
.entry-meta .venue { font-style: italic; }
.entry-links { display: flex; gap: var(--sp-4); font-size: var(--fs-sm); }

/* Author highlight in publication author lists */
.me { color: var(--text); font-weight: 650; }

/* ---------- Inline glyphs ---------- */

.glyph {
  width: 16px;
  height: 16px;
  color: var(--text-2);
  flex: none;
}

ul.glyph-list { list-style: none; padding: 0; margin: 0; }

ul.glyph-list li {
  display: flex;
  align-items: baseline;
  gap: var(--sp-3);
  padding-block: var(--sp-2);
}

/* ---------- Hero ---------- */

.hero {
  position: relative;
  isolation: isolate;
  padding-block: var(--sp-9);
  overflow: hidden;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
}

.hero-body { max-width: 44ch; }
.hero-body h1 { font-size: var(--fs-4); }

.tagline {
  font-size: var(--fs-1);
  color: var(--text-2);
  margin-top: var(--sp-4);
}

.quick-links {
  display: flex;
  gap: var(--sp-4);
  flex-wrap: wrap;
  margin-top: var(--sp-6);
  list-style: none;
  padding: 0;
}
```

- [ ] **Step 2: Verify against a probe page**

Point the stub `index.html` at all four stylesheets and paste a probe body containing one `.site-header` with a `.site-nav` (one link carrying `aria-current="page"`), one `.section-label`, a `.card-grid` with three `.card`s, and one `.entry`.

Expected:
- Nav sits on one row with the brand pushed left; the current-page link is full-strength text with a green underline while the others are muted.
- The section label renders as small uppercase monospace with a dashed rule filling the remaining width.
- Cards form three columns at ~1200px wide and collapse to one column below ~500px; hovering a card turns its border green.
- No element uses an accent as a large fill.

Revert `index.html` to the Task 1 stub.

- [ ] **Step 3: Commit**

```bash
git add assets/css/components.css
git commit -m "feat: add component stylesheet"
```

---

## Task 6: Theme controller (`theme.js`)

**Files:**
- Create: `assets/js/theme.js`

**Interfaces:**
- Consumes: the `data-theme` contract from `themes.css` (`light`, `dark`, or attribute absent for system).
- Produces: the global `window.PortfolioTheme` with this exact shape â€” later tasks call it verbatim:
  - `PortfolioTheme.get()` â†’ `"system" | "light" | "dark"`
  - `PortfolioTheme.set(mode)` â€” applies and persists
  - `PortfolioTheme.cycle()` â†’ the new mode; order is `system â†’ light â†’ dark â†’ system`
  - `PortfolioTheme.resolved()` â†’ `"light" | "dark"`, the mode actually in effect right now
  - `PortfolioTheme.attachToggle(buttonEl)` â€” wires a button: click cycles, and label/icon stay in sync
  - `PortfolioTheme.onChange(fn)` â€” registers `fn(resolvedMode)`, called on every change including system-preference changes. `generative.js` uses this to re-read accent colors.

**Load requirement:** this file is a **blocking classic script in `<head>`**, before any stylesheet-dependent paint, so the stored theme is applied before first paint. Do not add `defer` or `type="module"`.

- [ ] **Step 1: Write `assets/js/theme.js`**

```js
/* Three-state theme controller: system (default), light, dark.
   Loaded synchronously in <head> so the stored choice applies before paint. */
(function () {
  'use strict';

  var KEY = 'portfolio-theme';
  var MODES = ['system', 'light', 'dark'];
  var LABELS = {
    system: 'Theme: system. Activate to switch to light.',
    light: 'Theme: light. Activate to switch to dark.',
    dark: 'Theme: dark. Activate to switch to system.'
  };

  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var listeners = [];

  function read() {
    var stored;
    try { stored = localStorage.getItem(KEY); } catch (e) { stored = null; }
    return MODES.indexOf(stored) === -1 ? 'system' : stored;
  }

  var mode = read();

  function resolved() {
    if (mode === 'system') return media.matches ? 'dark' : 'light';
    return mode;
  }

  function apply() {
    if (mode === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', mode);
    }
  }

  function notify() {
    var r = resolved();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](r); } catch (e) { /* a bad listener must not break the toggle */ }
    }
  }

  function set(next) {
    if (MODES.indexOf(next) === -1) return;
    mode = next;
    try { localStorage.setItem(KEY, mode); } catch (e) { /* private mode: session-only */ }
    apply();
    notify();
  }

  function cycle() {
    set(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
    return mode;
  }

  /* System preference changing counts as a theme change while in system mode. */
  var onMediaChange = function () { if (mode === 'system') notify(); };
  if (media.addEventListener) media.addEventListener('change', onMediaChange);
  else media.addListener(onMediaChange);

  var ICONS = {
    system: '<path d="M3 4h10v6H3z"/><path d="M6 13h4"/><path d="M8 10v3"/>',
    light: '<circle cx="8" cy="8" r="3"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4"/>',
    dark: '<path d="M13 9.5A5.5 5.5 0 016.5 3a5.5 5.5 0 100 11 5.5 5.5 0 006.5-4.5z"/>'
  };

  function paint(btn) {
    btn.setAttribute('aria-label', LABELS[mode]);
    btn.setAttribute('title', LABELS[mode]);
    btn.innerHTML =
      '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" ' +
      'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true" focusable="false">' + ICONS[mode] + '</svg>';
  }

  function attachToggle(btn) {
    if (!btn) return;
    btn.type = 'button';
    paint(btn);
    btn.addEventListener('click', function () {
      cycle();
      paint(btn);
    });
  }

  apply();

  window.PortfolioTheme = {
    get: function () { return mode; },
    set: set,
    cycle: cycle,
    resolved: resolved,
    attachToggle: attachToggle,
    onChange: function (fn) { if (typeof fn === 'function') listeners.push(fn); }
  };
})();
```

- [ ] **Step 2: Check the syntax**

```bash
node --check assets/js/theme.js
```

Expected: no output, exit code 0.

- [ ] **Step 3: Verify behavior in the browser**

Load the stub `index.html` with `tokens.css`, `themes.css`, `base.css` and `<script src="assets/js/theme.js"></script>` in `<head>`, plus `<button class="theme-toggle"></button>` in the body and a one-line inline script calling `PortfolioTheme.attachToggle(document.querySelector('.theme-toggle'))`.

Expected:
- Initial state is `system`; `<html>` has no `data-theme` attribute; the button shows the monitor glyph with `aria-label` "Theme: system. Activate to switch to light."
- Clicking cycles system â†’ light â†’ dark â†’ system, the page repaints each time, and the glyph and `aria-label` update in step.
- After landing on `dark`, reload: the page comes back dark with **no flash of light** and `localStorage.getItem('portfolio-theme')` is `"dark"`.
- With mode `system` and DevTools emulating a switch from light to dark, the page repaints without a click.
- Reaching the button with Tab and pressing Space or Enter cycles it the same way.

Revert `index.html` to the Task 1 stub.

- [ ] **Step 4: Commit**

```bash
git add assets/js/theme.js
git commit -m "feat: add three-state theme controller"
```

---

## Task 7: Shared layout injection (`layout.js`)

**Files:**
- Create: `assets/js/layout.js`

**Interfaces:**
- Consumes: `PortfolioTheme.attachToggle` from Task 6; the class contract from Task 5.
- Produces: the page contract every HTML file in Tasks 9â€“14 must satisfy:
  - `<body>` carries `data-page="<slug>"` where slug is one of `home`, `research`, `projects`, `writing`, `cv`, `contact` (post pages use `writing`).
  - `<body>` carries `data-root="<prefix>"` â€” `""` for root-level pages, `"../../"` for `content/posts/*.html`. All injected links are prefixed with it.
  - The page contains `<header class="site-header" data-site-header></header>` and `<footer class="site-footer" data-site-footer></footer>` as empty elements; this script fills them.
  - A `<noscript>` nav is written by hand into each page (Task 9 shows the exact markup) so the site stays navigable and crawlable without JS.
- Produces the exported constant `NAV` (module-internal) â€” the single place nav items are edited.

**Note on the no-JS path:** injecting chrome from JS means crawlers and no-JS users see nothing unless the `<noscript>` block is present. It is not optional â€” it is what keeps the SEO â‰¥ 95 success criterion reachable. Every page gets it.

- [ ] **Step 1: Write `assets/js/layout.js`**

```js
/* Injects shared header and footer, marks the active nav link.
   Loaded with `defer`. Pages provide [data-site-header] and [data-site-footer]. */
(function () {
  'use strict';

  var SITE_NAME = 'Your Name';

  /* Single source of truth for navigation. Edit here only. */
  var NAV = [
    { slug: 'research', href: 'research.html', label: 'Research' },
    { slug: 'projects', href: 'projects.html', label: 'Projects' },
    { slug: 'writing',  href: 'writing.html',  label: 'Writing' },
    { slug: 'cv',       href: 'cv.html',       label: 'CV' },
    { slug: 'contact',  href: 'contact.html',  label: 'Contact' }
  ];

  var body = document.body;
  var page = body.getAttribute('data-page') || '';
  var root = body.getAttribute('data-root') || '';

  function navItem(item) {
    var current = item.slug === page ? ' aria-current="page"' : '';
    return '<li><a href="' + root + item.href + '"' + current + '>' +
           item.label + '</a></li>';
  }

  function buildHeader(el) {
    var items = '';
    for (var i = 0; i < NAV.length; i++) items += navItem(NAV[i]);

    el.innerHTML =
      '<div class="wrap">' +
        '<a class="brand" href="' + root + 'index.html">' + SITE_NAME + '</a>' +
        '<nav class="site-nav" aria-label="Primary"><ul>' + items + '</ul></nav>' +
        '<button class="theme-toggle"></button>' +
      '</div>';

    if (window.PortfolioTheme) {
      window.PortfolioTheme.attachToggle(el.querySelector('.theme-toggle'));
    }
  }

  function buildFooter(el) {
    var year = new Date().getFullYear();
    el.innerHTML =
      '<div class="wrap">' +
        '<p>&copy; ' + year + ' ' + SITE_NAME + '</p>' +
        '<p><a href="' + root + 'contact.html">Contact</a></p>' +
      '</div>';
  }

  var header = document.querySelector('[data-site-header]');
  var footer = document.querySelector('[data-site-footer]');
  if (header) buildHeader(header);
  if (footer) buildFooter(footer);
})();
```

- [ ] **Step 2: Check the syntax**

```bash
node --check assets/js/layout.js
```

Expected: no output, exit code 0.

- [ ] **Step 3: Verify against a probe page**

Build a probe from the stub `index.html`: `<body data-page="research" data-root="">`, the four stylesheets, `theme.js` in `<head>`, `<header class="site-header" data-site-header></header>` and `<footer class="site-footer" data-site-footer></footer>` in the body, and `<script src="assets/js/layout.js" defer></script>`.

Expected:
- The header renders the brand, five nav links, and a working theme toggle.
- The **Research** link â€” and only that one â€” carries `aria-current="page"` and shows the green underline.
- The footer shows the current year and a Contact link.
- Tab order runs brand â†’ the five nav links â†’ theme toggle, with a visible cyan ring at each stop.
- No console errors.

Then change the probe to `data-page="cv"` and confirm the current-page marker moves to **CV**.

Revert `index.html` to the Task 1 stub.

- [ ] **Step 4: Commit**

```bash
git add assets/js/layout.js
git commit -m "feat: add shared header and footer injection"
```

---

## Task 8: Generative hero canvas (`generative.js`)

**Files:**
- Create: `assets/js/generative.js`

**Interfaces:**
- Consumes: `PortfolioTheme.onChange` from Task 6; the `--eco` and `--scifi` custom properties from Task 3 (read via `getComputedStyle`, so the canvas re-tints when the theme changes).
- Produces: a self-starting effect bound to `canvas.hero-canvas[data-generative]`. No exported API â€” the only integration point is that one element. If the element is absent, the script does nothing.

**Concept:** "pollen drift" â€” particles advected by a value-noise flow field, with thin lines drawn between pairs within ~80px, opacity falling off with distance. Tinted per-particle between the ecology green and the sci-fi cyan.

- [ ] **Step 1: Write `assets/js/generative.js`**

```js
/* Pollen drift â€” a value-noise flow field on canvas 2D.
   Decorative only: aria-hidden, pointer-events: none, no input. */
(function () {
  'use strict';

  var canvas = document.querySelector('canvas.hero-canvas[data-generative]');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var LINK_DIST = 80;         // px â€” connect particles closer than this
  var LINK_DIST_SQ = LINK_DIST * LINK_DIST;
  var TARGET_FPS = 30;
  var FRAME_MS = 1000 / TARGET_FPS;
  var NOISE_SCALE = 0.0022;   // flow field frequency
  var NOISE_DRIFT = 0.00008;  // how fast the field itself evolves
  var SPEED = 0.35;           // px per ms at full step

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Value noise (no library) ---------- */

  function hash2(ix, iy) {
    var h = ix * 374761393 + iy * 668265263;
    h = (h ^ (h >> 13)) * 1274126177;
    return ((h ^ (h >> 16)) >>> 0) / 4294967295;
  }

  function smooth(t) { return t * t * (3 - 2 * t); }

  /* 2D value noise in [0,1], bilinear over a hashed integer lattice. */
  function noise2(x, y) {
    var x0 = Math.floor(x), y0 = Math.floor(y);
    var fx = smooth(x - x0), fy = smooth(y - y0);
    var n00 = hash2(x0, y0), n10 = hash2(x0 + 1, y0);
    var n01 = hash2(x0, y0 + 1), n11 = hash2(x0 + 1, y0 + 1);
    var a = n00 + (n10 - n00) * fx;
    var b = n01 + (n11 - n01) * fx;
    return a + (b - a) * fy;
  }

  /* ---------- Color ---------- */

  var eco = [63, 123, 95], scifi = [31, 107, 122];

  function parseColor(str) {
    str = (str || '').trim();
    var m = str.match(/^#([0-9a-f]{6})$/i);
    if (m) {
      var n = parseInt(m[1], 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    m = str.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if (m) return [+m[1] | 0, +m[2] | 0, +m[3] | 0];
    return null;
  }

  function readAccents() {
    var cs = getComputedStyle(document.documentElement);
    eco = parseColor(cs.getPropertyValue('--eco')) || eco;
    scifi = parseColor(cs.getPropertyValue('--scifi')) || scifi;
  }

  /* ---------- Particles: parallel typed arrays, zero per-frame allocation ---------- */

  var count = 0;
  var px = null, py = null, tint = null;  // tint: 0 = eco, 1 = scifi
  var w = 0, h = 0, dpr = 1;
  var fieldT = 0;

  function targetCount() {
    var area = w * h;
    return Math.max(60, Math.min(120, Math.round(area / 11000)));
  }

  function seed() {
    count = targetCount();
    px = new Float32Array(count);
    py = new Float32Array(count);
    tint = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      px[i] = Math.random() * w;
      py[i] = Math.random() * h;
      tint[i] = Math.random();
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var nw = Math.max(1, Math.round(rect.width));
    var nh = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    var drastic = !count ||
      Math.abs(nw - w) > w * 0.25 || Math.abs(nh - h) > h * 0.25;

    w = nw; h = nh;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (drastic) seed();
  }

  /* ---------- Simulation + draw ---------- */

  function step(dt) {
    fieldT += dt * NOISE_DRIFT;
    var d = Math.min(dt, 50) * SPEED * 0.06;
    for (var i = 0; i < count; i++) {
      var angle = noise2(px[i] * NOISE_SCALE + fieldT,
                         py[i] * NOISE_SCALE - fieldT) * Math.PI * 4;
      var nx = px[i] + Math.cos(angle) * d;
      var ny = py[i] + Math.sin(angle) * d;
      if (nx < -10) nx = w + 10; else if (nx > w + 10) nx = -10;
      if (ny < -10) ny = h + 10; else if (ny > h + 10) ny = -10;
      px[i] = nx; py[i] = ny;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    /* Connections first, so dots sit on top. */
    ctx.lineWidth = 1;
    for (var i = 0; i < count; i++) {
      for (var j = i + 1; j < count; j++) {
        var dx = px[i] - px[j], dy = py[i] - py[j];
        var dsq = dx * dx + dy * dy;
        if (dsq > LINK_DIST_SQ) continue;
        var falloff = 1 - Math.sqrt(dsq) / LINK_DIST;
        var t = (tint[i] + tint[j]) * 0.5;
        var r = eco[0] + (scifi[0] - eco[0]) * t;
        var g = eco[1] + (scifi[1] - eco[1]) * t;
        var b = eco[2] + (scifi[2] - eco[2]) * t;
        ctx.strokeStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) +
                          ',' + (falloff * 0.28).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(px[i], py[i]);
        ctx.lineTo(px[j], py[j]);
        ctx.stroke();
      }
    }

    for (var k = 0; k < count; k++) {
      var tk = tint[k];
      var rr = eco[0] + (scifi[0] - eco[0]) * tk;
      var gg = eco[1] + (scifi[1] - eco[1]) * tk;
      var bb = eco[2] + (scifi[2] - eco[2]) * tk;
      ctx.fillStyle = 'rgba(' + (rr | 0) + ',' + (gg | 0) + ',' + (bb | 0) + ',0.55)';
      ctx.beginPath();
      ctx.arc(px[k], py[k], 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ---------- Loop control ---------- */

  var rafId = 0, last = 0, acc = 0, onScreen = true, running = false;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    var dt = now - last;
    last = now;
    acc += dt;
    if (acc < FRAME_MS) return;
    step(acc);
    acc = 0;
    draw();
  }

  function start() {
    if (running || reduceMotion.matches) return;
    running = true;
    last = performance.now();
    acc = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  function sync() {
    if (onScreen && !document.hidden) start();
    else stop();
  }

  /* ---------- Wiring ---------- */

  readAccents();
  resize();

  if (reduceMotion.matches) {
    draw();  // one static frame, no loop
  } else {
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
  }

  if ('ResizeObserver' in window) {
    new ResizeObserver(function () {
      resize();
      if (!running) draw();
    }).observe(canvas);
  } else {
    window.addEventListener('resize', function () {
      resize();
      if (!running) draw();
    });
  }

  if (window.PortfolioTheme) {
    window.PortfolioTheme.onChange(function () {
      readAccents();
      if (!running) draw();
    });
  }

  var onMotionChange = function () {
    if (reduceMotion.matches) { stop(); draw(); }
    else sync();
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
  else reduceMotion.addListener(onMotionChange);
})();
```

- [ ] **Step 2: Check the syntax**

```bash
node --check assets/js/generative.js
```

Expected: no output, exit code 0.

- [ ] **Step 3: Verify behavior in the browser**

Build a probe page with the four stylesheets, `theme.js` in `<head>`, and:

```html
<section class="hero">
  <canvas class="hero-canvas" data-generative aria-hidden="true"></canvas>
  <div class="wrap hero-body"><h1>Probe</h1></div>
</section>
<div style="height: 200vh"></div>
```

with `<script src="assets/js/generative.js" defer></script>`.

Expected:
- Particles drift slowly with connecting hairlines; nothing jitters or stutters.
- Text in `.hero-body` stays fully readable over the canvas â€” the canvas sits at `z-index: -1`.
- Clicking on the hero text selects text (the canvas does not intercept â€” `pointer-events: none`).
- **Reduced motion:** with DevTools emulating `prefers-reduced-motion: reduce`, reload â€” a single static frame renders and the Performance panel shows no ongoing `requestAnimationFrame` work.
- **Off-screen pause:** scroll past the hero; the frame rate drops to zero in the Performance panel. Scroll back and it resumes.
- **Hidden pause:** switch to another tab and back â€” same pause/resume.
- **Theme re-tint:** cycle the theme toggle; particle and line colors change to the other palette's accents without a reload.
- **Resize:** drag the window narrow and wide; the canvas stays sharp (no blurring on a HiDPI display) and re-seeds only on a large change.

- [ ] **Step 4: Commit**

```bash
git add assets/js/generative.js
git commit -m "feat: add pollen-drift generative hero canvas"
```

---

## Task 9: Home page and the canonical page shell

**Files:**
- Modify: `index.html` (replaces the Task 1 stub entirely)
- Create: `assets/img/favicon.svg`

**Interfaces:**
- Consumes: all four stylesheets, all three scripts, and the `data-page` / `data-root` / `[data-site-header]` / `[data-site-footer]` contract from Task 7.
- Produces: **the canonical page shell.** Tasks 10â€“14 reproduce this shell verbatim, changing only `<title>`, the meta description, `data-page`, and the contents of `<main>`. The shell is: skip link â†’ empty `.site-header` â†’ `<main id="main">` â†’ empty `.site-footer` â†’ `<noscript>` nav.

- [ ] **Step 1: Create `assets/img/favicon.svg`**

A leaf-and-node glyph â€” the ecology and sci-fi motifs in one mark. Colors are hardcoded here (an SVG favicon cannot read page custom properties).

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0F1417"/>
  <path d="M9 23c0-8 5-13 14-14 0 9-5 14-14 14z" fill="none" stroke="#7FB89A" stroke-width="2" stroke-linejoin="round"/>
  <path d="M9 23c3-4 6-6 11-8" fill="none" stroke="#7CC8D8" stroke-width="2" stroke-linecap="round"/>
  <circle cx="23" cy="9" r="2.5" fill="#7CC8D8"/>
</svg>
```

- [ ] **Step 2: Replace `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Your Name â€” Researcher and Developer</title>
  <meta name="description" content="Personal site of Your Name â€” research in ecology and computation, plus open-source projects and writing.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/themes.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <script src="assets/js/theme.js"></script>
</head>
<body data-page="home" data-root="">
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="site-header" data-site-header></header>

  <noscript>
    <nav class="wrap" aria-label="Primary">
      <ul>
        <li><a href="research.html">Research</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="writing.html">Writing</a></li>
        <li><a href="cv.html">CV</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </noscript>

  <main id="main">
    <section class="hero">
      <canvas class="hero-canvas" data-generative aria-hidden="true"></canvas>
      <div class="wrap">
        <div class="hero-body">
          <h1>Your Name</h1>
          <p class="tagline">Ecology, computation, and the space between them.</p>
          <ul class="quick-links">
            <li><a class="btn" href="research.html">Research</a></li>
            <li><a class="btn" href="projects.html">Projects</a></li>
            <li><a class="btn" href="writing.html">Writing</a></li>
          </ul>
        </div>
      </div>
    </section>

    <section class="wrap">
      <h2 class="section-label">About</h2>
      <div class="prose stack">
        <p>I study how ecological systems behave at scale, and I build the
        software that makes those questions tractable. Placeholder copy â€”
        replace with two or three sentences that frame both halves.</p>
        <p>Most of my work lives in the open: papers on the
        <a href="research.html">research page</a>, code on the
        <a href="projects.html">projects page</a>.</p>
      </div>
    </section>
  </main>

  <footer class="site-footer" data-site-footer></footer>

  <script src="assets/js/layout.js" defer></script>
  <script src="assets/js/generative.js" defer></script>
</body>
</html>
```

- [ ] **Step 3: Verify**

Serve the directory (`python -m http.server 8000`) and open `http://localhost:8000`.

Expected:
- Header, nav with **no** current-page marker (home is reached via the brand), theme toggle, and footer all render.
- The canvas animates behind the hero text, which stays readable in both themes.
- The three quick-link buttons navigate to pages that do not exist yet â€” a 404 here is expected until Tasks 10â€“12.
- Tab from page load: skip link â†’ brand â†’ 5 nav links â†’ theme toggle â†’ 3 quick links â†’ the two body links â†’ footer contact link. Every stop shows a visible ring.
- Disabling JavaScript still shows a usable nav list (unstyled) and all body content.
- No console errors.

- [ ] **Step 4: Commit**

```bash
git add index.html assets/img/favicon.svg
git commit -m "feat: build home page with hero canvas"
```

---

## Task 10: Research page

**Files:**
- Create: `research.html`

**Interfaces:**
- Consumes: the canonical shell from Task 9; `.section-label`, `.glyph-list`, `.glyph`, `.entry-list`, `.entry`, `.entry-meta`, `.entry-links`, `.me` from Task 5.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write `research.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Research â€” Your Name</title>
  <meta name="description" content="Research interests, publications, and talks by Your Name.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/themes.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <script src="assets/js/theme.js"></script>
</head>
<body data-page="research" data-root="">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-site-header></header>

  <noscript>
    <nav class="wrap" aria-label="Primary">
      <ul>
        <li><a href="research.html">Research</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="writing.html">Writing</a></li>
        <li><a href="cv.html">CV</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </noscript>

  <main id="main" class="wrap stack-lg">
    <h1>Research</h1>

    <section>
      <h2 class="section-label">Interests</h2>
      <ul class="glyph-list prose">
        <li>
          <svg class="glyph" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="M3 13c0-6 4-9 10-10 0 6-4 10-10 10z"/><path d="M3 13c2-3 4-4 7-5.5"/></svg>
          <span>Placeholder interest one â€” population dynamics at landscape scale.</span>
        </li>
        <li>
          <svg class="glyph" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><ellipse cx="8" cy="8" rx="7" ry="3"/><circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/></svg>
          <span>Placeholder interest two â€” simulation methods for coupled systems.</span>
        </li>
        <li>
          <svg class="glyph" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><circle cx="4" cy="4" r="1.8"/><circle cx="12" cy="12" r="1.8"/><path d="M5.5 5.5l5 5"/></svg>
          <span>Placeholder interest three â€” reproducible scientific tooling.</span>
        </li>
      </ul>
    </section>

    <section>
      <h2 class="section-label">Publications</h2>
      <ol class="entry-list">
        <li class="entry">
          <h3>A placeholder title describing a real finding</h3>
          <p class="entry-meta">
            <span class="me">Your Name</span>, A. Coauthor, B. Coauthor.
            <span class="venue">Journal of Placeholder Studies</span>, 2026.
          </p>
          <p class="entry-links">
            <a href="#">DOI</a>
            <a href="#">PDF</a>
            <a href="#">Preprint</a>
          </p>
        </li>
        <li class="entry">
          <h3>A second placeholder publication</h3>
          <p class="entry-meta">
            C. Coauthor, <span class="me">Your Name</span>.
            <span class="venue">Proceedings of Somewhere</span>, 2025.
          </p>
          <p class="entry-links">
            <a href="#">DOI</a>
            <a href="#">PDF</a>
          </p>
        </li>
      </ol>
    </section>

    <section>
      <h2 class="section-label">Talks &amp; presentations</h2>
      <ul class="entry-list">
        <li class="entry">
          <h3>A placeholder talk title</h3>
          <p class="entry-meta">
            <span class="venue">Conference Name</span>, March 2026.
          </p>
          <p class="entry-links">
            <a href="#">Slides</a>
            <a href="#">Video</a>
          </p>
        </li>
        <li class="entry">
          <h3>An invited seminar</h3>
          <p class="entry-meta">
            <span class="venue">Department Seminar Series</span>, November 2025.
          </p>
        </li>
      </ul>
    </section>
  </main>

  <footer class="site-footer" data-site-footer></footer>

  <script src="assets/js/layout.js" defer></script>
</body>
</html>
```

Note: `generative.js` is intentionally **not** loaded here â€” the canvas is home-only.

- [ ] **Step 2: Verify**

Open `http://localhost:8000/research.html`.

Expected:
- The **Research** nav link carries the green current-page underline.
- Three sections render with monospace dashed-rule labels.
- Publications are an ordered list, newest first; the author-highlight spans render at full text weight against the muted author line.
- Each glyph is a 16px monochrome SVG in the secondary text color, and is not announced by a screen reader (`aria-hidden`).
- Every link is keyboard reachable with a visible ring.
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add research.html
git commit -m "feat: build research page"
```

---

## Task 11: Projects page

**Files:**
- Create: `projects.html`

**Interfaces:**
- Consumes: the canonical shell from Task 9; `.card-grid`, `.card`, `.card-links`, `.tag-list`, `.tag` from Task 5.
- Produces: nothing other tasks depend on.

- [ ] **Step 1: Write `projects.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Projects â€” Your Name</title>
  <meta name="description" content="Open-source projects, tools, and demos built by Your Name.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/themes.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <script src="assets/js/theme.js"></script>
</head>
<body data-page="projects" data-root="">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-site-header></header>

  <noscript>
    <nav class="wrap" aria-label="Primary">
      <ul>
        <li><a href="research.html">Research</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="writing.html">Writing</a></li>
        <li><a href="cv.html">CV</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </noscript>

  <main id="main" class="wrap stack-lg">
    <div class="prose stack">
      <h1>Projects</h1>
      <p>Placeholder intro â€” a sentence about what kind of software you build
      and why.</p>
    </div>

    <section>
      <h2 class="section-label">Selected work</h2>
      <ul class="card-grid">
        <li class="card">
          <h3>Placeholder Project One</h3>
          <p>One line describing what it does and who it is for.</p>
          <ul class="tag-list">
            <li class="tag">Python</li>
            <li class="tag">NumPy</li>
          </ul>
          <p class="card-links">
            <a href="#">Repo</a>
            <a href="#">Demo</a>
          </p>
        </li>
        <li class="card">
          <h3>Placeholder Project Two</h3>
          <p>One line describing what it does and who it is for.</p>
          <ul class="tag-list">
            <li class="tag">Rust</li>
            <li class="tag">CLI</li>
          </ul>
          <p class="card-links">
            <a href="#">Repo</a>
          </p>
        </li>
        <li class="card">
          <h3>Placeholder Project Three</h3>
          <p>One line describing what it does and who it is for.</p>
          <ul class="tag-list">
            <li class="tag">JavaScript</li>
            <li class="tag">Canvas</li>
          </ul>
          <p class="card-links">
            <a href="#">Repo</a>
            <a href="#">Demo</a>
          </p>
        </li>
        <li class="card">
          <h3>Placeholder Project Four</h3>
          <p>One line describing what it does and who it is for.</p>
          <ul class="tag-list">
            <li class="tag">R</li>
            <li class="tag">Stats</li>
          </ul>
          <p class="card-links">
            <a href="#">Repo</a>
          </p>
        </li>
      </ul>
    </section>
  </main>

  <footer class="site-footer" data-site-footer></footer>

  <script src="assets/js/layout.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Open `http://localhost:8000/projects.html`.

Expected:
- **Projects** carries the current-page underline.
- Cards lay out 3 per row at ~1200px, 2 at ~800px, and 1 below ~500px, with equal-height cards and their link rows bottom-aligned (the `flex: 1` on `.card p` does this).
- Hovering a card turns its border green; the card body is not a link target â€” only the explicit Repo/Demo links are.
- Tags render as small monospace outlined chips.
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add projects.html
git commit -m "feat: build projects page"
```

---

## Task 12: Writing index and post template

**Files:**
- Create: `writing.html`
- Create: `content/posts/hello-world.html`

**Interfaces:**
- Consumes: the canonical shell from Task 9; `.entry-list`, `.entry`, `.entry-meta` from Task 5.
- Produces: the **post template**. Post pages sit two levels deep, so they set `data-root="../../"` â€” this is the only place that attribute is non-empty, and `layout.js` (Task 7) uses it to prefix every injected link. Their asset `<link>` and `<script>` paths are correspondingly `../../assets/...`.

- [ ] **Step 1: Write `writing.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Writing â€” Your Name</title>
  <meta name="description" content="Notes and essays on ecology, computation, and research practice.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/themes.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <script src="assets/js/theme.js"></script>
</head>
<body data-page="writing" data-root="">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-site-header></header>

  <noscript>
    <nav class="wrap" aria-label="Primary">
      <ul>
        <li><a href="research.html">Research</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="writing.html">Writing</a></li>
        <li><a href="cv.html">CV</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </noscript>

  <main id="main" class="wrap stack-lg">
    <div class="prose stack">
      <h1>Writing</h1>
      <p>Occasional notes on research practice, tooling, and whatever is
      currently unfinished.</p>
    </div>

    <section>
      <h2 class="section-label">Posts</h2>
      <ul class="entry-list">
        <li class="entry">
          <p class="entry-meta"><time datetime="2026-08-07">7 August 2026</time></p>
          <h3><a href="content/posts/hello-world.html">Hello, world</a></h3>
          <p>A first placeholder post, and a template for the ones that follow.</p>
        </li>
      </ul>
    </section>
  </main>

  <footer class="site-footer" data-site-footer></footer>

  <script src="assets/js/layout.js" defer></script>
</body>
</html>
```

- [ ] **Step 2: Write `content/posts/hello-world.html`**

Note the `../../` prefixes throughout and `data-root="../../"`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hello, world â€” Your Name</title>
  <meta name="description" content="A first placeholder post, and a template for the ones that follow.">
  <link rel="icon" href="../../assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="../../assets/css/tokens.css">
  <link rel="stylesheet" href="../../assets/css/themes.css">
  <link rel="stylesheet" href="../../assets/css/base.css">
  <link rel="stylesheet" href="../../assets/css/components.css">
  <script src="../../assets/js/theme.js"></script>
</head>
<body data-page="writing" data-root="../../">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-site-header></header>

  <noscript>
    <nav class="wrap" aria-label="Primary">
      <ul>
        <li><a href="../../research.html">Research</a></li>
        <li><a href="../../projects.html">Projects</a></li>
        <li><a href="../../writing.html">Writing</a></li>
        <li><a href="../../cv.html">CV</a></li>
        <li><a href="../../contact.html">Contact</a></li>
      </ul>
    </nav>
  </noscript>

  <main id="main" class="wrap">
    <article class="prose stack">
      <p class="section-label">Post</p>
      <h1>Hello, world</h1>
      <p class="entry-meta">
        <time datetime="2026-08-07">7 August 2026</time> Â· Your Name
      </p>

      <p>Placeholder body copy. This file is the template: copy it to
      <code>content/posts/&lt;slug&gt;.html</code>, change the title, the
      description, the <code>&lt;time&gt;</code> element in both places, and the
      body â€” then add a matching entry to <code>writing.html</code>.</p>

      <h2>A subheading</h2>

      <p>More placeholder copy, long enough to show that the measure holds at
      roughly seventy characters so prose stays comfortable to read on a wide
      display.</p>

      <p><a href="../../writing.html">&larr; All posts</a></p>
    </article>
  </main>

  <footer class="site-footer" data-site-footer></footer>

  <script src="../../assets/js/layout.js" defer></script>
</body>
</html>
```

- [ ] **Step 3: Verify**

Open `http://localhost:8000/writing.html`, then follow the post link.

Expected:
- On both pages, **Writing** carries the current-page underline.
- On the post page, every injected nav link resolves correctly from two levels deep â€” click **Research** from inside the post and it lands on `/research.html`, not `/content/posts/research.html`.
- The brand link from inside the post returns to the site root.
- Stylesheets and the theme toggle work identically on the post page; the theme choice persists across the navigation.
- Article prose is measure-constrained; the "All posts" link returns to the index.
- No console errors and no 404s in the Network panel on either page.

- [ ] **Step 4: Commit**

```bash
git add writing.html content/posts/hello-world.html
git commit -m "feat: build writing index and post template"
```

---

## Task 13: CV page with print styles

**Files:**
- Create: `cv.html`
- Modify: `assets/css/components.css` (append the `.cv-*` block)

**Interfaces:**
- Consumes: the canonical shell from Task 9; the `@media print` baseline from Task 4, which already hides the header, footer, and skip link.
- Produces: the `.cv-header`, `.cv-section`, `.cv-item`, and `.cv-item-meta` classes.

- [ ] **Step 1: Append the CV block to `assets/css/components.css`**

```css
/* ---------- CV ---------- */

.cv-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--sp-4);
  flex-wrap: wrap;
  padding-bottom: var(--sp-5);
  border-bottom: 1px solid var(--border);
}

.cv-section { margin-top: var(--sp-7); }

.cv-item {
  display: grid;
  grid-template-columns: 8rem 1fr;
  gap: var(--sp-4);
  padding-block: var(--sp-4);
  border-bottom: 1px solid var(--border);
}

.cv-item:last-child { border-bottom: 0; }
.cv-item h3 { font-size: var(--fs-1); }
.cv-item-meta {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--text-2);
  padding-top: 0.35rem;
}

@media (max-width: 40rem) {
  .cv-item { grid-template-columns: 1fr; gap: var(--sp-2); }
}

@media print {
  .cv-item { break-inside: avoid; page-break-inside: avoid; }
  .cv-section { break-inside: avoid-page; }
  .cv-download { display: none !important; }
  .cv-item, .cv-header { border-color: #ccc; }
}
```

- [ ] **Step 2: Write `cv.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CV â€” Your Name</title>
  <meta name="description" content="Curriculum vitae of Your Name â€” education, positions, and selected work.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/themes.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <script src="assets/js/theme.js"></script>
</head>
<body data-page="cv" data-root="">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-site-header></header>

  <noscript>
    <nav class="wrap" aria-label="Primary">
      <ul>
        <li><a href="research.html">Research</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="writing.html">Writing</a></li>
        <li><a href="cv.html">CV</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </noscript>

  <main id="main" class="wrap">
    <div class="cv-header">
      <div>
        <h1>Your Name</h1>
        <p class="entry-meta">Researcher and developer Â· City, Country</p>
      </div>
      <p class="cv-download"><a class="btn" href="#">Download PDF</a></p>
    </div>

    <section class="cv-section">
      <h2 class="section-label">Education</h2>
      <div class="cv-item">
        <p class="cv-item-meta">2019â€”2024</p>
        <div>
          <h3>PhD, Placeholder Field</h3>
          <p class="entry-meta">University Name</p>
          <p>Dissertation: <em>A placeholder title</em>.</p>
        </div>
      </div>
      <div class="cv-item">
        <p class="cv-item-meta">2015â€”2019</p>
        <div>
          <h3>BSc, Placeholder Field</h3>
          <p class="entry-meta">University Name</p>
        </div>
      </div>
    </section>

    <section class="cv-section">
      <h2 class="section-label">Positions</h2>
      <div class="cv-item">
        <p class="cv-item-meta">2024â€”present</p>
        <div>
          <h3>Placeholder Role</h3>
          <p class="entry-meta">Institution Name</p>
          <p>One line on what the role involves.</p>
        </div>
      </div>
    </section>

    <section class="cv-section">
      <h2 class="section-label">Selected publications</h2>
      <div class="cv-item">
        <p class="cv-item-meta">2026</p>
        <div>
          <h3>A placeholder title describing a real finding</h3>
          <p class="entry-meta"><span class="venue">Journal of Placeholder Studies</span></p>
        </div>
      </div>
      <p style="margin-top: var(--sp-4)"><a href="research.html">Full publication list &rarr;</a></p>
    </section>

    <section class="cv-section">
      <h2 class="section-label">Skills</h2>
      <ul class="tag-list">
        <li class="tag">Python</li>
        <li class="tag">R</li>
        <li class="tag">Rust</li>
        <li class="tag">JavaScript</li>
        <li class="tag">Statistics</li>
        <li class="tag">Simulation</li>
      </ul>
    </section>
  </main>

  <footer class="site-footer" data-site-footer></footer>

  <script src="assets/js/layout.js" defer></script>
</body>
</html>
```

- [ ] **Step 3: Verify on screen and in print preview**

Open `http://localhost:8000/cv.html`, then open the browser's print preview (Ctrl+P).

Expected on screen:
- **CV** carries the current-page underline.
- Date columns align at 8rem on desktop and stack above their entries below 640px.

Expected in print preview:
- Header, footer, skip link, and the "Download PDF" button are all absent.
- Text is black on white regardless of the active theme â€” including when the page is in dark mode.
- External links show their URL in parentheses; no CV item is split across a page break.

- [ ] **Step 4: Commit**

```bash
git add cv.html assets/css/components.css
git commit -m "feat: build CV page with print styles"
```

---

## Task 14: Contact page

**Files:**
- Create: `contact.html`

**Interfaces:**
- Consumes: the canonical shell from Task 9; `.btn`, `.glyph-list`, `.glyph` from Task 5.
- Produces: nothing other tasks depend on.

**Design note:** the copy-to-clipboard handler is a short inline script at the end of this page rather than a fourth JS file â€” it is used on exactly one page, and the spec's file structure lists exactly three files in `assets/js/`. The email is a real `mailto:` link, so the page works with the button removed; the button is enhancement only and is hidden if the Clipboard API is unavailable.

- [ ] **Step 1: Write `contact.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Contact â€” Your Name</title>
  <meta name="description" content="Get in touch with Your Name â€” email, GitHub, ORCID.">
  <link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/themes.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/components.css">
  <script src="assets/js/theme.js"></script>
</head>
<body data-page="contact" data-root="">
  <a class="skip-link" href="#main">Skip to content</a>
  <header class="site-header" data-site-header></header>

  <noscript>
    <nav class="wrap" aria-label="Primary">
      <ul>
        <li><a href="research.html">Research</a></li>
        <li><a href="projects.html">Projects</a></li>
        <li><a href="writing.html">Writing</a></li>
        <li><a href="cv.html">CV</a></li>
        <li><a href="contact.html">Contact</a></li>
      </ul>
    </nav>
  </noscript>

  <main id="main" class="wrap stack-lg">
    <div class="prose stack">
      <h1>Contact</h1>
      <p>The fastest way to reach me is email. I read everything, and I reply
      to most things.</p>
    </div>

    <section>
      <h2 class="section-label">Email</h2>
      <p style="display: flex; gap: var(--sp-4); align-items: center; flex-wrap: wrap">
        <a id="email-link" href="mailto:you@example.com">you@example.com</a>
        <button class="btn" id="copy-email" type="button" hidden>Copy address</button>
        <span class="visually-hidden" role="status" aria-live="polite" id="copy-status"></span>
      </p>
    </section>

    <section>
      <h2 class="section-label">Elsewhere</h2>
      <ul class="glyph-list prose">
        <li>
          <svg class="glyph" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><circle cx="4" cy="4" r="1.8"/><circle cx="12" cy="12" r="1.8"/><path d="M5.5 5.5l5 5"/></svg>
          <a href="https://github.com/yourhandle" rel="me noopener">GitHub</a>
        </li>
        <li>
          <svg class="glyph" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><circle cx="8" cy="8" r="6.5"/><path d="M8 5v6"/></svg>
          <a href="https://orcid.org/0000-0000-0000-0000" rel="me noopener">ORCID</a>
        </li>
        <li>
          <svg class="glyph" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><ellipse cx="8" cy="8" rx="7" ry="3"/><circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none"/></svg>
          <a href="https://bsky.app/profile/yourhandle" rel="me noopener">Bluesky</a>
        </li>
      </ul>
    </section>
  </main>

  <footer class="site-footer" data-site-footer></footer>

  <script src="assets/js/layout.js" defer></script>
  <script>
    /* Progressive enhancement: the mailto link above is the real affordance. */
    (function () {
      var btn = document.getElementById('copy-email');
      var link = document.getElementById('email-link');
      var status = document.getElementById('copy-status');
      if (!btn || !link || !navigator.clipboard) return;
      btn.hidden = false;
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(link.textContent.trim()).then(function () {
          btn.textContent = 'Copied';
          status.textContent = 'Email address copied to clipboard.';
          setTimeout(function () {
            btn.textContent = 'Copy address';
            status.textContent = '';
          }, 2000);
        });
      });
    })();
  </script>
</body>
</html>
```

- [ ] **Step 2: Verify**

Open `http://localhost:8000/contact.html`.

Expected:
- **Contact** carries the current-page underline.
- The email renders as a real `mailto:` link that works when clicked.
- The copy button appears, and clicking it copies the address, flips its label to "Copied" for two seconds, and announces the change once via the live region (verify with a screen reader or by watching `#copy-status` in DevTools).
- Reaching the button by keyboard and pressing Enter does the same.
- With JavaScript disabled, the copy button stays hidden and the mailto link still works.
- Each social link is a real `<a>` with `rel="me"`.
- No console errors.

- [ ] **Step 3: Commit**

```bash
git add contact.html
git commit -m "feat: build contact page"
```

---

## Task 15: Verification and launch

**Files:**
- Create: `robots.txt`
- Modify: any file the checks below turn up as failing

**Interfaces:**
- Consumes: every artifact from Tasks 1â€“14.
- Produces: the signed-off prototype. This task is the gate for all seven success criteria in the spec.

- [ ] **Step 1: Add `robots.txt`**

```
User-agent: *
Allow: /
```

- [ ] **Step 2: Validate every page against the W3C validator**

With the local server running, validate all seven pages. Using the validator's CLI over the deployed URLs is easiest once Pages is live; locally, upload each file at <https://validator.w3.org/nu/> or run:

```bash
npx --yes vnu-jar --format text index.html research.html projects.html \
  writing.html cv.html contact.html content/posts/hello-world.html
```

Expected: **zero errors** on all seven files. Warnings about trailing slashes or section headings are acceptable; errors are not. Fix anything reported before continuing.

- [ ] **Step 3: Run Lighthouse on the home page**

In Chrome DevTools â†’ Lighthouse, run a **desktop** audit against `http://localhost:8000/` (or the live Pages URL) in an incognito window with extensions disabled.

Expected â€” all four must clear the spec's bar:
- Accessibility â‰¥ 95
- Performance â‰¥ 95
- Best Practices â‰¥ 95
- SEO â‰¥ 95

If Accessibility falls short, the likeliest causes are a contrast pair that slipped or a missing `aria-label` on the theme toggle. If Performance falls short, check that the canvas is not running while off-screen.

- [ ] **Step 4: Verify contrast on every text/background pair**

Check these pairs with a contrast checker in **both** themes. The spec's bar is 4.5:1 for body text and 3:1 for large text.

| Pair | Light | Dark | Bar |
|---|---|---|---|
| `--text` on `--bg` | `#1A1A1A` / `#FBFAF6` | `#ECEAE2` / `#0F1417` | 4.5:1 |
| `--text-2` on `--bg` | `#5C5C5C` / `#FBFAF6` | `#A1A09A` / `#0F1417` | 4.5:1 |
| `--scifi` on `--bg` (links) | `#1F6B7A` / `#FBFAF6` | `#7CC8D8` / `#0F1417` | 4.5:1 |
| `--eco` on `--bg` (hover) | `#3F7B5F` / `#FBFAF6` | `#7FB89A` / `#0F1417` | 4.5:1 |
| `--text-2` on `--surface` (card body) | `#5C5C5C` / `#FFFFFF` | `#A1A09A` / `#161B1F` | 4.5:1 |

Expected: every row passes. If a row fails, darken the light accent or lighten the dark accent in `tokens.css` and re-check â€” the token is the only place to change it.

- [ ] **Step 5: Full keyboard traversal on every page**

On each of the seven pages, from a fresh load, tab from the very top to the very bottom without touching the mouse.

Expected on every page:
- The **first** Tab reveals the skip link; Enter on it moves focus into `<main>`.
- Every link and button is reachable, in visual order, with a visible 2px cyan ring.
- Focus is never trapped and never lands on the canvas.
- The theme toggle operates with both Enter and Space.

- [ ] **Step 6: Verify the theme across pages and reloads**

Expected:
- Set dark on `index.html`, navigate to all six other pages â€” each loads dark with no flash of light.
- Reload each â€” still dark.
- Cycle to `system` and confirm `localStorage.getItem('portfolio-theme')` is `"system"` and `<html>` has no `data-theme` attribute.
- With mode `system`, flip the OS/DevTools color-scheme preference and confirm every page follows without a reload.

- [ ] **Step 7: Verify reduced motion end to end**

With `prefers-reduced-motion: reduce` emulated, reload `index.html`.

Expected: the canvas renders one static frame and never animates; nav hover and card border transitions are instant; smooth scrolling is off.

- [ ] **Step 8: Commit and deploy**

```bash
git add robots.txt
git commit -m "chore: add robots.txt and finish verification pass"
git push
```

Watch the Actions run to completion, then load the live Pages URL.

Expected: all seven pages are reachable at the public URL, assets load over HTTPS with no mixed-content or 404 entries in the Network panel, and the home-page Lighthouse run against the live URL still clears all four thresholds.

- [ ] **Step 9: Record the result**

Confirm each spec success criterion, by number, with the evidence gathered above:

1. All six pages render with placeholder content â€” Steps 2, 5.
2. Live on GitHub Pages â€” Step 8.
3. Lighthouse â‰¥ 95 across all four categories â€” Steps 3, 8.
4. Theme toggle works in all three states and persists â€” Step 6.
5. Canvas animates, respects reduced motion, pauses when hidden â€” Task 8 Step 3, Step 7.
6. Fully navigable by keyboard from skip link to footer â€” Step 5.
7. W3C HTML validation passes on every page â€” Step 2.

Do not report the prototype complete until every one of these has been observed directly.

---

## Notes and known trade-offs

Recorded here so the implementer does not rediscover them mid-task:

- **JS-injected chrome vs. crawlability.** The spec asks for `layout.js` to inject the header and footer. That means no-JS clients and some crawlers see no navigation unless the `<noscript>` block is present, which is why every page carries one. If the SEO score still comes up short in Task 15, the fix is to hand-write the real `<nav>` into each page and reduce `layout.js` to only marking the active link â€” a small change confined to Task 7's file plus the seven page files.
- **`theme.js` must stay render-blocking.** Adding `defer` or `type="module"` to it reintroduces a flash of the wrong theme on load. This is the one script that is deliberately not deferred.
- **The home page has no `aria-current` nav link.** Home is reached through the brand, which is not in `NAV`. This is intentional, not a bug â€” do not add a Home entry unless the design changes.
- **Connection drawing is O(nÂ²).** At the capped 120 particles that is ~7,000 pair checks per frame at 30fps, which is comfortably within budget. If the particle cap is ever raised much beyond that, the pair loop needs spatial bucketing first.
- **Site name and personal details are placeholders.** `SITE_NAME` in `assets/js/layout.js`, the email in `contact.html`, and the social URLs all say "Your Name" / `example.com`. They are content, not structure â€” fill them in after the prototype is signed off.
