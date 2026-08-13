# Zodiac Constellation Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework the hero canvas so drifting particles assemble into the twelve Chinese zodiac animals one at a time, and recolour light-theme headings to cinnabar-burgundy.

**Architecture:** A new data-only `assets/js/zodiac.js` holds twelve star figures (normalized points plus edge lists). `generative.js` gains a four-phase state machine — drift, gather, hold, disperse — that recruits particles to star targets, eases them into place, draws authored edges, then releases them. Unrecruited particles keep drifting on the existing flow field. The heading colour is a new `--heading` token applied to `h1`–`h4`.

**Tech Stack:** Plain HTML5, CSS custom properties, vanilla ES5-style JavaScript, Canvas 2D. No build step, no dependencies, no test framework.

## Global Constraints

Copied from the design spec. Every task's requirements implicitly include this section.

- **No frameworks, no bundler, no TypeScript, no libraries.** Plain HTML, CSS, and JavaScript only. No easing or geometry library — write the maths.
- **No CDN or runtime dependencies.** No `npm install`. No `package.json`.
- **No test framework** — the original spec rules one out (§7 Out of Scope). Verification is throwaway Node scripts, deleted before commit.
- **ES5 style in JS:** `var`, function expressions, IIFE. Matches the project's other three scripts. Do not modernize to `const`/`let`/arrow functions and do not convert to modules.
- **The canvas stays decorative:** `aria-hidden="true"`, `pointer-events: none`, no interactivity, **no animal names rendered anywhere** — not on the canvas, not in the DOM.
- **`prefers-reduced-motion: reduce` renders exactly one static frame and `requestAnimationFrame` is NEVER called.**
- **Heading colour is `#732A26`**, light theme only. Dark theme must stay pixel-identical.
- **Heading scope is `h1`–`h4` only.** `.brand`, `.section-label`, nav, body text, and links are untouched.
- **Print must force headings black** — an explicit heading colour otherwise overrides the print stylesheet's `body { color: #000 }`.
- Existing contracts must not regress: every `var()` resolves, every class used exists, every internal link resolves, all seven pages pass W3C validation with zero errors.
- **Only the home page loads the canvas.** The other five pages must not gain `zodiac.js` or `generative.js`.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `assets/css/tokens.css` | Modify | Add one raw value: `--c-light-heading` |
| `assets/css/themes.css` | Modify | Map `--heading` in all four theme blocks |
| `assets/css/base.css` | Modify | Apply `--heading` to `h1`–`h4`; force black headings in print |
| `assets/js/zodiac.js` | **Create** | Star-figure data only. No logic, no behavior. |
| `assets/js/generative.js` | Modify | Placement, phase machine, recruitment, figure rendering |
| `index.html` | Modify | Load `zodiac.js` before `generative.js` |

`zodiac.js` must be listed **before** `generative.js`. Both are `defer`, and `defer` preserves document order.

---

## Task 1: Cinnabar-burgundy headings

**Files:**
- Modify: `assets/css/tokens.css` (append one line to the light palette group)
- Modify: `assets/css/themes.css` (add `--heading` to all four blocks)
- Modify: `assets/css/base.css` (heading rule + print block)

**Interfaces:**
- Consumes: the existing `--c-light-*` / `--c-dark-*` raw palette in `tokens.css`, and the four-block structure of `themes.css` (`:root`, the `prefers-color-scheme: dark` block guarded by `:not([data-theme="light"])`, `:root[data-theme="dark"]`, `:root[data-theme="light"]`).
- Produces: the semantic token `--heading`, defined in all four theme blocks. Nothing later in this plan consumes it.

This task is independent of the canvas work and ships value on its own.

- [x] **Step 1: Add the raw token**

In `assets/css/tokens.css`, inside the existing `/* Raw palette — light */` group, after `--c-light-scifi`, add:

```css
  --c-light-heading:   #732A26;
```

Do not add a dark counterpart — dark headings reuse `--c-dark-text` so the dark theme stays pixel-identical.

- [x] **Step 2: Map the semantic token in all four theme blocks**

In `assets/css/themes.css`, add one declaration to each of the four blocks, immediately after the existing `--focus` line in each:

In `:root` (the light default):

```css
  --heading: var(--c-light-heading);
```

In the `@media (prefers-color-scheme: dark)` block's `:root:not([data-theme="light"])`:

```css
  --heading: var(--c-dark-text);
```

In `:root[data-theme="dark"]`:

```css
  --heading: var(--c-dark-text);
```

In `:root[data-theme="light"]`:

```css
  --heading: var(--c-light-heading);
```

All four must define it. A block that omits it would inherit the wrong value when a user switches themes.

- [x] **Step 3: Apply it to headings**

In `assets/css/base.css`, the existing rule is:

```css
h1, h2, h3, h4 {
  line-height: var(--lh-heading);
  letter-spacing: -0.015em;
  font-weight: 650;
  text-wrap: balance;
}
```

Add one declaration so it becomes:

```css
h1, h2, h3, h4 {
  color: var(--heading);
  line-height: var(--lh-heading);
  letter-spacing: -0.015em;
  font-weight: 650;
  text-wrap: balance;
}
```

- [x] **Step 4: Force black headings in print**

This step is required, not optional. `base.css`'s print block relies on `body { color: #000 }` for text colour. Now that headings carry an explicit `color`, they override it and would print in cinnabar — most visibly on the CV.

In `assets/css/base.css`, inside the existing `@media print { ... }` block, after the `body` rule, add:

```css
  h1, h2, h3, h4 { color: #000; }
```

- [x] **Step 5: Verify with a throwaway Node script**

Write a script that reads the three CSS files and asserts:

- `tokens.css` contains `--c-light-heading:` with the value `#732A26`
- `themes.css` contains exactly **four** occurrences of `--heading:`
- of those four, exactly two resolve to `var(--c-light-heading)` and exactly two to `var(--c-dark-text)`
- `base.css`'s `h1, h2, h3, h4` rule contains `color: var(--heading)`
- `base.css`'s `@media print` block contains a rule setting headings to `#000`
- every `var(--…)` in all three files still resolves to a property defined in `tokens.css` or `themes.css`
- no mojibake (`Ã¢â‚¬`, `Ã¢â€`, or any `Ã` followed by a high character)

Run it, paste the source and full output into your report, then delete it.

Expected: all assertions pass.

- [x] **Step 6: Confirm the contrast numbers independently**

Write a second throwaway script computing the WCAG contrast ratio of `#732A26` against `#FBFAF6` and `#FFFFFF`:

```js
function lum(hex) {
  var n = parseInt(hex.slice(1), 16);
  var c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a, b) {
  var x = lum(a), y = lum(b), hi = Math.max(x, y), lo = Math.min(x, y);
  return (hi + 0.05) / (lo + 0.05);
}
console.log('vs bg      ', ratio('#732A26', '#FBFAF6').toFixed(2));
console.log('vs surface ', ratio('#732A26', '#FFFFFF').toFixed(2));
```

Expected: `9.63` and `10.06`, both above the 4.5:1 AA threshold. Report the actual numbers. If they differ from these, stop and report — the token value is wrong.

Delete the script.

- [x] **Step 7: Commit**

```bash
git add assets/css/tokens.css assets/css/themes.css assets/css/base.css
git commit -m "feat: cinnabar-burgundy headings in light theme"
```

---

## Task 2: Zodiac star-figure data

**Files:**
- Create: `assets/js/zodiac.js`
- Modify: `index.html` (add the script tag before `generative.js`)

**Interfaces:**
- Consumes: nothing.
- Produces: the global `window.ZODIAC` — an array of exactly twelve objects, in canonical zodiac order, each shaped:
  - `name` — lowercase ASCII string, diagnostic only, **never rendered**
  - `aspect` — number, design-space width ÷ height, preserved when scaling
  - `stars` — array of `[x, y]` pairs, normalized so the bounding box is exactly `[0,1] × [0,1]`
  - `edges` — array of `[i, j]` index pairs into `stars`

  Task 3 reads `ZODIAC[i].stars`, `.edges`, and `.aspect`. Task 4 reads `ZODIAC.length`.

**Note on the quadrupeds:** ox, tiger, horse, goat, dog, and pig share a similar skeleton — that is expected, not a defect. Real constellations are schematic. They are differentiated by `aspect` (a dog is 1.45 wide, a goat 1.25), by ear and tail placement, and by horns or snout. Do not try to make them more distinct by adding stars; the 14-star ceiling exists because more reads as noise at hero scale.

- [x] **Step 1: Create `assets/js/zodiac.js`**

```js
/* Chinese zodiac star figures. Data only — no logic, no rendering.
   Consumed by generative.js, which must load after this file.

   Each figure: `stars` are normalized so the bounding box is exactly
   [0,1] x [0,1] (at least one star touches each edge). `aspect` carries the
   true design-space proportion (width / height) so a long snake and a compact
   rabbit both scale correctly into the same target box. `edges` are index
   pairs; every star participates in at least one edge and each figure is a
   single connected graph.

   `name` is diagnostic only. The canvas is decorative and aria-hidden — no
   animal name is ever drawn or exposed to assistive technology. */
window.ZODIAC = [
  {
    name: 'rat',
    aspect: 1.50,
    stars: [
      [0.16, 0.00], [0.00, 0.30], [0.14, 0.22], [0.36, 0.14],
      [0.60, 0.16], [0.78, 0.30], [0.92, 0.52], [1.00, 0.78],
      [0.30, 0.72], [0.72, 0.74], [0.52, 0.56], [0.30, 1.00]
    ],
    edges: [
      [1, 2], [2, 0], [2, 3], [0, 3], [3, 4], [4, 5], [5, 6], [6, 7],
      [3, 8], [8, 11], [8, 10], [10, 9], [9, 5]
    ]
  },
  {
    name: 'ox',
    aspect: 1.45,
    stars: [
      [0.06, 0.00], [0.22, 0.04], [0.14, 0.20], [0.00, 0.34],
      [0.30, 0.26], [0.46, 0.18], [0.70, 0.16], [0.88, 0.26],
      [1.00, 0.56], [0.44, 0.70], [0.42, 1.00], [0.84, 0.68],
      [0.86, 0.98], [0.64, 0.58]
    ],
    edges: [
      [3, 2], [2, 0], [2, 1], [2, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [7, 11], [11, 12], [9, 13], [13, 11]
    ]
  },
  {
    name: 'tiger',
    aspect: 1.55,
    stars: [
      [0.10, 0.06], [0.14, 0.22], [0.00, 0.30], [0.30, 0.28],
      [0.44, 0.22], [0.66, 0.20], [0.84, 0.28], [0.96, 0.14],
      [1.00, 0.00], [0.42, 0.66], [0.40, 1.00], [0.82, 0.68],
      [0.84, 0.98], [0.62, 0.60]
    ],
    edges: [
      [2, 1], [1, 0], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [4, 9], [9, 10], [6, 11], [11, 12], [9, 13], [13, 11]
    ]
  },
  {
    name: 'rabbit',
    aspect: 1.00,
    stars: [
      [0.24, 0.00], [0.44, 0.04], [0.34, 0.24], [0.16, 0.30],
      [0.40, 0.44], [0.62, 0.40], [0.78, 0.58], [1.00, 0.60],
      [0.36, 0.70], [0.30, 0.92], [0.66, 0.78], [0.52, 1.00],
      [0.00, 0.38]
    ],
    edges: [
      [12, 3], [3, 2], [2, 0], [2, 1], [2, 4], [4, 5], [5, 6], [6, 7],
      [4, 8], [8, 9], [6, 10], [10, 11], [9, 11]
    ]
  },
  {
    name: 'dragon',
    aspect: 1.80,
    stars: [
      [0.08, 0.00], [0.04, 0.16], [0.00, 0.28], [0.18, 0.26],
      [0.32, 0.12], [0.46, 0.34], [0.60, 0.16], [0.74, 0.40],
      [0.88, 0.22], [1.00, 0.46], [0.28, 0.56], [0.22, 0.80],
      [0.68, 0.66], [0.74, 1.00]
    ],
    edges: [
      [2, 1], [1, 0], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [8, 9], [3, 10], [10, 11], [7, 12], [12, 13], [5, 10]
    ]
  },
  {
    name: 'snake',
    aspect: 1.90,
    stars: [
      [0.00, 0.22], [0.12, 0.10], [0.26, 0.00], [0.40, 0.14],
      [0.52, 0.36], [0.64, 0.58], [0.76, 0.76], [0.88, 0.92],
      [1.00, 1.00], [0.34, 0.52], [0.46, 0.70]
    ],
    edges: [
      [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [4, 9], [9, 10], [10, 5]
    ]
  },
  {
    name: 'horse',
    aspect: 1.40,
    stars: [
      [0.14, 0.00], [0.06, 0.14], [0.00, 0.26], [0.24, 0.24],
      [0.40, 0.18], [0.62, 0.20], [0.82, 0.26], [0.94, 0.44],
      [1.00, 0.68], [0.38, 0.62], [0.36, 1.00], [0.80, 0.64],
      [0.84, 0.98], [0.60, 0.58]
    ],
    edges: [
      [2, 1], [1, 0], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [4, 9], [9, 10], [6, 11], [11, 12], [9, 13], [13, 11]
    ]
  },
  {
    name: 'goat',
    aspect: 1.25,
    stars: [
      [0.24, 0.00], [0.14, 0.14], [0.10, 0.28], [0.00, 0.36],
      [0.06, 0.52], [0.28, 0.34], [0.52, 0.26], [0.76, 0.34],
      [1.00, 0.26], [0.34, 0.66], [0.32, 1.00], [0.78, 0.68],
      [0.82, 0.96], [0.56, 0.62]
    ],
    edges: [
      [3, 2], [2, 1], [1, 0], [2, 4], [2, 5], [5, 6], [6, 7], [7, 8],
      [5, 9], [9, 10], [7, 11], [11, 12], [9, 13], [13, 11]
    ]
  },
  {
    name: 'monkey',
    aspect: 1.10,
    stars: [
      [0.30, 0.00], [0.22, 0.12], [0.36, 0.22], [0.14, 0.34],
      [0.00, 0.46], [0.44, 0.42], [0.62, 0.30], [0.72, 0.18],
      [0.50, 0.62], [0.34, 0.80], [0.30, 1.00], [0.66, 0.78],
      [0.84, 0.62], [1.00, 0.44]
    ],
    edges: [
      [1, 0], [0, 2], [2, 3], [3, 4], [2, 5], [5, 6], [6, 7], [5, 8],
      [8, 9], [9, 10], [8, 11], [11, 12], [12, 13]
    ]
  },
  {
    name: 'rooster',
    aspect: 1.05,
    stars: [
      [0.30, 0.00], [0.26, 0.14], [0.00, 0.22], [0.22, 0.30],
      [0.38, 0.32], [0.32, 0.52], [0.54, 0.50], [0.74, 0.34],
      [0.90, 0.16], [1.00, 0.32], [0.48, 0.76], [0.42, 1.00],
      [0.58, 0.62]
    ],
    edges: [
      [2, 1], [1, 0], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [8, 9], [6, 10], [10, 11], [6, 12], [12, 5]
    ]
  },
  {
    name: 'dog',
    aspect: 1.45,
    stars: [
      [0.12, 0.00], [0.14, 0.18], [0.00, 0.26], [0.30, 0.26],
      [0.44, 0.22], [0.66, 0.22], [0.84, 0.30], [0.96, 0.16],
      [1.00, 0.02], [0.42, 0.66], [0.40, 1.00], [0.82, 0.68],
      [0.86, 0.98], [0.62, 0.60]
    ],
    edges: [
      [2, 1], [1, 0], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8],
      [4, 9], [9, 10], [6, 11], [11, 12], [9, 13], [13, 11]
    ]
  },
  {
    name: 'pig',
    aspect: 1.35,
    stars: [
      [0.16, 0.00], [0.14, 0.16], [0.00, 0.28], [0.30, 0.24],
      [0.54, 0.16], [0.80, 0.28], [0.92, 0.20], [1.00, 0.34],
      [0.36, 0.66], [0.34, 1.00], [0.78, 0.68], [0.82, 0.96],
      [0.56, 0.64]
    ],
    edges: [
      [2, 1], [1, 0], [1, 3], [3, 4], [4, 5], [5, 6], [6, 7],
      [3, 8], [8, 9], [5, 10], [10, 11], [8, 12], [12, 10]
    ]
  }
];
```

- [x] **Step 2: Load it in `index.html`**

In `index.html`, the two deferred scripts at the end of `<body>` are currently:

```html
  <script src="assets/js/layout.js" defer></script>
  <script src="assets/js/generative.js" defer></script>
```

Insert `zodiac.js` **before** `generative.js`:

```html
  <script src="assets/js/layout.js" defer></script>
  <script src="assets/js/zodiac.js" defer></script>
  <script src="assets/js/generative.js" defer></script>
```

Order matters: `defer` scripts execute in document order, so this guarantees `window.ZODIAC` exists before `generative.js` runs.

**Do not add this script to any other page.** The canvas is home-only.

- [x] **Step 3: Run `node --check`**

```bash
node --check assets/js/zodiac.js
```

Expected: no output, exit code 0.

- [x] **Step 4: Validate the data with a throwaway Node script**

This is the highest-value check in the task — bad figure data produces a canvas that looks like random noise with no error anywhere. Write a script that loads `zodiac.js` into a stubbed context (assign a `window` object, run the file with `node:vm`, read back `window.ZODIAC`) and asserts, **reporting per figure by name**:

1. `ZODIAC` is an array of **exactly 12** entries.
2. The `name` values are exactly, in order: `rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig`.
3. Each figure has **8 to 14** stars inclusive.
4. Every star is a two-element array of finite numbers in `[0, 1]`.
5. **The bounding box is exactly `[0,1] × [0,1]`** — `min(x) === 0`, `max(x) === 1`, `min(y) === 0`, `max(y) === 1`, each within a `1e-9` tolerance. Report the actual min/max per figure so a near-miss is visible.
6. `aspect` is a finite number greater than 0.
7. Every `edges` entry is a two-element array of integers in range, and `i !== j`.
8. **No orphan stars** — every index in `0 … stars.length-1` appears in at least one edge.
9. **The figure is a single connected graph** — do a breadth-first traversal from star 0 across `edges` and assert it reaches every star. Report any figure that splits into components, naming the unreached indices.
10. No duplicate edges (treat `[i,j]` and `[j,i]` as the same edge).

Run it, paste the full script source and complete output into your report, then delete it.

Expected: all twelve figures pass every check. **If a figure fails — a disconnected graph or a bounding box that is not exactly 0–1 — report it with the figure name and the specific failure. Do not silently adjust the coordinates to make the check pass**; the controller needs to know the plan's data was wrong.

- [x] **Step 5: Confirm no other page loads the data**

```bash
grep -l "zodiac.js" *.html content/posts/*.html
```

Expected: `index.html` only.

- [x] **Step 6: Commit**

```bash
git add assets/js/zodiac.js index.html
git commit -m "feat: add Chinese zodiac star-figure data"
```

---
## Task 3: Figure placement and rendering

**Files:**
- Modify: `assets/js/generative.js`

**Interfaces:**
- Consumes: `window.ZODIAC` from Task 2 (`.stars`, `.edges`, `.aspect`); the existing module-scope `w`, `h`, `eco`, `scifi`, `ctx`, and `count`.
- Produces, at module scope in `generative.js`, for Task 4 to call:
  - `rgbaMix(t, alpha)` → CSS `rgba(...)` string; `t` is 0 = ecology green, 1 = sci-fi cyan
  - `figureBox()` → `{ x, y, w, h, alpha }` — the target rectangle plus an opacity multiplier
  - `placeFigure(fig, box, out)` — writes `2 * fig.stars.length` floats into `out` as `x0,y0,x1,y1,…`
  - `drawFigure(fig, coords, alpha, n)` — draws edges then stars from a coords array in that layout; `n` is the number of points actually present in `coords`, which may be fewer than `fig.stars.length`
  - the constant `FIG_NARROW = 700`

**Deliverable for this task:** the hero renders **one figure (index 0, the rat) permanently assembled** in the right-hand region, on top of the existing drifting particles. No phases yet. This isolates placement and rendering bugs from state-machine bugs — if the figure is misplaced or misshapen you find out now, with nothing else moving.

- [x] **Step 1: Add the colour helper and refactor the two existing call sites**

`draw()` currently inlines the same four-line eco→scifi mix twice. A third copy is about to be added, so extract it first.

Add above `draw()`:

```js
  /* Mix the two accents. t: 0 = ecology green, 1 = sci-fi cyan. */
  function rgbaMix(t, alpha) {
    var r = eco[0] + (scifi[0] - eco[0]) * t;
    var g = eco[1] + (scifi[1] - eco[1]) * t;
    var b = eco[2] + (scifi[2] - eco[2]) * t;
    return 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ',' +
           alpha.toFixed(3) + ')';
  }
```

In `draw()`, replace the connection-colour block. It currently reads:

```js
        var t = (tint[i] + tint[j]) * 0.5;
        var r = eco[0] + (scifi[0] - eco[0]) * t;
        var g = eco[1] + (scifi[1] - eco[1]) * t;
        var b = eco[2] + (scifi[2] - eco[2]) * t;
        ctx.strokeStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) +
                          ',' + (falloff * 0.28).toFixed(3) + ')';
```

with:

```js
        ctx.strokeStyle = rgbaMix((tint[i] + tint[j]) * 0.5, falloff * 0.28);
```

And replace the particle-colour block, which currently reads:

```js
      var tk = tint[k];
      var rr = eco[0] + (scifi[0] - eco[0]) * tk;
      var gg = eco[1] + (scifi[1] - eco[1]) * tk;
      var bb = eco[2] + (scifi[2] - eco[2]) * tk;
      ctx.fillStyle = 'rgba(' + (rr | 0) + ',' + (gg | 0) + ',' + (bb | 0) + ',0.55)';
```

with:

```js
      ctx.fillStyle = rgbaMix(tint[k], 0.55);
```

This is behaviour-preserving: same inputs, same output strings.

- [x] **Step 2: Add the figure module block**

Insert after the `resize()` function and before `/* ---------- Simulation + draw ---------- */`:

```js
  /* ---------- Zodiac figures ---------- */

  var ZODIAC = window.ZODIAC || [];
  var FIG_NARROW = 700;      // px — below this the hero stacks, so recenter

  /* Target rectangle for the figure, plus an opacity multiplier.
     Wide: the open area right of the hero text. Narrow: centered and
     dimmed, because the text column stacks over it. */
  function figureBox() {
    if (w >= FIG_NARROW) {
      return { x: w * 0.58, y: h * 0.18, w: w * 0.36, h: h * 0.64, alpha: 1 };
    }
    return { x: w * 0.10, y: h * 0.15, w: w * 0.80, h: h * 0.70, alpha: 0.5 };
  }

  /* Map a figure's normalized stars into screen coords, preserving its
     aspect and centering it in the box. Writes 2*n floats into `out`. */
  function placeFigure(fig, box, out) {
    var boxAspect = box.w / box.h;
    var fw, fh;
    if (fig.aspect >= boxAspect) { fw = box.w; fh = box.w / fig.aspect; }
    else { fh = box.h; fw = box.h * fig.aspect; }
    var ox = box.x + (box.w - fw) * 0.5;
    var oy = box.y + (box.h - fh) * 0.5;
    for (var i = 0; i < fig.stars.length; i++) {
      out[i * 2] = ox + fig.stars[i][0] * fw;
      out[i * 2 + 1] = oy + fig.stars[i][1] * fh;
    }
  }

  /* Draw authored edges then stars. `coords` is x0,y0,x1,y1,... in screen
     space; it may hold fewer points than fig.stars if recruitment was
     clamped, so edges referencing missing points are skipped. */
  function drawFigure(fig, coords, alpha, n) {
    if (alpha <= 0) return;
    var span = fig.stars.length > 1 ? fig.stars.length - 1 : 1;
    var e, a, b;

    ctx.lineWidth = 1;
    for (e = 0; e < fig.edges.length; e++) {
      a = fig.edges[e][0]; b = fig.edges[e][1];
      if (a >= n || b >= n) continue;
      ctx.strokeStyle = rgbaMix((a + b) / (2 * span), alpha * 0.55);
      ctx.beginPath();
      ctx.moveTo(coords[a * 2], coords[a * 2 + 1]);
      ctx.lineTo(coords[b * 2], coords[b * 2 + 1]);
      ctx.stroke();
    }

    for (e = 0; e < n; e++) {
      ctx.fillStyle = rgbaMix(e / span, alpha * 0.9);
      ctx.beginPath();
      ctx.arc(coords[e * 2], coords[e * 2 + 1], 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
```

Note `drawFigure` takes an explicit `n` (point count) rather than reading `fig.stars.length`, because Task 4 may recruit fewer points than the figure has stars if the particle pool is small. Edges pointing at absent stars are skipped rather than reading `undefined` coordinates, which would produce `NaN` and blank the canvas.

- [x] **Step 3: Draw the static figure**

At the very end of `draw()`, after the existing particle loop, add:

```js
    /* Task 4 replaces this with the phase-driven figure. */
    if (ZODIAC.length) {
      var fig = ZODIAC[0];
      var box = figureBox();
      var n = fig.stars.length;
      if (!staticCoords || staticCoords.length < n * 2) {
        staticCoords = new Float32Array(n * 2);
      }
      placeFigure(fig, box, staticCoords);
      drawFigure(fig, staticCoords, box.alpha, n);
    }
```

and declare the scratch buffer next to the other module state, beside `var count = 0;`:

```js
  var staticCoords = null;
```

The buffer is allocated once and reused, not rebuilt every frame.

- [x] **Step 4: Run `node --check`**

```bash
node --check assets/js/generative.js
```

Expected: no output, exit code 0.

- [x] **Step 5: Verify with a throwaway Node harness**

Build a harness that stubs the browser surface (`document.querySelector` returning a canvas stub whose `getContext('2d')` returns a **recording** context capturing `moveTo`/`lineTo`/`arc`/`stroke`/`fill` calls and `strokeStyle`/`fillStyle` assignments; `getBoundingClientRect`; `matchMedia`; `requestAnimationFrame`; `getComputedStyle`; `IntersectionObserver`; `ResizeObserver`), load `zodiac.js` then `generative.js` into it with `node:vm`, and assert:

- **Wide layout** (`getBoundingClientRect` → 1200×500): every drawn star lies inside the box `x ∈ [696, 1128]`, `y ∈ [90, 410]` — that is `[0.58w, 0.94w] × [0.18h, 0.82h]`. Report the actual min/max x and y of the drawn stars.
- **Aspect is preserved:** with the rat's `aspect: 1.50`, the drawn figure's bounding-box width ÷ height equals `1.50` within `0.02`. This is the check that catches a stretched figure.
- **The figure fits:** its bounding box is no larger than the target box in either dimension.
- **Star count:** exactly 12 `arc` calls attributable to the figure (the rat has 12 stars) beyond the ambient particle arcs — distinguish them by radius, since figure stars use `2.2` and ambient particles use `1.6`.
- **Edge count:** exactly 13 figure `stroke` calls with the figure's line coordinates (the rat has 13 edges).
- **Narrow layout** (`getBoundingClientRect` → 500×400): the figure's bounding box now falls inside `x ∈ [50, 450]`, `y ∈ [60, 340]`, and the alpha multiplier is `0.5` — assert that a figure `fillStyle` string ends in an alpha at or below `0.450` (`0.9 × 0.5`), proving the dimming applied.
- **No `NaN`:** no recorded coordinate or style string contains `NaN`.

Run it, paste the full harness source and complete output into your report, then delete it.

**You cannot verify how it looks** — whether the rat reads as a rat is a human judgement. State that plainly rather than claiming visual verification.

- [x] **Step 6: Commit**

```bash
git add assets/js/generative.js
git commit -m "feat: place and draw zodiac figures on the hero canvas"
```

---
## Task 4: Phase machine, recruitment, and morphing

**Files:**
- Modify: `assets/js/generative.js`

**Interfaces:**
- Consumes: `rgbaMix`, `figureBox`, `placeFigure`, `drawFigure`, `FIG_NARROW` from Task 3; `window.ZODIAC` from Task 2; the existing `step()`, `draw()`, `px`, `py`, `tint`, `count`, `noise2`, `fieldT`.
- Produces, for Task 5:
  - the phase constants `PH_DRIFT = 0`, `PH_GATHER = 1`, `PH_HOLD = 2`, `PH_DISPERSE = 3`
  - `PHASE_MS = [4000, 3000, 6000, 2000]`
  - mutable state `phase`, `phaseT`, `figureIndex`, `figCount`, `assigned`, `assignedMask`, `targets`, `figAlphaMul`
  - `recruit(fig)`, `releaseAll()`, `figureAlpha()`

- [x] **Step 1: Add the phase-machine block**

Insert immediately after the Task 3 figure block, before `/* ---------- Simulation + draw ---------- */`:

```js
  /* ---------- Phase machine ---------- */

  var PH_DRIFT = 0, PH_GATHER = 1, PH_HOLD = 2, PH_DISPERSE = 3;
  var PHASE_MS = [4000, 3000, 6000, 2000];   // ~15s per animal, ~3min per cycle

  var phase = PH_DRIFT;
  var phaseT = 0;
  var figureIndex = 0;
  var figCount = 0;          // recruited points; may be < fig.stars.length
  var assigned = null;       // Int32Array — particle index per star
  var assignedMask = null;   // Uint8Array over particles
  var targets = null;        // Float32Array 2*figCount — screen-space targets
  var startPos = null;       // Float32Array 2*figCount — positions at gather start
  var jitterPhase = null;    // Float32Array figCount — per-star jitter offset
  var figCoords = null;      // Float32Array 2*figCount — scratch for drawing
  var figAlphaMul = 1;       // cached figureBox().alpha, refreshed on recruit/resize
  var jitterT = 0;

  function easeInOut(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function releaseAll() {
    figCount = 0;
    assigned = null;
    assignedMask = null;
  }

  /* Greedily give each star target its nearest free particle. Nearest
     assignment keeps gather paths from crossing, which reads far better than
     random pairing for a few extra lines. Allocates once per figure (every
     ~15s), never per frame. */
  function recruit(fig) {
    var n = Math.min(fig.stars.length, count);
    figCount = n;
    assigned = new Int32Array(n);
    assignedMask = new Uint8Array(count);
    targets = new Float32Array(n * 2);
    startPos = new Float32Array(n * 2);
    jitterPhase = new Float32Array(n);
    figCoords = new Float32Array(n * 2);

    var box = figureBox();
    figAlphaMul = box.alpha;
    placeFigure(fig, box, targets);

    for (var s = 0; s < n; s++) {
      var tx = targets[s * 2], ty = targets[s * 2 + 1];
      var best = -1, bestD = Infinity;
      for (var i = 0; i < count; i++) {
        if (assignedMask[i]) continue;
        var dx = px[i] - tx, dy = py[i] - ty;
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = i; }
      }
      if (best < 0) { figCount = s; break; }   // pool exhausted — clamp
      assignedMask[best] = 1;
      assigned[s] = best;
      startPos[s * 2] = px[best];
      startPos[s * 2 + 1] = py[best];
      jitterPhase[s] = Math.random() * Math.PI * 2;
    }
  }

  function advancePhase(dt) {
    phaseT += dt;
    if (phaseT < PHASE_MS[phase]) return;
    phaseT -= PHASE_MS[phase];
    if (phase === PH_DRIFT) {
      if (!ZODIAC.length) { phaseT = 0; return; }  // no data: drift forever
      phase = PH_GATHER;
      recruit(ZODIAC[figureIndex]);
    } else if (phase === PH_GATHER) {
      phase = PH_HOLD;
    } else if (phase === PH_HOLD) {
      phase = PH_DISPERSE;
    } else {
      phase = PH_DRIFT;
      releaseAll();
      figureIndex = (figureIndex + 1) % ZODIAC.length;
    }
  }

  /* Edge/star opacity: absent while drifting, eases in as the figure
     assembles, full while held, fades out as it disperses. */
  function figureAlpha() {
    if (phase === PH_GATHER) return easeInOut(phaseT / PHASE_MS[PH_GATHER]);
    if (phase === PH_HOLD) return 1;
    if (phase === PH_DISPERSE) return 1 - phaseT / PHASE_MS[PH_DISPERSE];
    return 0;
  }
```

- [x] **Step 2: Rewrite `step()` to drive the phases**

Replace the whole existing `step()` with:

```js
  function step(dt) {
    advancePhase(dt);
    jitterT += dt;
    fieldT += dt * NOISE_DRIFT;
    var d = Math.min(dt, 50) * SPEED * 0.06;
    var s, i;

    if (figCount && phase === PH_GATHER) {
      var p = easeInOut(phaseT / PHASE_MS[PH_GATHER]);
      for (s = 0; s < figCount; s++) {
        i = assigned[s];
        px[i] = startPos[s * 2] + (targets[s * 2] - startPos[s * 2]) * p;
        py[i] = startPos[s * 2 + 1] + (targets[s * 2 + 1] - startPos[s * 2 + 1]) * p;
      }
    } else if (figCount && phase === PH_HOLD) {
      for (s = 0; s < figCount; s++) {
        i = assigned[s];
        px[i] = targets[s * 2] + Math.sin(jitterT * 0.002 + jitterPhase[s]) * 0.6;
        py[i] = targets[s * 2 + 1] + Math.cos(jitterT * 0.0017 + jitterPhase[s]) * 0.6;
      }
    }

    /* Everything not currently pinned follows the flow field. Recruited
       particles are pinned only during GATHER and HOLD — during DISPERSE they
       rejoin the field, which is what makes the figure dissolve rather than
       blink out. */
    var pinned = (phase === PH_GATHER || phase === PH_HOLD);
    for (i = 0; i < count; i++) {
      if (pinned && assignedMask && assignedMask[i]) continue;
      var angle = noise2(px[i] * NOISE_SCALE + fieldT,
                         py[i] * NOISE_SCALE - fieldT) * Math.PI * 4;
      var nx = px[i] + Math.cos(angle) * d;
      var ny = py[i] + Math.sin(angle) * d;
      if (nx < -10) nx = w + 10; else if (nx > w + 10) nx = -10;
      if (ny < -10) ny = h + 10; else if (ny > h + 10) ny = -10;
      px[i] = nx; py[i] = ny;
    }
  }
```

- [x] **Step 3: Make the ambient layer skip recruited particles**

Recruited particles are drawn by `drawFigure` at radius `2.2`. Without these skips they would *also* be drawn as ambient dots at `1.6` and linked by proximity, producing a muddle of accidental lines across the deliberate figure.

In `draw()`, in the connection loop, add a guard at the top of each loop body:

```js
    for (var i = 0; i < count; i++) {
      if (assignedMask && assignedMask[i]) continue;
      for (var j = i + 1; j < count; j++) {
        if (assignedMask && assignedMask[j]) continue;
```

and in the particle loop:

```js
    for (var k = 0; k < count; k++) {
      if (assignedMask && assignedMask[k]) continue;
```

- [x] **Step 4: Replace the static figure block with the phase-driven one**

Delete the Task 3 block at the end of `draw()` (the one beginning `/* Task 4 replaces this with the phase-driven figure. */`) and the `var staticCoords = null;` declaration. In its place, at the end of `draw()`:

```js
    if (figCount) {
      var fig = ZODIAC[figureIndex];
      for (var s = 0; s < figCount; s++) {
        var fi = assigned[s];
        figCoords[s * 2] = px[fi];
        figCoords[s * 2 + 1] = py[fi];
      }
      drawFigure(fig, figCoords, figureAlpha() * figAlphaMul, figCount);
    }
```

The figure is drawn from the recruited particles' **current** positions, not from `targets` — that is what makes it visibly assemble during gather and dissolve during disperse.

- [x] **Step 5: Run `node --check`**

```bash
node --check assets/js/generative.js
```

Expected: no output, exit code 0.

- [x] **Step 6: Verify with a throwaway Node harness**

Build a Node harness (Node v24, pure Node, no installs; `node:vm` works well) stubbing the browser surface this file uses:

- `document.querySelector` returning a canvas stub whose `getContext('2d')` returns a **recording** context — capture `clearRect`/`beginPath`/`moveTo`/`lineTo`/`stroke`/`arc`/`fill`/`setTransform` calls with their arguments, and `strokeStyle`/`fillStyle`/`lineWidth` assignments (use accessor properties so every assignment is recorded, not just the last)
- `canvas.getBoundingClientRect` returning a controllable size — start at 1200×500
- `window.matchMedia` returning a controllable object with `matches` and `addEventListener`, reporting reduced motion **off** for this task
- `requestAnimationFrame` / `cancelAnimationFrame` you drive **by hand with explicit timestamps**, never by wall clock, plus a counter of total rAF calls that `cancelAnimationFrame` does not decrement
- `performance.now`, `document.hidden`, `document.addEventListener`
- `getComputedStyle` returning controllable `--eco` / `--scifi` values
- controllable `IntersectionObserver` and `ResizeObserver` stubs, both present on `window` so the feature detections take the modern path

Load `zodiac.js` then `generative.js` into that context, drive frames with explicit timestamps, and assert:

- **Phase sequence and timing.** Starting in `DRIFT`, advancing 4000ms enters `GATHER`; +3000ms enters `HOLD`; +6000ms enters `DISPERSE`; +2000ms returns to `DRIFT` with `figureIndex` incremented to 1. Assert the phase after each boundary, not just at the end.
- **Recruitment is sound.** After entering `GATHER`, `figCount === 12` for the rat, every entry of `assigned` is a distinct particle index in `[0, count)`, and `assignedMask` has exactly `figCount` bits set.
- **Gather endpoints.** Immediately after `GATHER` begins, each recruited particle sits within `0.01px` of its `startPos`. At the end of `GATHER`, each sits within `0.5px` of its `targets` entry. This is the check that catches a broken easing or a swapped index.
- **Hold pins the figure.** Throughout `HOLD`, every recruited particle stays within `0.9px` of its target (the jitter amplitude is 0.6 on each axis).
- **Disperse releases.** During `DISPERSE`, drive several frames and assert at least one recruited particle has moved more than `1.5px` from its target — proving they rejoined the flow field rather than staying pinned.
- **Alpha ramp.** `figureAlpha()` is `0` in `DRIFT`, strictly increasing across `GATHER`, exactly `1` in `HOLD`, and strictly decreasing across `DISPERSE`.
- **Ambient layer excludes recruited particles.** During `HOLD`, count `arc` calls with radius `1.6` — it must equal `count - figCount`, not `count`. Separately assert no proximity `stroke` call uses the coordinates of a recruited particle.
- **Figure draws at the right size.** During `HOLD`, exactly 12 `arc` calls at radius `2.2` and exactly 13 figure `stroke` calls (the rat's star and edge counts).
- **Full cycle wraps.** Drive twelve complete animal cycles (~180s of simulated time) and assert `figureIndex` returns to `0` and that no phase transition threw.
- **Graceful degradation.** In a second run where `window.ZODIAC` is set to `[]` before loading `generative.js`, assert the script stays in `DRIFT` forever, never calls `recruit`, and still draws ambient particles — proving a missing data file downgrades to the old behaviour instead of throwing.
- **No `NaN`** in any recorded coordinate or style string across every run.

Run it, paste the full harness source and complete output into your report, then delete it.

**Not verifiable here:** whether the morph looks good, whether 6s is long enough to read a figure, and whether the animals are recognizable. Say so plainly.

- [x] **Step 7: Commit**

```bash
git add assets/js/generative.js
git commit -m "feat: cycle the hero canvas through zodiac constellations"
```

---
## Task 5: Resize, reduced motion, and the regression pass

**Files:**
- Modify: `assets/js/generative.js`

**Interfaces:**
- Consumes: everything from Tasks 2–4.
- Produces: `prepareStaticFigure()` and `afterResize()`. Nothing later depends on them; this is the final task.

This task closes the two behaviours the spec calls out explicitly — what happens on resize mid-figure, and what reduced-motion users see — then re-runs the whole project's regression checks.

- [x] **Step 1: Add the static-figure helper**

Insert immediately after `figureAlpha()`:

```js
  /* Assemble figure 0 and snap its particles onto their targets, so the single
     reduced-motion frame shows a finished constellation rather than a random
     scatter. Deterministic: always figure 0, never random. */
  function prepareStaticFigure() {
    if (!ZODIAC.length) return;
    figureIndex = 0;
    recruit(ZODIAC[0]);
    for (var s = 0; s < figCount; s++) {
      var i = assigned[s];
      px[i] = targets[s * 2];
      py[i] = targets[s * 2 + 1];
    }
    phase = PH_HOLD;
    phaseT = 0;
  }
```

- [x] **Step 2: Teach `resize()` about the figure**

The existing `resize()` already distinguishes a drastic change (>25% in either dimension) from a minor one. Replace its final `if (drastic) seed();` with:

```js
    if (drastic) {
      seed();
      releaseAll();
      phase = PH_DRIFT;
      phaseT = 0;
    } else if (figCount) {
      var box = figureBox();
      figAlphaMul = box.alpha;
      placeFigure(ZODIAC[figureIndex], box, targets);
      if (phase === PH_HOLD) {
        for (var s = 0; s < figCount; s++) {
          var i = assigned[s];
          px[i] = targets[s * 2];
          py[i] = targets[s * 2 + 1];
        }
      }
    }
```

Rationale, so this is not "simplified" later: a drastic resize has already scattered the particles via `seed()`, so easing them toward stale targets would look wrong — restarting the cycle is correct. A minor resize keeps the figure and re-derives its targets, so a figure mid-gather keeps assembling in its new, correctly-placed position instead of snapping or drifting outside the box. Crossing the `FIG_NARROW` threshold is handled by both paths, since `figureBox()` is re-evaluated.

If recruitment was ever clamped below `fig.stars.length`, `placeFigure` writes past the end of `targets`. Typed-array out-of-bounds writes are silently discarded in JavaScript, so this is safe — no crash, no corruption.

- [x] **Step 3: Wire reduced motion to the static figure**

Replace the existing reduced-motion branch in the wiring section:

```js
  if (reduceMotion.matches) {
    draw();  // one static frame, no loop
  } else {
    sync();
  }
```

with:

```js
  if (reduceMotion.matches) {
    prepareStaticFigure();
    draw();  // one static frame, no loop
  } else {
    sync();
  }
```

- [x] **Step 4: Keep the figure through resizes and motion toggles**

Add a shared resize handler beside the observer wiring:

```js
  function afterResize() {
    resize();
    if (reduceMotion.matches) prepareStaticFigure();
    if (!running) draw();
  }
```

Use it in both the `ResizeObserver` path and the `window.addEventListener('resize', …)` fallback, replacing the inline `resize(); if (!running) draw();` bodies in each:

```js
  if ('ResizeObserver' in window) {
    new ResizeObserver(afterResize).observe(canvas);
  } else {
    window.addEventListener('resize', afterResize);
  }
```

Without the `prepareStaticFigure()` call here, a drastic resize under reduced motion would release the figure and repaint an empty scatter — the one state a reduced-motion user can reach and never recover from, since no loop runs to rebuild it.

Then update the motion-toggle handler:

```js
  var onMotionChange = function () {
    if (reduceMotion.matches) {
      stop();
      prepareStaticFigure();
      draw();
    } else {
      releaseAll();
      phase = PH_DRIFT;
      phaseT = 0;
      sync();
    }
  };
```

Turning reduced motion **off** must release the pinned static figure and reset the cycle, or the first frames would show a frozen figure while the rest of the field moves.

- [x] **Step 5: Run `node --check`**

```bash
node --check assets/js/generative.js
```

Expected: no output, exit code 0.

- [x] **Step 6: Verify behaviour with a throwaway Node harness**

Build a Node harness (Node v24, pure Node, no installs; `node:vm` works well) stubbing the browser surface this file uses:

- `document.querySelector` returning a canvas stub whose `getContext('2d')` returns a **recording** context — capture `clearRect`/`beginPath`/`moveTo`/`lineTo`/`stroke`/`arc`/`fill`/`setTransform` calls with their arguments, and `strokeStyle`/`fillStyle`/`lineWidth` assignments (use accessor properties so every assignment is recorded)
- `canvas.getBoundingClientRect` returning a **controllable** size, so you can simulate resizes
- `window.matchMedia` returning a controllable object with `matches` and `addEventListener`, so you can flip reduced motion at runtime **and** fire its change listener
- `requestAnimationFrame` / `cancelAnimationFrame` driven **by hand with explicit timestamps**, plus a counter of total rAF calls that `cancelAnimationFrame` does **not** decrement — the zero-calls assertion below depends on that counter, not on queue length
- `performance.now`, a settable `document.hidden`, and `document.addEventListener` with a way to dispatch `visibilitychange`
- `getComputedStyle` returning controllable `--eco` / `--scifi` values
- controllable `IntersectionObserver` and `ResizeObserver` stubs on `window`, exposing a way to fire their callbacks

Load `zodiac.js` then `generative.js` into that context and assert:

- **Reduced motion at load.** With `matchMedia` reporting `matches: true`: `requestAnimationFrame` is called **exactly zero times** — assert on a call *counter*, not on queue length, since a cancelled call would leave an empty queue and pass a weaker check. Exactly one `draw()` occurs, and it renders a complete figure: 12 `arc` calls at radius `2.2` and 13 figure `stroke` calls.
- **Reduced motion + drastic resize.** After a drastic resize (1200×500 → 400×300), the redrawn frame still contains a complete figure — 12 stars at radius `2.2` — and `requestAnimationFrame` is still at zero calls. This is the regression the `afterResize` change exists to prevent.
- **Minor resize mid-hold.** With motion on, advance into `HOLD`, then resize by less than 25% (1200×500 → 1300×520). Assert every recruited particle now sits within `0.9px` of its **recomputed** target, and that `figureIndex` and `phase` are unchanged.
- **Drastic resize mid-hold.** From `HOLD`, resize 1200×500 → 400×300. Assert `phase === PH_DRIFT`, `figCount === 0`, and `phaseT === 0`.
- **Threshold crossing.** Resize from 1200×500 (wide) to 600×400 (narrow) and assert the figure's alpha multiplier becomes `0.5` and the target box recenters — the drawn figure's bounding box falls inside `x ∈ [60, 540]`.
- **Motion toggle, both directions.** Load with reduced motion **on**, confirm zero rAF calls and a complete static figure; toggle it **off** and confirm the loop starts, `phase === PH_DRIFT`, and `figCount === 0`; toggle back **on** and confirm the loop stops and a complete figure is redrawn.
- **Pause paths still work.** With motion on, fire the `IntersectionObserver` callback with `isIntersecting: false` and assert rAF scheduling stops; set `document.hidden = true`, dispatch `visibilitychange`, and assert the same. Both must still function — they were fixed in the previous project and must not regress.

Run it, paste the full harness source and complete output into your report, then delete it.

- [x] **Step 7: Re-run the project-wide regression checks**

The canvas work touched a shared file and the CSS work touched three. Confirm nothing else broke. Write one throwaway script that asserts, across the whole repository:

- **Every `var(--…)` in all four CSS files resolves** to a property defined in `tokens.css` or `themes.css`.
- **Every class token used in all seven HTML files exists** as a selector in `components.css` or `base.css`, matched word-boundary-safely (`\.<token>(?![\w-])`, so `card` cannot spuriously match `.card-grid`).
- **Every internal link across all seven HTML files resolves**, each resolved relative to **its own file's directory** — `content/posts/hello-world.html` uses `../../` prefixes and must be resolved from `content/posts/`, not the repository root.
- **Every asset `href`/`src` in all seven files resolves** on disk, again per-file.
- **`zodiac.js` and `generative.js` appear only in `index.html`**, and `theme.js` is still blocking in `<head>` on all seven with `layout.js` deferred on all seven.
- **No mojibake** anywhere in the four CSS files, three JS files, or seven HTML files.

Run it and report the results per category.

- [x] **Step 8: Re-validate all seven pages against the W3C**

The HTML changed only in `index.html` (one script tag), but the success criteria require all seven to stay clean. Java is not installed, so use the W3C Nu validator's HTTP API:

```bash
curl -sS -H "Content-Type: text/html; charset=utf-8" \
     --data-binary @FILE \
     "https://validator.w3.org/nu/?out=json"
```

Validate `index.html`, `research.html`, `projects.html`, `writing.html`, `cv.html`, `contact.html`, and `content/posts/hello-world.html`. **Sleep at least 1 second between requests** — this is a free public service and hammering it is abusive. Write the raw JSON responses outside the repository.

The bar is **zero `type: "error"` entries per file**. Report per-file error and warning counts plus the full text of any message. Distinguish "the validator returned an empty `messages` array" from "the request returned nothing" — a silently failed `curl` parsed as no-messages would look identical to a pass.

- [x] **Step 9: Commit**

```bash
git add assets/js/generative.js
git commit -m "feat: static zodiac frame for reduced motion, resize handling"
```

---

## Notes and known trade-offs

Recorded so the implementer does not rediscover them mid-task:

- **The quadrupeds share a skeleton.** Ox, tiger, horse, goat, dog, and pig use the same topology — spine, four legs, head, tail — differentiated by `aspect`, ear and tail placement, and horns or snout. This is deliberate and matches how real constellations work: schematic, not illustrative. Do not add stars to make them more distinct; the 14-star ceiling exists because more reads as noise at hero scale.
- **`recruit()` allocates.** Six typed arrays per figure, once every ~15 seconds. That is not per-frame allocation and is not worth pooling. The per-frame path allocates only the `rgba()` strings already documented in the file.
- **Recruitment is O(stars × particles)** — about 12 × 120 = 1,440 distance comparisons, once per figure, not per frame. Negligible. Do not add spatial indexing.
- **The figure is drawn from live particle positions, not from `targets`.** That is what makes it assemble and dissolve. A "simplification" that draws from `targets` directly would make the figure snap into existence and blink out.
- **Recruited particles are excluded from the ambient layer** in both the proximity loop and the dot loop. Without those guards they get drawn twice and cross-linked, which looks like a bug even though nothing errored.
- **`figAlphaMul` is cached, not computed per frame.** `figureBox()` returns a fresh object; calling it inside `draw()` would allocate one per frame for no reason. It is refreshed in `recruit()` and in `resize()`.
- **No animal names, anywhere.** Not on the canvas, not in the DOM, not in an `aria-label`. The canvas is `aria-hidden` and decorative; naming the figures would make it informational and require different semantics. `name` in the data exists for diagnostics only.
- **The reduced-motion frame is deterministic** — always figure 0, the rat. Randomizing it would make the one frame a reduced-motion user sees vary between loads for no benefit.

