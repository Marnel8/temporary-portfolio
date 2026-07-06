# Slide-Deck Transitions ("Channel Switch") — Design Spec

**Date:** 2026-07-06
**Status:** Approved by Marnel (slide-deck model, desktop-only, design approved)
**Builds on:** `2026-07-06-boot-sequence-redesign-design.md` (the live Boot Sequence page)

## Summary

Replace visible scrolling on the desktop home page with a slide deck: one wheel
flick / swipe / arrow key = one transition. The outgoing slide's words explode
into scattered glyphs, a digital-rain burst covers the midpoint, and the next
slide assembles in. Phones, tablets, and reduced-motion users keep the current
smooth-scroll page unchanged.

## Decisions (locked)

1. **Slide deck, not scroll-driven.** The page never scrolls in deck mode;
   transitions are discrete.
2. **Desktop only.** Deck activates only when `(min-width: 1024px) and
   (pointer: fine)` matches and `prefers-reduced-motion` is NOT `reduce`.
   Everyone else gets today's scrolling page with its existing reveals.
3. **Six slides.** `00 HERO · 01 ABOUT · 02 EXPERIENCE · 03 EDUCATION ·
   04 PROJECTS (drum only) · 05 CONTACT`. Experience and education split
   because the combined ops-log section is taller than one viewport.
4. **Project HTML index stays in the DOM** (SEO + no-WebGL fallback) but is
   hidden in deck mode — the drum shows all projects there.

## Ground rules (inherited)

- Content comes from `src/data/resume.tsx`; this feature moves markup, never
  copy.
- Site stays functional at every commit; mobile path must never regress.
- Comment new code; match the boot kit's comment style and tab indentation.

## Architecture

### Mode gate (hydration-safe)

Server render and first client render are the normal scroll layout — all six
sections in flow, identical to today, full content in the HTML. After mount, a
layout effect evaluates the media queries; if they pass, it stamps
`html[data-deck="on"]` and the deck engine takes over: `overflow: hidden` on
the page, Lenis smooth-scroll disabled for `/` (deck mode and smooth scroll
cannot both own the wheel). This mirrors the arcade lesson: state initializers
stay deterministic; capability detection happens post-hydration. The boot gate
covers the brief takeover moment on first load.

On `resize` crossing the breakpoint, the mode gate re-evaluates (deck ↔ scroll
switch resets to the current slide's scroll position or slide 0 — acceptable;
it is an edge case).

### New unit: `src/components/boot/slide-deck.tsx`

Client component wrapping the six sections. Owns:

- **State machine:** `active` index, `locked` flag during transitions.
- **Input:** GSAP `Observer` (wheel, touch, pointer) + keydown (↑ ↓ PageUp
  PageDown Home End). Inputs while `locked` are dropped; wheel is normalized
  so one flick = one step.
- **Splitter:** `splitChars(el)` / `splitWords(el)` — wraps text nodes in
  `<span>` glyphs, idempotent, lazy (runs the first time a slide transitions).
  The split parent receives `aria-label` with the original text; glyph spans
  are `aria-hidden="true"`.
- **Transition timeline (~1s):**
  1. lock input
  2. outgoing slide: `[data-explode="chars"]` elements scatter per-glyph
     (random ±300–600px x/y, rotation ±120°, opacity→0, stagger ~8ms random);
     `[data-explode="words"]` scatter per-word; `[data-explode="block"]`
     (canvases: dither portrait, drum, footer wire) scale-fade as one block
  3. midpoint: `triggerRain()` (already FX-gated and rate-limited; the deck
     bypasses the 3s rate limit via an explicit `force` option so back-to-back
     slide changes still get their burst)
  4. swap: outgoing `display: none`, incoming `display: flex`
  5. incoming: glyphs assemble inward (reverse scatter), blocks scale in;
     `TypedLog` retypes automatically (its IntersectionObserver can only fire
     once the slide is displayed)
  6. unlock
- **Slide sizing:** in deck mode every slide is `position: fixed, inset: 0`,
  full viewport, content vertically centered; inactive slides `display: none`.
  In scroll mode these styles don't apply (keyed off `html[data-deck]`), so
  the sections flow exactly as today.

### Page changes (`page.tsx`)

Structural only:

- The ops-log section splits into two sections: `#experience` and
  `#education` (same markup, same copy, now siblings). In scroll mode they
  read as two consecutive sections — visually equivalent to today.
- Sections gain `data-slide` and their inner elements gain
  `data-explode="chars|words|block"` markers: headings/labels/chips → chars,
  paragraphs → words, canvases → block.
- The project HTML index gets `data-deck-hide` (CSS: `html[data-deck="on"]
  [data-deck-hide] { display: none }`).
- The `.reveal` / `[data-rain]` ScrollTrigger setup becomes conditional: it is
  created only in scroll mode (mobile/reduced-motion). It cannot merely "not
  fire" in deck mode — `gsap.fromTo` renders the hidden from-state
  immediately, which would leave content invisible when no scroll ever
  triggers it. The deck's assemble timelines own all entrances in deck mode.
  The hero `bootdone` intro is unchanged (runs in both modes).

### HUD additions (`hud-frame.tsx`)

- Right edge, vertically centered: a column of small clickable mono dots
  (`■`/`·`), one per slide, current highlighted — jump navigation.
- Bottom-left status text swaps `SYS.READY` → `SLIDE 0N / 06` in deck mode.
- Both render only under `html[data-deck="on"]` (CSS-gated, no re-render), with
  a tiny custom event (`deckchange`, carrying the active index) keeping the
  dots/counter in sync with the deck.

## Interaction details

- Drum drag still works: it uses pointer-drag on its canvas, never wheel;
  Observer ignores pointer-drag that starts on the drum canvas
  (`closest("canvas")` check) so a horizontal drum drag can't be read as a
  swipe.
- Anchor navigation (`#projects` links, HUD logomark) maps to `goTo(slide)` in
  deck mode.
- Focus: after a transition, the incoming section receives focus
  (`tabindex="-1"`) so keyboard users aren't stranded.

## Accessibility & performance

- Reduced-motion → never enters deck mode (unchanged page).
- Split text keeps `aria-label` on the parent; glyphs `aria-hidden`.
- Splitting is lazy per slide; glyph spans persist and are reused (transform
  reset before each assemble). `will-change: transform` only during timelines.
- Word-split for paragraphs (~90 words max per slide), char-split only for
  short display strings — span counts stay in the low hundreds.

## Failure modes

- If GSAP Observer fails to load or media queries never match → page simply
  stays in scroll mode (deck is purely additive).
- Rapid inputs during a transition are dropped, not queued — no skipping.

## Verification

Playwright, desktop viewport (1440×900):
1. Wheel down once → exactly one slide advances; glyph spans exist and move
   mid-transition; `document.body` scroll position stays 0.
2. Wheel spam during a transition → still lands on the very next slide.
3. Arrow keys, End/Home navigate; dots jump to a chosen slide.
4. Drum drag inside slide 04 rotates the drum without changing slides.
5. TypedLog retypes when re-entering a slide.
Mobile viewport (390×844) and reduced-motion context: page scrolls natively,
all sections and the project index visible, no deck attributes present.
Blog routes untouched.

## Implementation order

1. `slide-deck.tsx` engine (mode gate, slides fixed/stacked, input, plain
   crossfade transition) — page structurally wrapped, mobile untouched.
2. Split ops-log into experience/education sections.
3. Scatter/assemble timelines + explode markers + rain midpoint.
4. HUD dots + slide counter + focus management.
5. Verification pass (Playwright script as above).
