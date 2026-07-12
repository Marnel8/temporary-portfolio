# Dither-Dot Scatter/Assemble Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** During desktop slide-deck transitions, the hero and about `DitherPortrait` dots fly outward and fade as their slide exits, and fly in from scatter to reassemble as their slide enters — same timing windows as the text glyphs.

**Architecture:** `DitherPortrait` keeps its lit-dot list in a module-level `WeakMap` keyed by its canvas and exposes a `getDitherHandle(canvas)` with `reseed()`/`draw(progress)`. The deck's existing `goTo` GSAP timeline tweens a plain JS proxy `{ p }` per portrait and repaints the canvas on each update — no element transforms, so the display:none reparent bug fixed in `07d5fd8` cannot recur.

**Tech Stack:** GSAP 3.12 (already in deck), Canvas 2D, existing boot kit, Next 16 / React 19.

**Spec:** `docs/superpowers/specs/2026-07-12-dither-dot-scatter-design.md`

## Global Constraints

- Content from `src/data/resume.tsx` only; this feature touches rendering, never copy.
- `npm run build` green at every commit; scroll/mobile/reduced-motion paths must never regress.
- Comment new code; tabs for indentation in components.
- Deck (and therefore this feature) activates ONLY when all hold: `(min-width: 1024px)`, `(pointer: fine)`, NOT `prefers-reduced-motion: reduce`.
- `npm install` in this repo needs `--legacy-peer-deps` (radix-ui/react-icons pins react ≤18; project is on react 19).
- Work on branch `feat/dither-dot-scatter` off `main`.

---

### Task 1: DitherPortrait exposes a scatter handle

**Files:**
- Modify: `src/components/boot/dither-portrait.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - Canvas gains attribute `data-dither` (deck discovery).
  - `export function getDitherHandle(canvas: HTMLCanvasElement): DitherHandle | null`
    where `type DitherHandle = { reseed(): void; draw(progress: number): void }`.
    Returns `null` until the image has decoded and the dot list exists.
  - `draw(0)` reproduces the intact portrait; `draw(1)` is fully dispersed and invisible; `reseed()` regenerates flight vectors.

- [x] **Step 1: Add the module-level registry and types** (above the component, below `BAYER`)

```ts
/* ── scatter registry ────────────────────────────────────────────────
   Each dither canvas remembers its lit dots and a per-dot flight vector
   so the slide deck can explode/reassemble the portrait. State lives in
   a WeakMap keyed by the canvas element, so it is discovered from the
   DOM (getDitherHandle) without prop drilling and is GC'd with the node. */

type DotState = {
	xs: Float32Array; // dot origin x, canvas pixels
	ys: Float32Array; // dot origin y, canvas pixels
	vx: Float32Array; // flight vector x (set by reseed)
	vy: Float32Array; // flight vector y
	size: number; // fillRect side, canvas pixels
	color: string;
	w: number; // backing-store width
	h: number; // backing-store height
};

const dotRegistry = new WeakMap<HTMLCanvasElement, DotState>();

export type DitherHandle = { reseed(): void; draw(progress: number): void };

/** Explode/reassemble handle for a dither canvas, or null if it has not
    painted its dots yet (image still decoding). progress 0 = intact,
    1 = fully dispersed + invisible. */
export function getDitherHandle(canvas: HTMLCanvasElement): DitherHandle | null {
	const s = dotRegistry.get(canvas);
	if (!s) return null;
	const reseed = () => {
		for (let i = 0; i < s.vx.length; i++) {
			s.vx[i] = (Math.random() * 2 - 1) * 0.6 * s.w;
			s.vy[i] = (Math.random() * 2 - 1) * 0.5 * s.h;
		}
	};
	const draw = (p: number) => {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, s.w, s.h);
		ctx.fillStyle = s.color;
		ctx.globalAlpha = 1 - p;
		for (let i = 0; i < s.xs.length; i++) {
			ctx.fillRect(s.xs[i] + p * s.vx[i], s.ys[i] + p * s.vy[i], s.size, s.size);
		}
		ctx.globalAlpha = 1;
	};
	return { reseed, draw };
}
```

- [x] **Step 2: Collect lit dots during the paint pass, then register them**

In the `img.decode().then(...)` body, replace the output-pass loop that currently calls `ctx.fillRect` inline. Keep drawing as before, but also push each lit dot into arrays, and register the state at the end. The loop becomes:

```ts
			// output pass
			canvas.width = cols * dot;
			canvas.height = rows * dot;
			const ctx = canvas.getContext("2d")!;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = color;

			// collect lit dots so the deck can scatter them later
			const xs: number[] = [];
			const ys: number[] = [];
			const size = dot - 1.5; // gap between dots sells the "bitmap" look

			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					const i = (y * cols + x) * 4;
					const a = data[i + 3] / 255;
					if (a < 0.4) continue; // keep transparent cutout background empty
					// Rec.601 luminance
					const lum =
						(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
					if (lum > BAYER[y % 4][x % 4]) {
						const px = x * dot;
						const py = y * dot;
						ctx.fillRect(px, py, size, size);
						xs.push(px);
						ys.push(py);
					}
				}
			}

			// register for scatter; reseed once so a first transition works
			// even before the deck calls reseed itself
			const state: DotState = {
				xs: Float32Array.from(xs),
				ys: Float32Array.from(ys),
				vx: new Float32Array(xs.length),
				vy: new Float32Array(xs.length),
				size,
				color,
				w: canvas.width,
				h: canvas.height,
			};
			dotRegistry.set(canvas, state);
```

(Delete the old inline `ctx.fillRect(x * dot, y * dot, dot - 1.5, dot - 1.5);` — it is now inside the collecting loop above.)

- [x] **Step 3: Stamp `data-dither` on the canvas element**

Change the returned canvas opening tag:

```tsx
		<canvas
			ref={canvasRef}
			data-dither
			className={className}
```

- [x] **Step 4: Build**

Run: `npm run build` → exit 0. (No visible change yet; portraits still render identically because the paint pass is unchanged apart from bookkeeping.)

- [x] **Step 5: Commit**

```bash
git add src/components/boot/dither-portrait.tsx
git commit -m "feat(dither): expose getDitherHandle scatter API on portrait canvas

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Deck drives the portrait scatter; drop block-fade on portraits

**Files:**
- Modify: `src/components/boot/slide-deck.tsx` (import + `goTo`)
- Modify: `src/app/page.tsx` (remove `deck-block` from the two `DitherPortrait` classNames)

**Interfaces:**
- Consumes: Task 1's `getDitherHandle` / `DitherHandle`, the existing `goTo` timeline.
- Produces: final behavior. No new exports.

- [x] **Step 1: Import the handle getter**

At the top of `slide-deck.tsx`, next to the existing imports:

```ts
import { getDitherHandle, type DitherHandle } from "./dither-portrait";
```

- [x] **Step 2: Resolve portrait handles in `goTo`**

Immediately after the `innBlocks` line (currently `const innBlocks = Array.from(inn.querySelectorAll<HTMLElement>(BLOCK_SEL));`), add:

```ts
		// dither portraits scatter their own dots (canvas repaint driven by
		// a proxy tween — never element transforms, so display:none can't
		// corrupt them). null handles (image still decoding) are skipped.
		const handlesIn = (slide: HTMLElement): DitherHandle[] =>
			Array.from(slide.querySelectorAll<HTMLCanvasElement>("canvas[data-dither]"))
				.map(getDitherHandle)
				.filter((h): h is DitherHandle => h !== null);
		const outDither = handlesIn(out);
		const innDither = handlesIn(inn);
```

- [x] **Step 3: Tween the outgoing portrait open (explode)**

Right after the outgoing `outBlocks` tween block (the `if (outBlocks.length) tl.to(outBlocks, ...)` ending at position `0`), add:

```ts
		// outgoing portraits: dots fly out + fade over the same window as
		// the outgoing glyphs
		outDither.forEach((h) => {
			h.reseed();
			const proxy = { p: 0 };
			tl.to(
				proxy,
				{
					p: 1,
					duration: 0.5,
					ease: "power2.in",
					onUpdate: () => h.draw(proxy.p),
				},
				0
			);
		});
```

- [x] **Step 4: Reset/scatter portraits inside the midpoint callback**

Inside the `tl.add(() => { ... }, 0.45)` callback, after `inn.classList.add("deck-active");` and before the glyph `gsap.set(innGlyphs, ...)` block, add:

```ts
			// portraits: restore the (now hidden) outgoing one intact for its
			// next entrance; pre-scatter the incoming one before it is shown
			// so it never flashes assembled
			outDither.forEach((h) => h.draw(0));
			innDither.forEach((h) => {
				h.reseed();
				h.draw(1);
			});
```

- [x] **Step 5: Tween the incoming portrait closed (assemble)**

After the incoming `innBlocks` tween block (the `if (innBlocks.length) tl.to(innBlocks, ...)` ending at position `0.5`), add:

```ts
		// incoming portraits: dots assemble from scatter, same window as
		// the incoming glyphs
		innDither.forEach((h) => {
			const proxy = { p: 1 };
			tl.to(
				proxy,
				{
					p: 0,
					duration: 0.55,
					ease: "power3.out",
					onUpdate: () => h.draw(proxy.p),
				},
				0.5
			);
		});
```

- [x] **Step 6: Remove `deck-block` from both portraits in `page.tsx`**

The hero portrait className (~line 148) currently begins `deck-block pointer-events-none absolute …`. Remove the leading `deck-block ` token:

```tsx
					className="pointer-events-none absolute left-1/2 top-1/2 h-[84vh] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
```

The about portrait className (~line 219) currently begins `deck-block reveal mx-auto …`. Remove the `deck-block ` token, keep `reveal`:

```tsx
						className="reveal mx-auto h-auto w-full max-w-[300px]"
```

(This stops the whole-canvas block fade so the dots animate alone. The drum and footer-wire canvases keep their `.deck-block`.)

- [x] **Step 7: Build**

Run: `npm run build` → exit 0.

- [x] **Step 8: Commit**

```bash
git add src/components/boot/slide-deck.tsx src/app/page.tsx
git commit -m "feat(deck): scatter/reassemble dither portrait dots on transition

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: End-to-end verification

**Files:** none (fixes only if something fails).

**Interfaces:** consumes everything above.

- [x] **Step 1: Static checks**

Run: `npm run build && npm test` → build exit 0, 2 tests pass. (Lint stays broken repo-wide — pre-existing ESLint 9 config issue, not in scope.)

- [x] **Step 2: Start the production server**

```bash
npm run build && (npm start -- -p 3199 &) && sleep 4 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3199/
```

Expected: `200`. (If port busy: `ss -ltnp | grep 3199` then `kill -9 <pid>`.)

- [x] **Step 3: Playwright — portrait dots scatter and restore intact**

Write and run this at `scratchpad/dither-drive.mjs` (boot gate skipped via sessionStorage). It captures the hero portrait bitmap settled, mid-transition, and after a round trip:

```js
import { chromium } from "playwright";
const BASE = "http://localhost:3199";
const heroDataURL = () =>
	// canvas[data-dither] inside #hero
	`(() => { const c = document.querySelector('#hero canvas[data-dither]'); return c ? c.toDataURL() : null; })()`;

const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.addInitScript(() => sessionStorage.setItem("boot.seen", "1"));
await p.goto(BASE + "/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);

const before = await p.evaluate(heroDataURL);
console.log("hero canvas present:", before !== null);

await p.mouse.wheel(0, 150); // hero → about
await p.waitForTimeout(250); // mid-scatter
const mid = await p.evaluate(heroDataURL);
await p.waitForTimeout(1400); // land on about

await p.mouse.wheel(0, -150); // about → hero
await p.waitForTimeout(1600); // settled back on hero
const after = await p.evaluate(heroDataURL);

const pass = before && mid && after && mid !== before && after === before;
console.log("mid differs from before:", mid !== before);
console.log("after equals before (intact restore):", after === before);
console.log(pass ? "PASS dither scatter" : "FAIL dither scatter");
await b.close();
process.exit(pass ? 0 : 1);
```

Run: `cd scratchpad && node dither-drive.mjs`
Expected: `PASS dither scatter` — hero canvas present, mid-scatter bitmap differs from settled, and after a round trip the bitmap is byte-identical (dots reassembled to origin).

- [x] **Step 4: Re-run the existing deck drives (no regression)**

Re-run the desktop drive (`scratchpad/desktop-drive.mjs`) and mobile/reduced-motion drive (`scratchpad/mobile-drive.mjs`) from the slide-deck verification. Expected: desktop 13/13 real checks (only the `/_vercel/insights/script.js` 404 console line, expected off-Vercel); mobile+reduced-motion+blog 12/12.

- [x] **Step 5: Eyeball a mid-scatter screenshot**

Capture `scratchpad/shots/dither-mid.png` at ~0.25 s into a hero→about transition; confirm the hero portrait dots are visibly dispersed (not a whole-image fade) while text glyphs also scatter. Stop the server (`kill` the `npm start` pid).

- [x] **Step 6: Report per verification-before-completion** — build/test output, the three Playwright drive results, and the mid-scatter screenshot.
