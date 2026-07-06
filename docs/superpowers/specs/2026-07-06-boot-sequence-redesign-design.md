# Boot Sequence Redesign — Design Spec

**Date:** 2026-07-06
**Branch:** `feat/portfolio-fighter-arcade`
**Status:** Approved by Marnel (accent, arcade removal, and checkpoint strategy confirmed)

## Summary

Redesign the portfolio around a "Boot Sequence" terminal / hacker-OS concept: the
site boots like a monochrome phosphor CRT system. This finishes a migration a
previous session started — `src/components/boot/` already contains 11 complete,
commented components that were never wired in. This spec covers the remaining
work: theme layer, app shell, home page rewrite, footer scene, blog restyle,
and removal of the superseded arcade/Signal designs.

## Decisions (locked)

1. **Checkpoint commit first.** The uncommitted Signal/Perimeter redesign
   (~2,400 lines) is committed as-is before any Boot Sequence work, so it stays
   recoverable in git history.
2. **Boot replaces arcade + preloader.** `ArcadeRoot`, `Preloader`, `Cursor`,
   `Hud` (old), and `Background` leave the layout. After the checkpoint commit,
   the now-unused `src/components/arcade/`, `src/components/experience/`,
   `src/components/signal/`, and `src/components/three/` directories are
   deleted from the tree (recoverable from history).
3. **Accent: phosphor green.** `phos` = `#00FF6A` on `boot` = `#010603`
   near-black. Single accent at varying opacity; no second color.

## Non-negotiable ground rules (from Marnel)

- All copy comes from `src/data/resume.tsx`. Never invent or delete content.
- Site stays functional at every step (each commit builds and renders).
- New code is commented for maintainability.
- Portrait cutouts render grayscale/dithered and free-floating — no panels,
  borders, or visible wrappers.
- Tone: technically credible to SWE/data/security recruiters, not flashy.

## Architecture

### Reused as-is: the prebuilt `src/components/boot/` kit

| Component | Role |
|---|---|
| `boot-gate.tsx` | Full-screen typed BIOS boot on first home load per tab session; click/Enter/Esc skips; fires `bootdone` + stamps `html[data-booted]` |
| `hud-frame.tsx` | Fixed viewport chrome: octagonal cut-corner frame, PixelMark (top-left → home), live clock (top-center), FX toggle (top-right), status text (bottom corners), CRT overlay divs |
| `fx-context.tsx` | One switch for all CRT effects; localStorage `boot.fx`; defaults OFF under `prefers-reduced-motion`; mirrors to `html[data-fx]` |
| `clock.tsx` | Hydration-safe HH:MM:SS |
| `pixel-mark.tsx` | 11×5 pixel-grid "MV" SVG logomark, sized via prop |
| `scramble-cycle.tsx` | Corner labels that glitch-cycle through word sets |
| `typed-log.tsx` | In-view-triggered typed terminal output block with caret |
| `dither-portrait.tsx` | Bayer ordered-dither canvas render of a photo in phosphor green |
| `rain-overlay.tsx` | Fixed canvas; `triggerRain()` plays a ~0.95s digital-rain burst, rate-limited 3s, inert when FX off |
| `project-drum.tsx` | R3F rotating drum of wireframe project panels (canvas-texture text), drag + prev/next buttons, wireframe torus/icosahedron/particles inside |
| `smooth-scroll.tsx` | Lenis driven by GSAP ticker (ScrollTrigger-synced) |

### New build (the only new component)

- `src/components/boot/footer-wire.tsx` — small R3F canvas: slowly rotating
  wireframe icosphere + sparse particle field. Quiet; `frameloop` tuned so it
  costs nothing when offscreen.

### Theme layer

`globals.css` + `tailwind.config.ts` (Tailwind v3 — tokens go in
`theme.extend.colors`):

- Colors: `phos: #00FF6A`, `boot: #010603`.
- `.phos-glow` — soft green text-shadow.
- `.term-caret` — blinking block cursor (used by `typed-log`).
- `.crt-scanlines`, `.crt-vignette` — repeating hairline gradient + radial edge
  falloff; visible only under `html[data-fx="on"]`; plus a very slow flicker
  animation on the scanline layer.
- Remove: Signal/Perimeter tokens, arcade CSS, old grain/preloader styles.

### Typography

- Hero display: **Archivo Black** via `next/font`, mapped to the existing
  `--font-display` variable. Solid fills only (Sora + `-webkit-text-stroke`
  artifact lesson applies to outline text generally).
- Everything else: **JetBrains Mono** (kept, `--font-mono`).
- Inter stays loaded as `--font-sans` for blog body copy readability.

### App shell (`layout.tsx`)

```
<html class="dark" …fonts>
  <body class="bg-boot text-phos …">
    <FxProvider>
      <HudFrame />
      <RainOverlay />
      <SmoothScroll>{children}</SmoothScroll>
    </FxProvider>
  </body>
</html>
```

`BootGate` mounts from `page.tsx` (home only) so `/blog` deep links stay
instant.

## Home page (`page.tsx`)

Five sections; GSAP ScrollTrigger fires `triggerRain()` at section boundaries
(rate-limited by the overlay itself). Hero reveal waits for the `bootdone`
event so gate and hero never overlap.

1. **HERO** — full-viewport. Ghosted `DitherPortrait` (`/photos/hero.png`,
   low opacity) behind "MARNEL VALENTIN" in huge Archivo Black. Four
   `ScrambleCycle` corner labels cycling real roles/interests derived from
   resume data (software engineer / full-stack / MS data science / security).
   `TypedLog` block with real facts (name, degree in progress, focus, location,
   status). Scroll cue bottom-center.
2. **ABOUT** — `DATA.summary` + `DATA.description`; `/photos/about.png` as a
   grayscale/dither free-floating cutout; status chips (MS in progress,
   security focus) in mono.
3. **OPS LOG (experience + education)** — `DATA.work` and `DATA.education`
   rendered as terminal log entries: dates, company/school, role, description.
   No cards; hairline rules and mono type.
4. **PROJECTS** — `ProjectDrum` (reads `DATA.projects` itself) + a plain HTML
   project index below (title, dates, description, tech, links) as SEO/no-WebGL
   fallback.
5. **CONTACT / FOOTER** — large `PixelMark`, name + email CTA
   (`DATA.contact.email`), social links from `DATA.contact.social` as
   outlined-square icons, `FooterWire` scene behind/beside. Quiet.

## Blog

`/blog` and `/blog/[slug]` keep structure; palette swapped to phosphor tokens.
No boot gate, no rain triggers. Prose stays Inter for readability with mono
headings/labels.

## Removals

After the checkpoint commit: delete `src/components/arcade/`,
`src/components/experience/`, `src/components/signal/`,
`src/components/three/`, and any now-orphaned assets/CSS they alone used.
`package.json` deps are left alone this pass (three/GSAP/Lenis all still used;
anything arcade-only can be pruned later if found).

## Accessibility & performance

- `prefers-reduced-motion` → FX default OFF (scanlines, flicker, rain);
  visitors can still opt in via the HUD toggle.
- Boot gate: skippable (click/Enter/Esc), once per tab session, home only.
- Drum: prev/next buttons are the keyboard path; full content also present in
  the HTML index. All resume content server-rendered regardless of WebGL.
- Canvases: dither renders once; rain runs only during bursts; drum is a single
  R3F canvas; footer scene is small.

## Error handling

- `DitherPortrait` leaves the canvas empty if the image fails (already built).
- `ProjectDrum` renders `fallback={null}`; the HTML index below carries the
  content if WebGL is unavailable.
- `BootGate` decides play/skip after mount to avoid hydration mismatch
  (pattern proven in the arcade work).

## Testing / verification

1. `npm run build` green at every commit.
2. Existing vitest suite passes (`npm test`).
3. Browser pass on `/` (boot gate, skip path, second-visit skip, scroll through
   all sections, drum drag + buttons, FX toggle both ways) and `/blog`.
4. `prefers-reduced-motion` emulation: no scanlines/rain by default.

## Implementation order (each step leaves the site working)

1. Checkpoint commit of the entire current working tree (Signal/Perimeter +
   boot kit + photos).
2. Theme layer: tokens + CRT/caret/glow CSS. (Site still renders old design.)
3. Layout swap: fonts + shell components in, arcade/preloader out.
4. `page.tsx` rewrite section by section.
5. `FooterWire` + footer section.
6. Blog restyle.
7. Delete superseded component directories; fix any dangling imports.
8. Verification pass; commit granularly throughout.
