# Zodiac Constellation Hero — Design Spec

**Date:** 2026-08-11
**Status:** Approved (pending implementation)
**Supersedes:** Section 5 ("Generative Canvas Piece") of `2026-08-07-personal-portfolio-design.md`
**Amends:** Section 2 (file structure) and Section 4.2 (typography) of the same

---

## 1. Purpose

Two changes to the shipped prototype, both requested after reviewing the live site:

1. **The hero canvas becomes meaningful.** Today particles drift on a flow field and lines connect any pair that happens to fall within 80px — the figures are accidental. They should instead assemble into the twelve animals of the Chinese zodiac, one at a time, then disperse and reform as the next.
2. **Light-theme headings become cinnabar-burgundy.** The dark theme is unchanged; the site owner approved its current appearance.

The canvas remains decorative. It conveys no information, is hidden from assistive technology, and no part of the site depends on it.

---

## 2. Decisions and rationale

Each of these was chosen deliberately; the rejected alternative is recorded so it is not silently revisited.

| Decision | Chosen | Rejected alternative |
|---|---|---|
| Figure set | The 12 zodiac animals (生肖) | The Four Symbols (Azure Dragon, Vermilion Bird, White Tiger, Black Tortoise) — the actual Chinese sky constellations. More astronomically authentic, less legible as "zodiac", and only four figures. |
| Behavior | Drift → gather → hold → disperse, one animal at a time | A fixed twelve-figure star map (busy behind text); constellations as a faint background layer under the existing pollen (too subtle to notice). |
| Placement | Right ~40% of the hero, clear of the text | Centered with text floating over it (hurts legibility); oversized and bleeding off-edge (unrecognizable). |
| Labels | **None.** No animal name drawn on the canvas | A caption naming each animal. Rejected: it would make the canvas informational, breaking the `aria-hidden` decorative contract. If names are ever wanted they must be real DOM text, not canvas pixels. |
| Heading colour | `#732A26` cinnabar-burgundy, light theme only | Deep cinnabar `#8C2F23` (competes with the ecology green); classic burgundy `#6E1F2B` (nearly reads as neutral). |
| Heading scope | `h1`–`h4` only | Also recolouring `.brand` (doubles as the home link — red would read as a link state) or `.section-label` (deliberately muted). |

**Note on terminology.** The twelve animals are a calendar cycle, not constellations in traditional Chinese astronomy. This design knowingly renders them *as* star figures because that is the requested visual language and it matches the existing dot-and-line vocabulary of the piece. It is an aesthetic conceit, not an astronomical claim.

---

## 3. Architecture

### 3.1 File structure change

```
assets/js/
├── theme.js         (unchanged)
├── layout.js        (unchanged)
├── zodiac.js        NEW — star-figure data only, no logic
└── generative.js    MODIFIED — phase machine + morph, replaces pure drift
```

This amends the original spec's "exactly three files in `assets/js/`". The alternative — embedding twelve figures' worth of coordinate data inside `generative.js` — would push that file past 400 lines and mix data with behavior. A separate data file keeps each unit's responsibility singular and makes the figures editable without touching the animation code.

`zodiac.js` must load **before** `generative.js`. Both are `defer`, and `defer` preserves document order, so listing `zodiac.js` first in `index.html` is sufficient. No other page loads either file.

### 3.2 Star-figure data format

`zodiac.js` assigns exactly one global:

```js
window.ZODIAC = [
  {
    name: 'rat',              // lowercase ASCII; diagnostic only, never rendered
    aspect: 1.30,             // design-space width / height, preserved when scaling
    stars: [[0.10, 0.42], [0.28, 0.20], /* … */],   // normalized to [0,1] on both axes
    edges: [[0, 1], [1, 2], /* … */]                 // index pairs into `stars`
  },
  // … eleven more, in canonical zodiac order
];
```

Constraints on the data, enforced at implementation time:

- Order is the canonical cycle: rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig.
- Each figure has **8–14 stars**. Fewer reads as noise; more is unreadable at hero scale.
- `stars` coordinates are normalized so the bounding box is exactly `[0,1] × [0,1]` — at least one star touches each edge. `aspect` carries the true proportions, so a long snake and a compact rat both scale correctly.
- Every `edges` entry references valid indices, and every star participates in at least one edge. An orphan star reads as a stray dot.
- Figures are connected graphs — one continuous figure, not disjoint fragments.

### 3.3 Phase machine

Four phases cycle continuously. Durations are milliseconds:

| Phase | Duration | Behavior |
|---|---|---|
| `DRIFT` | 4000 | All particles follow the flow field. Proximity links only. Current behavior exactly. |
| `GATHER` | 3000 | Recruited particles ease toward their star targets. Authored edges fade in. |
| `HOLD` | 6000 | Figure complete and still, with sub-pixel jitter. Edges at full opacity. |
| `DISPERSE` | 2000 | Recruited particles released back to the flow field. Edges fade out. |

15 s per animal × 12 animals ≈ **3 minutes** per full cycle before repeating.

**Recruitment.** At `GATHER` start, the figure needs `stars.length` particles. Assign greedily: for each star target in turn, take the nearest not-yet-assigned particle. This minimizes path crossings during the gather and looks markedly better than random assignment for a handful of extra lines of code. Unrecruited particles keep drifting throughout — the canvas never empties.

**Easing.** Cubic ease-in-out on gather position. Linear would look mechanical; the ease is what sells "settling into place".

**Jitter.** During `HOLD`, each recruited particle oscillates within ±0.6px on a per-particle phase offset, so the figure breathes rather than freezing. Below the threshold where edges visibly shift.

**Link rendering.** Proximity links are drawn **only among unrecruited particles**. Recruited particles show authored edges only. During `DRIFT` nothing is recruited, so every particle links by proximity — identical to today. This avoids a visual mess of accidental lines crossing the deliberate figure.

Edge alpha follows phase: `0` in `DRIFT`, eased `0 → 1` across `GATHER`, `1` in `HOLD`, `1 → 0` across `DISPERSE`.

### 3.4 Placement and scale

The figure is fitted into a target box, preserving `aspect`, centered within the box:

- **Wide hero** (canvas width ≥ 700px): box spans `x ∈ [0.58w, 0.94w]`, `y ∈ [0.18h, 0.82h]` — the open area right of the text column.
- **Narrow hero** (< 700px): the page layout stacks, so the box recenters to `x ∈ [0.10w, 0.90w]`, `y ∈ [0.15h, 0.85h]`, and a global figure alpha multiplier of `0.5` applies so text over it stays readable.

### 3.5 Resize behavior

The existing `resize()` distinguishes a drastic change (>25% in either dimension) from a minor one. That distinction now also governs the figure:

- **Drastic resize:** re-seed particles as today, reset the phase machine to `DRIFT` with a fresh phase timer, and clear any recruitment. Restarting the cycle is correct here — the particles have been repositioned anyway, so easing them toward stale targets would look wrong.
- **Minor resize:** keep the phase, the current figure, and the recruitment. Recompute the target box and re-derive each recruited particle's target from the cached figure data. A figure mid-gather continues toward its new, correctly-placed targets rather than snapping or drifting outside the box.

Crossing the 700px wide/narrow threshold counts as a placement change in both cases: the box and the alpha multiplier are recomputed from the new width.

### 3.6 Particle-count guarantee

`targetCount()` returns at least 60 particles and figures use at most 14 stars, so there are always enough to recruit. The implementation should nonetheless clamp recruitment to the available count rather than assuming it — if the floor is ever lowered, an unclamped loop would read past the end of the typed arrays and produce `NaN` positions that silently corrupt the whole canvas.

---

## 4. Accessibility

The existing contract is preserved in full, and one aspect improves.

- The canvas keeps `aria-hidden="true"` and `pointer-events: none`. It conveys nothing; no animal name is rendered.
- **`prefers-reduced-motion: reduce`:** render a **single completed constellation** — figure index 0, deterministically — fully assembled with edges at full opacity, plus static ambient particles. One `draw()` call, and `requestAnimationFrame` is **never called**. This is a genuine improvement: today reduced-motion users see a random scatter; they will now see a finished figure.
- Off-screen pause (IntersectionObserver), hidden-tab pause (`visibilitychange`), and the runtime reduced-motion toggle keep their current wiring, including registering the pause listeners unconditionally.
- Theme change still re-reads `--eco` / `--scifi` and repaints when paused.

Nothing about the page's semantics, focus order, or keyboard behavior changes.

---

## 5. Performance

- Authored edges are a fixed list of ~10–16 per figure — negligible.
- The proximity loop now runs over unrecruited particles only, so it gets *cheaper* during `GATHER`/`HOLD`/`DISPERSE` than it is today.
- Target stays 30fps via the existing accumulator throttle.
- Star targets are computed once per figure at `GATHER` start and cached, not recomputed per frame.
- No new per-frame allocation beyond the `rgba()` strings already documented in `generative.js`.

---

## 6. Heading colour

### 6.1 Token

`tokens.css` gains one raw value:

```css
--c-light-heading: #732A26;
```

`themes.css` maps a new semantic token in all four theme blocks:

- light blocks (`:root`, `:root[data-theme="light"]`): `--heading: var(--c-light-heading);`
- dark blocks (media-guarded, `:root[data-theme="dark"]`): `--heading: var(--c-dark-text);`

Mapping dark to the existing dark text colour keeps the dark theme pixel-identical.

### 6.2 Application

`base.css`: the existing `h1, h2, h3, h4` rule gains `color: var(--heading);`.

This reaches page titles, section headings, card titles, and publication/CV entry titles by inheritance. `.brand`, `.section-label`, nav, body text, and links are untouched.

### 6.3 Print — required, easy to miss

`base.css`'s `@media print` block currently relies on `body { color: #000 }` for text colour. Once headings carry an explicit `color`, they will **override that and print in cinnabar**, which is wrong on paper and wasteful in colour ink — most visibly on the CV.

The print block must therefore add:

```css
h1, h2, h3, h4 { color: #000; }
```

### 6.4 Contrast

`#732A26` measured against both light-theme grounds:

| Pair | Ratio | AA body (4.5:1) | AA large (3:1) |
|---|---|---|---|
| `#732A26` on `--bg` `#FBFAF6` | 9.63:1 | pass | pass |
| `#732A26` on `--surface` `#FFFFFF` | 10.06:1 | pass | pass |

Dark theme is unchanged, so its ratios are unaffected.

---

## 7. Out of scope

- No animal names rendered anywhere — canvas or DOM.
- No interactivity: the canvas remains non-interactive, and hovering or clicking does nothing.
- No change to the other five pages; the canvas is home-only and stays that way.
- No change to the theme system, layout injection, page shells, or any existing page markup beyond what section 6 requires.
- No build step, no dependencies, no library for easing or geometry.
- No change to the dark theme's appearance.

---

## 8. Success criteria

1. `zodiac.js` defines twelve figures in canonical order, each with 8–14 stars, a connected edge graph, no orphan stars, and valid indices.
2. On the home page the figures cycle: drift → gather → hold → disperse, one animal at a time, forming in the right-hand region clear of the hero text.
3. Unrecruited particles continue drifting throughout; the canvas never appears empty or frozen.
4. Under `prefers-reduced-motion: reduce`, exactly one completed constellation renders and `requestAnimationFrame` is never called.
5. Off-screen and hidden-tab pausing still work, and the runtime reduced-motion toggle still flips behavior both directions.
6. Light-theme `h1`–`h4` render `#732A26`; body text and links are unchanged; the dark theme is pixel-identical to before.
7. Printing any page — the CV especially — produces black headings, not cinnabar.
8. All seven pages still pass W3C validation with zero errors.
9. No regression in the existing contracts: every `var()` resolves, every class used exists, every internal link resolves.
