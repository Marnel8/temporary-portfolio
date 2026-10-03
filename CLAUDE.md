# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install --legacy-peer-deps   # flag required: @radix-ui/react-icons pins react ≤18, project is on React 19
npm run dev                      # next dev
npm run build                    # next build
npm run test                     # vitest run (jsdom, globals on, "@" alias → src)
npx vitest run src/components/boot/pixel-mark.test.tsx   # single test file
npx tsc --noEmit                 # typecheck (clean at time of writing)
```

- `npm run lint` is **broken**: ESLint 9 with a legacy `.eslintrc.json` and no flat config, so it errors out immediately. Pre-existing; use `tsc --noEmit` as the static check.
- The Vitest suite is a single file (`pixel-mark.test.tsx`). Deleting it makes `vitest run` fail with "no test files".
- `/_vercel/insights/script.js` 404s in the console off-Vercel — expected.

## What this is

Marnel Valentin's personal portfolio (Next.js App Router, React 19, Tailwind 3, GSAP, Lenis), deployed on Vercel. Originally MagicUI's portfolio template; the live design is "Boot Sequence", a phosphor-green terminal/CRT theme. Specs and plans for each design pass live in `docs/superpowers/{specs,plans}/`.

**Content rule:** all copy lives in `src/data/resume.tsx` (`DATA`). Never invent or delete content; `page.tsx` is layout and motion only. Home-page boot-log lines and corner labels in `page.tsx` must stay factual (derived from `DATA`).

## Architecture

**Routes:** `/` (`src/app/page.tsx`, one client component) and `/blog`, `/blog/[slug]` (server components reading `content/*.mdx` via `src/data/blog.ts`: gray-matter → unified/remark/rehype → rehype-pretty-code). Blog is the only place Inter prose is used; everything else is JetBrains Mono, with Archivo Black for the hero display face.

**Theme:** palette tokens in `tailwind.config.ts` (`phos #00FF6A`, `pale #C8FFDD`, `boot #010603`). `<html>` is hard-set to `dark`, and the `.dark` CSS vars in `globals.css` mirror the palette so shadcn/blog styles follow automatically. Font CSS variable names (`--font-display/--font-sans/--font-mono`) are inherited from a previous design — keep them.

**Chrome in `layout.tsx`** (every route): `FxProvider` → `HudFrame`, `RainOverlay`, `SmoothScroll` (Lenis).

**All page components live in `src/components/boot/`.** Cross-component behavior is wired through `<html>` data attributes and window events rather than props, so look for these when something "happens elsewhere":

| Signal | Set/fired by | Consumed by |
|---|---|---|
| `html[data-fx="on\|off"]` | `fx-context.tsx` (persisted in `localStorage boot.fx`; defaults OFF under prefers-reduced-motion) | CSS for scanlines/flicker/vignette, rain overlay |
| `html[data-booted]` + `bootdone` window event | `boot-gate.tsx` (home-only, once per tab via `sessionStorage boot.seen`) | hero intro in `page.tsx` waits on it |
| `html[data-deck="on"]` + `deckmode` window event | `slide-deck.tsx` after mount | CSS stacks slides fullscreen; `smooth-scroll.tsx` pauses Lenis |
| `[data-slide]`, `[data-rain]`, `.reveal`, `[data-explode="chars\|words\|block"]`, `.deck-block` | markup in `page.tsx` | slide deck / ScrollTrigger / rain overlay |
| `canvas[data-dither]` + `getDitherHandle(canvas)` | `dither-portrait.tsx` | slide deck scatter transitions |

**Two home-page modes (the main thing to understand):**
- *Deck* (desktop: ≥1024px + fine pointer + no reduced-motion, checked by `deckEligible()` after mount): the sections are a 6-slide deck; wheel/keys/dots trigger glyph-scatter transitions in `slide-deck.tsx`. SSR/first paint is always the scroll layout.
- *Scroll* (mobile / reduced-motion): normal scrolling with ScrollTrigger `.reveal` fades and `[data-rain]` bursts. These ScrollTriggers are created **only when `deckEligible()` is false** — otherwise `fromTo` would leave everything invisible with no scroll to reveal it.

## Gotchas

- **GSAP + `display:none` slides:** initializing transform tweens on elements inside a hidden slide makes GSAP reparent them to `<html>` and silently drops whitespace text nodes between glyph spans. In the deck, apply scatter state in the midpoint callback *after* the slide is visible, and assemble with lazy `to()` tweens — never `fromTo` (its `immediateRender` inits while hidden).
- **GSAP empty NodeLists:** GSAP throws on an empty NodeList nested inside a target array. Use flat `Array.from(...)` element arrays and guard timeline inserts with explicit absolute positions.
- **GSAP Observer:** `wheelSpeed: -1` fires `onUp` for wheel-*down*.
- **Dither portraits** scatter by repainting the canvas (`handle.draw(p)`, 0 = intact, 1 = dispersed) driven by a plain `{p}` proxy tween — never element transforms. Call `reseed()` before any scattered draw. Portrait canvases must **not** carry `.deck-block` (would double-animate); the project drum and footer-wire canvases do. `getDitherHandle` returns `null` until the image decodes.
- **`-webkit-text-stroke` on Archivo/Sora** renders overlapping-contour artifacts — use solid fills for outline-look headings.
- Programmatic section focus draws a default outline; deck CSS suppresses it.
- When testing `data-fx` under reduced-motion, wait ~2s — the reconcile runs across two effects.

## Legacy code

`navbar`, `hackathon-card`, `project-card`, `resume-card`, `mode-toggle`, `theme-provider`, `mdx`, `magicui/dock`, `magicui/blur-fade-text`, and everything in `ui/*` are MagicUI/shadcn template leftovers not imported by the live pages (only `magicui/blur-fade` is used, by the blog index). `src/lib/scroll-store.ts` is likewise a leftover from a removed WebGL scene. Don't extend them; the previous fighter-arcade and Signal/Perimeter designs were deleted and are recoverable from commit `8e2c6a9`.
