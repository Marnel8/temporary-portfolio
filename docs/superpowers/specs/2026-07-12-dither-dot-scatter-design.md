# Dither-Dot Scatter/Assemble — Design

**Date:** 2026-07-12
**Status:** Approved
**Builds on:** `2026-07-06-slide-deck-transitions-design.md` (deck engine, glyph scatter language)

## Goal

During desktop slide-deck transitions, the `DitherPortrait` images (hero and about) participate in the scatter language: the outgoing portrait's dither dots fly outward and fade as the slide exits; the incoming portrait's dots fly in from scatter and assemble, in the same timing windows as the text glyphs. Each portrait animates its own dots independently (no cross-slide morph). Scroll mode, mobile, and reduced-motion behavior are unchanged.

## Why not DOM glyphs or self-driven rAF

- Converting dots to DOM spans (glyph pipeline reuse) would create thousands of elements per portrait — rejected for DOM bloat.
- Event-triggered self-contained rAF animation decouples timing from the GSAP timeline and hand-rolls easing — rejected.
- Chosen: canvas particle redraw driven by the deck's existing GSAP timeline tweening a plain JS proxy. Exact sync, no transform tweens on possibly-hidden elements (so the GSAP display:none reparent bug fixed in `07d5fd8` cannot recur).

## Component changes

### `src/components/boot/dither-portrait.tsx`

- After the dither paint, store per-canvas state in a module-level `WeakMap<HTMLCanvasElement, State>`:
  - `cells`: packed lit-cell coordinates (canvas pixels)
  - `dot`, `color`: paint parameters
  - `vec`: per-dot random flight vectors (Float32Array, canvas pixels)
- Stamp `data-dither` on the canvas so the deck can discover it.
- New export:

```ts
export function getDitherHandle(canvas: HTMLCanvasElement):
	| { reseed(): void; draw(progress: number): void }
	| null;
```

- `draw(p)`: clear canvas; for each dot paint `fillRect(x + p·vx, y + p·vy)` with `globalAlpha = 1 − p`. `draw(0)` reproduces the intact portrait exactly; `draw(1)` is fully dispersed and invisible.
- `reseed()`: regenerate `vec` with uniform random vectors in `±0.6 × canvas.width` horizontally and `±0.5 × canvas.height` vertically — every transition scatters differently.
- Returns `null` until the image has decoded and painted (deck skips gracefully; the canvas is empty at that point anyway).
- The element-level CSS `opacity` prop (hero uses 0.32) is untouched; fading happens inside the bitmap.
- Re-running the paint effect (prop change) rebuilds the WeakMap state.

### `src/components/boot/slide-deck.tsx`

In `goTo`, alongside the glyph work:

- `outDither` / `innDither` = handles for `canvas[data-dither]` inside the outgoing/incoming slides (drop nulls).
- Outgoing: `reseed()` then tween proxy `{ p: 0 → 1 }`, duration 0.5, `power2.in`, position 0, `onUpdate → draw(p)`.
- Midpoint callback (0.45), inside the existing swap:
  - incoming handles: `reseed()` + `draw(1)` **before** the display flip — the assembled portrait never flashes;
  - outgoing handles: `draw(0)` after the slide hides — restored intact for its next entrance.
- Incoming: tween proxy `{ p: 1 → 0 }`, duration 0.55, `power3.out`, position 0.5 (same window/easing as glyph assembly).
- All proxy tweens are on plain objects; no element transforms are introduced.

### `src/app/page.tsx`

- Remove `deck-block` from both `DitherPortrait` classNames (hero line ~148, about line ~219) so the portraits no longer double-animate with the whole-canvas block fade. `reveal` on the about portrait stays (scroll-mode ScrollTrigger only). Drum and footer-wire canvases keep `.deck-block` behavior.

## Non-goals

- No cross-slide dot morphing.
- No per-dot stagger/rotation — random flight vectors already stagger the read; dither squares are axis-aligned.
- No changes to scroll mode, mobile, reduced-motion, boot gate, or rain.

## Performance

Hero is 120 cols, about 96 cols (rows follow each image's aspect ratio); lit dots per portrait land in the low thousands. One `fillRect` per dot per frame on a small canvas (≤ ~720 px wide backing store), only during the ~1.05 s transition. Well within frame budget; no offscreen buffers needed.

## Accessibility

Canvas keeps its existing `role="img"` / `aria-label`. No DOM structure changes.

## Testing

Extend the existing Playwright desktop drive (1440×900, boot gate skipped):

1. Settled on hero: capture `canvas[data-dither]` `toDataURL()` → `before`.
2. Start hero → about, sample mid-scatter (~0.25 s): `toDataURL()` must differ from `before`.
3. Navigate away and back to hero, settled: `toDataURL()` must equal `before` (intact restoration).
4. Existing checks (glyph scatter, text integrity, mobile/reduced-motion/blog suites) must stay green.
