# Slide-Deck Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Desktop home page becomes a 6-slide deck: one wheel/swipe/key = one transition where the outgoing slide's words explode into scattered glyphs and the next slide assembles; mobile/reduced-motion keep the current scroll page.

**Architecture:** A new `SlideDeck` client component wraps the six home sections. After mount it gates on `(min-width:1024px) and (pointer:fine)` + no reduced motion, stamps `html[data-deck="on"]` (CSS turns sections into stacked fixed slides), captures input via GSAP Observer, and runs scatter/assemble GSAP timelines over lazily char/word-split text. The page's ScrollTrigger reveals are created only in scroll mode.

**Tech Stack:** GSAP 3.12 (`Observer` plugin, already in deps), existing boot kit, Tailwind 3.4.

**Spec:** `docs/superpowers/specs/2026-07-06-slide-deck-transitions-design.md`

## Global Constraints

- Content from `src/data/resume.tsx` only; this feature moves markup, never copy.
- `npm run build` green at every commit; mobile path must never regress.
- Comment new code; tabs for indentation in components.
- Deck activates ONLY when all hold: `(min-width: 1024px)`, `(pointer: fine)`, NOT `prefers-reduced-motion: reduce`. Otherwise today's page, untouched.
- A11y: split parents get `aria-label` of original text; glyph spans `aria-hidden="true"`. Incoming slide receives focus.
- Work on branch `feat/slide-deck-transitions` off `main`.

---

### Task 1: Branch + support plumbing (rain force, Lenis pause, deck CSS)

**Files:**
- Modify: `src/components/boot/rain-overlay.tsx` (triggerRain signature, ~line 20 & the `start` fn)
- Modify: `src/components/boot/smooth-scroll.tsx` (deckmode listener)
- Modify: `src/app/globals.css` (deck-mode rules, in `@layer utilities` after the Boot Sequence block)

**Interfaces:**
- Consumes: nothing new.
- Produces: `triggerRain(force?: boolean)` — `force` bypasses the 3s rate limit; window CustomEvent `"deckmode"` with `detail: { on: boolean }` — SmoothScroll stops/starts Lenis on it; CSS contract: `html[data-deck="on"]` + `[data-slide]` + `.deck-active` + `[data-deck-hide]` + `.deck-glyph`.

- [ ] **Step 1: Create the branch**

```bash
git checkout -b feat/slide-deck-transitions
```

- [ ] **Step 2: Add `force` to triggerRain**

In `rain-overlay.tsx`, change the listener type and public fn:

```ts
type Listener = (force?: boolean) => void;
const listeners = new Set<Listener>();

/** Request a rain burst. `force` bypasses the rate limit (used by the
    slide deck so every transition gets its burst). No-op on server. */
export function triggerRain(force = false) {
	listeners.forEach((fn) => fn(force));
}
```

and in the component change `const start = () => {` to:

```ts
		const start = (force = false) => {
			if (!fxRef.current) return;
			const now = performance.now();
			if (!force && now - lastBurst < MIN_GAP_MS) return;
```

(rest of `start` unchanged).

- [ ] **Step 3: Pause Lenis in deck mode**

In `smooth-scroll.tsx`, inside the `useEffect` after `lenis.on("scroll", ...)`, add:

```ts
		// The slide deck owns the wheel when active — Lenis must let go,
		// otherwise both fight over wheel events. The deck dispatches
		// "deckmode" on activate/deactivate.
		const onDeckMode = (e: Event) => {
			const on = (e as CustomEvent<{ on: boolean }>).detail.on;
			if (on) lenis.stop();
			else lenis.start();
		};
		window.addEventListener("deckmode", onDeckMode);
```

and in the cleanup: `window.removeEventListener("deckmode", onDeckMode);`

- [ ] **Step 4: Deck CSS**

Append to the Boot Sequence utilities block in `globals.css`:

```css
	/* ── Slide deck (desktop "channel switch" mode) ────────────────
	   html[data-deck="on"] is stamped by slide-deck.tsx after mount.
	   Sections become stacked fullscreen slides; only .deck-active
	   is displayed. Scroll mode is completely unaffected.           */
	html[data-deck="on"] body {
		overflow: hidden;
	}
	html[data-deck="on"] [data-slide] {
		position: fixed;
		inset: 0;
		display: none;
		flex-direction: column;
		justify-content: center;
		overflow: hidden;
		/* tighter vertical padding than scroll mode so tall slides fit */
		padding-top: 4.5rem;
		padding-bottom: 4.5rem;
	}
	html[data-deck="on"] [data-slide].deck-active {
		display: flex;
	}
	/* content that only makes sense in scroll mode (HTML project index) */
	html[data-deck="on"] [data-deck-hide] {
		display: none;
	}
	/* glyph spans created by the deck's text splitter */
	.deck-glyph {
		display: inline-block;
		white-space: pre;
	}
```

- [ ] **Step 5: Build + commit**

Run: `npm run build` → exit 0. (Nothing user-visible changes yet.)

```bash
git add src/components/boot/rain-overlay.tsx src/components/boot/smooth-scroll.tsx src/app/globals.css
git commit -m "feat(deck): rain force option, Lenis deckmode pause, deck CSS contract

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: SlideDeck engine (crossfade) + page wiring

**Files:**
- Create: `src/components/boot/slide-deck.tsx`
- Modify: `src/app/page.tsx` (wrap sections; split ops section into `#experience` + `#education`; `data-deck-hide` on project index; gate ScrollTriggers)
- Modify: `src/components/boot/hud-frame.tsx` (hide SYS.READY under deck mode)

**Interfaces:**
- Consumes: Task 1's CSS contract, `"deckmode"` event, `triggerRain(force)`.
- Produces: `SlideDeck` default export, props `{ children: React.ReactNode }`; exports `deckEligible(): boolean` (media-query check — the page uses it to skip ScrollTrigger setup). Dispatches `"deckmode"`. Marks sections via `[data-slide]` children it finds in its own DOM subtree. Transition in this task is a plain crossfade; Task 3 replaces it with scatter/assemble.

- [ ] **Step 1: Create `slide-deck.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { triggerRain } from "./rain-overlay";

/* ═══════════════════════════════════════════════════════════════════════
   SLIDE DECK — desktop-only "channel switch" navigation for the home
   page. Wraps the [data-slide] sections; when eligible it stamps
   <html data-deck="on"> (CSS stacks the slides fullscreen) and turns
   one wheel flick / swipe / arrow key into one slide transition.

   - Eligibility: ≥1024px, fine pointer, no reduced-motion. Checked
     after mount so SSR/hydration markup stays the plain scroll page.
   - Everyone else keeps the normal scrolling page — this component
     then renders children untouched (plus nothing else).
   - Dispatches "deckmode" so Lenis pauses, and shows dot navigation
     + a NN / NN counter while active.
   ═══════════════════════════════════════════════════════════════════ */

/** True when this device should get the deck instead of scrolling. */
export function deckEligible(): boolean {
	return (
		window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches &&
		!window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}

const TRANSITION_LOCK_MS = 1150; // safety unlock a hair after the timeline

export default function SlideDeck({ children }: { children: React.ReactNode }) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const slidesRef = useRef<HTMLElement[]>([]);
	const activeRef = useRef(0);
	const lockedRef = useRef(false);
	// deck=null → undecided (SSR/first paint); the page renders scroll layout
	const [deck, setDeck] = useState<boolean | null>(null);
	const [active, setActive] = useState(0);
	const [count, setCount] = useState(0);

	/* ── transition (crossfade for now; scatter lands in the next task) ── */
	const goTo = (next: number) => {
		const slides = slidesRef.current;
		if (lockedRef.current || next === activeRef.current) return;
		if (next < 0 || next >= slides.length) return;
		lockedRef.current = true;
		const out = slides[activeRef.current];
		const inn = slides[next];
		activeRef.current = next;
		setActive(next);

		const tl = gsap.timeline({
			onComplete: () => {
				lockedRef.current = false;
			},
		});
		tl.to(out, { opacity: 0, duration: 0.35, ease: "power2.in" })
			.add(() => {
				triggerRain(true);
				out.classList.remove("deck-active");
				inn.classList.add("deck-active");
				gsap.set(out, { opacity: 1 }); // reset for its next entrance
				inn.focus({ preventScroll: true });
			})
			.fromTo(inn, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
		// belt-and-braces unlock in case the tab is backgrounded mid-tween
		setTimeout(() => (lockedRef.current = false), TRANSITION_LOCK_MS);
	};

	useEffect(() => {
		if (!deckEligible()) {
			setDeck(false);
			return;
		}
		gsap.registerPlugin(Observer);

		const slides = Array.from(
			wrapRef.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? []
		);
		slidesRef.current = slides;
		setCount(slides.length);
		setDeck(true);

		// enter deck mode: stamp the attribute CSS keys off, pause Lenis,
		// make slide 0 the visible one
		document.documentElement.dataset.deck = "on";
		window.dispatchEvent(new CustomEvent("deckmode", { detail: { on: true } }));
		window.scrollTo(0, 0);
		slides.forEach((s, i) => {
			s.classList.toggle("deck-active", i === 0);
			s.tabIndex = -1; // focus target after transitions
		});

		// one flick = one step; drum drags are ignored (canvas)
		const obs = Observer.create({
			type: "wheel,touch",
			wheelSpeed: -1,
			tolerance: 12,
			preventDefault: true,
			ignore: "canvas",
			onDown: () => goTo(activeRef.current + 1),
			onUp: () => goTo(activeRef.current - 1),
		});

		const onKey = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "PageDown") goTo(activeRef.current + 1);
			else if (e.key === "ArrowUp" || e.key === "PageUp") goTo(activeRef.current - 1);
			else if (e.key === "Home") goTo(0);
			else if (e.key === "End") goTo(slidesRef.current.length - 1);
			else return;
			e.preventDefault();
		};
		window.addEventListener("keydown", onKey);

		// deck ↔ scroll switch on breakpoint cross (edge case: reset cleanly)
		const mq = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
		const onMq = () => {
			if (!mq.matches) window.location.reload();
		};
		mq.addEventListener("change", onMq);

		return () => {
			obs.kill();
			window.removeEventListener("keydown", onKey);
			mq.removeEventListener("change", onMq);
			delete document.documentElement.dataset.deck;
			window.dispatchEvent(new CustomEvent("deckmode", { detail: { on: false } }));
		};
		// goTo is stable (all refs); intentionally mount-only
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div ref={wrapRef}>
			{children}

			{/* dot navigation + counter — deck mode only */}
			{deck && (
				<>
					<nav
						aria-label="Slides"
						className="fixed right-7 top-1/2 z-[85] flex -translate-y-1/2 flex-col gap-3"
					>
						{Array.from({ length: count }, (_, i) => (
							<button
								key={i}
								type="button"
								onClick={() => goTo(i)}
								aria-label={`Slide ${i + 1}`}
								aria-current={i === active}
								className={`h-2 w-2 border transition-colors ${
									i === active
										? "border-phos bg-phos"
										: "border-phos/40 bg-transparent hover:border-phos"
								}`}
							/>
						))}
					</nav>
					<div className="fixed bottom-6 left-8 z-[85] font-mono text-[9px] tracking-[0.3em] text-phos/40">
						SLIDE {String(active + 1).padStart(2, "0")} /{" "}
						{String(count).padStart(2, "0")}
					</div>
				</>
			)}
		</div>
	);
}
```

- [ ] **Step 2: Wire the page**

In `page.tsx`:

a. Add import: `import SlideDeck, { deckEligible } from "@/components/boot/slide-deck";`

b. Wrap the sections: `<main className="relative">` → `<main className="relative"><SlideDeck>` and `</main>` → `</SlideDeck></main>` (the `{/* SECTIONS-END */}` marker stays inside).

c. Add `data-slide` to all top-level sections: the `<section id="hero">`, `<section id="about">`, the two new sections from (d), `<section id="projects">`, and `<footer id="contact">`.

d. Split the ops section: the current `<section id="ops" data-rain …>` contains the experience `<ol>` and an education `<div className="mt-24">`. Replace with two sibling sections, same inner markup and copy:

```tsx
				<section id="experience" data-slide data-rain className="mx-auto max-w-5xl px-6 py-28">
					<SectionTag index="02" title="ops log — experience" />
					<ol className="space-y-12">
						{/* …existing DATA.work map, unchanged… */}
					</ol>
				</section>

				<section id="education" data-slide data-rain className="mx-auto max-w-5xl px-6 py-28">
					<SectionTag index="03" title="training — education" />
					<ol className="space-y-8">
						{/* …existing DATA.education map, unchanged… */}
					</ol>
				</section>
```

(Delete the old `mt-24` wrapper div — the SectionTag moves into the new section.)

e. Mark the project HTML index: the `<ol className="mt-16 divide-y …">` gets `data-deck-hide`.

f. Gate the ScrollTrigger setup. In the `useLayoutEffect`, wrap ONLY the `ctx = gsap.context(...)` block (reveals + rain triggers):

```tsx
		/* Scroll-driven reveals exist only in scroll mode. In deck mode the
		   fromTo would render everything invisible with no scroll to ever
		   reveal it — the deck's own timelines handle entrances there. */
		let ctx: gsap.Context | undefined;
		if (!deckEligible()) {
			ctx = gsap.context(() => {
				/* …existing .reveal + [data-rain] setup, unchanged… */
			});
		}
```

and in the cleanup: `ctx?.revert();` (the `bootdone` intro stays unconditional — the hero name reveal runs in both modes).

- [ ] **Step 3: Hide SYS.READY under deck mode**

In `hud-frame.tsx`, the bottom-left status div gets an extra class so the deck's counter can take its spot:

```tsx
			<div className="absolute bottom-6 left-8 hidden text-[9px] tracking-[0.3em] text-phos/40 sm:block [html[data-deck='on']_&]:!hidden">
```

(Use the arbitrary-variant syntax exactly as written; it compiles under Tailwind 3.4.)

- [ ] **Step 4: Build + drive the crossfade deck**

Run: `npm run build` → exit 0. Start dev server; with a 1440×900 Playwright context: dispatch one `wheel` event → `html[data-deck]` is `"on"`, slide `#about` has `.deck-active`, `#hero` doesn't, `window.scrollY === 0`. In a 390×844 context: no `data-deck` attribute, page scrolls, all sections visible.

- [ ] **Step 5: Commit**

```bash
git add src/components/boot/slide-deck.tsx src/app/page.tsx src/components/boot/hud-frame.tsx
git commit -m "feat(deck): slide-deck engine with crossfade, dots, counter; split ops into experience/education

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Scatter/assemble transition + explode markers

**Files:**
- Modify: `src/components/boot/slide-deck.tsx` (splitter + timeline replaces crossfade)
- Modify: `src/app/page.tsx` (`data-explode` markers)

**Interfaces:**
- Consumes: Task 2's engine; markers `data-explode="chars" | "words" | "block"` on elements inside slides.
- Produces: final transition behavior. No API changes.

- [ ] **Step 1: Add the splitter to `slide-deck.tsx`** (above the component)

```tsx
/* ── text splitter ───────────────────────────────────────────────────
   Wraps the text of [data-explode="chars"|"words"] elements in
   .deck-glyph spans so the timeline can scatter them individually.
   - Lazy: runs once per slide, the first time it transitions.
   - A11y: the marked element keeps an aria-label with the original
     text; the generated spans are hidden from the tree. */

function splitElement(el: HTMLElement, mode: "chars" | "words") {
	if (el.dataset.split) return;
	el.dataset.split = "1";
	el.setAttribute("aria-label", el.textContent ?? "");
	const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
	const textNodes: Text[] = [];
	while (walker.nextNode()) textNodes.push(walker.currentNode as Text);
	for (const node of textNodes) {
		const text = node.textContent ?? "";
		if (!text.trim()) continue;
		const frag = document.createDocumentFragment();
		const pieces =
			mode === "chars" ? Array.from(text) : text.split(/(\s+)/);
		for (const piece of pieces) {
			if (mode === "words" && /^\s+$/.test(piece)) {
				frag.append(piece); // keep whitespace as plain text
				continue;
			}
			const span = document.createElement("span");
			span.className = "deck-glyph";
			span.setAttribute("aria-hidden", "true");
			span.textContent = piece;
			frag.append(span);
		}
		node.replaceWith(frag);
	}
}

function ensureSplit(slide: HTMLElement) {
	slide
		.querySelectorAll<HTMLElement>('[data-explode="chars"]')
		.forEach((el) => splitElement(el, "chars"));
	slide
		.querySelectorAll<HTMLElement>('[data-explode="words"]')
		.forEach((el) => splitElement(el, "words"));
}
```

- [ ] **Step 2: Replace the crossfade timeline in `goTo`**

```tsx
		ensureSplit(out);
		ensureSplit(inn);
		const outGlyphs = out.querySelectorAll<HTMLElement>(".deck-glyph");
		const outBlocks = out.querySelectorAll<HTMLElement>('[data-explode="block"]');
		const innGlyphs = inn.querySelectorAll<HTMLElement>(".deck-glyph");
		const innBlocks = inn.querySelectorAll<HTMLElement>('[data-explode="block"]');

		const tl = gsap.timeline({
			onComplete: () => {
				lockedRef.current = false;
			},
		});
		// 1 · outgoing text explodes into scattered glyphs
		tl.set([outGlyphs, innGlyphs], { willChange: "transform" })
			.to(
				outGlyphs,
				{
					x: () => gsap.utils.random(-520, 520),
					y: () => gsap.utils.random(-380, 380),
					rotation: () => gsap.utils.random(-120, 120),
					opacity: 0,
					duration: 0.5,
					ease: "power2.in",
					stagger: { each: 0.005, from: "random" },
				},
				0
			)
			.to(outBlocks, { opacity: 0, scale: 0.92, duration: 0.4, ease: "power2.in" }, 0)
			// 2 · midpoint: rain burst covers the swap
			.add(() => {
				triggerRain(true);
				out.classList.remove("deck-active");
				inn.classList.add("deck-active");
				// reset the outgoing slide for its next entrance
				gsap.set(outGlyphs, { x: 0, y: 0, rotation: 0, opacity: 1 });
				gsap.set(outBlocks, { opacity: 1, scale: 1 });
				inn.focus({ preventScroll: true });
			}, ">-0.05")
			// 3 · incoming glyphs assemble from scatter
			.fromTo(
				innGlyphs,
				{
					x: () => gsap.utils.random(-420, 420),
					y: () => gsap.utils.random(-300, 300),
					rotation: () => gsap.utils.random(-90, 90),
					opacity: 0,
				},
				{
					x: 0,
					y: 0,
					rotation: 0,
					opacity: 1,
					duration: 0.55,
					ease: "power3.out",
					stagger: { each: 0.004, from: "random" },
				}
			)
			.fromTo(
				innBlocks,
				{ opacity: 0, scale: 0.95 },
				{ opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
				"<"
			)
			.set([outGlyphs, innGlyphs], { willChange: "auto" });
```

(The `TRANSITION_LOCK_MS` safety unlock stays.)

- [ ] **Step 3: Add explode markers in `page.tsx`**

- Hero: both name `<span>`s → `data-explode="chars"`; the two corner-label divs, the `TypedLog`, the `DitherPortrait`, and the scroll-cue div → `data-explode="block"` (dynamic/canvas content scatters as whole units).
- Every `SectionTag` call site: wrap is a div with `.reveal` — add `data-explode="block"` via a new optional prop instead: change `SectionTag` root div to accept it:

```tsx
function SectionTag({ index, title }: { index: string; title: string }) {
	return (
		<div data-explode="block" className="reveal mb-12 flex items-center gap-4 font-mono">
```

- About: summary `<p>` → `data-explode="words"`; chips row div → `block`; `> ls /skills` header div → `chars`; skills `<ul>` → `words`; about `DitherPortrait` → `block`.
- Experience/Education `<li>` children: timestamp div → `chars`; `<h3>` → `chars`; company/school line div → `block`; description `<p>` → `words`.
- Projects: the drum wrapper `div.reveal` → `data-explode="block"`.
- Contact: `PixelMark`, name/role div, email `<a>`, socials div, copyright div, `FooterWire` → all `data-explode="block"`, except the name `<div className="font-display …">` → `chars`.

- [ ] **Step 4: Build + eyeball the scatter**

Run: `npm run build` → exit 0. In the browser: wheel through all six slides — outgoing glyphs visibly scatter, rain bursts mid-swap, incoming text assembles; `.deck-glyph` spans exist after first transition; re-entering a slide shows intact text (transforms reset).

- [ ] **Step 5: Commit**

```bash
git add src/components/boot/slide-deck.tsx src/app/page.tsx
git commit -m "feat(deck): glyph scatter/assemble transitions with rain midpoint

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: End-to-end verification

**Files:** none (fixes only if something fails).

**Interfaces:** consumes everything above.

- [ ] **Step 1: Static checks**

`npm run build && npm test` → build 0, 2 tests pass. (Lint stays broken repo-wide — pre-existing ESLint 9 config issue, not in scope.)

- [ ] **Step 2: Playwright drive, desktop (1440×900)**

1. Load `/`, skip boot gate → `html[data-deck="on"]`, `#hero.deck-active`, body scroll 0.
2. One wheel-down → lands on `#about` exactly (direction check: if inverted, flip `onDown`/`onUp` and re-run).
3. Wheel spam (5 rapid events) → still `#experience` (one step per lock window).
4. Mid-transition screenshot → scattered `.deck-glyph` spans with non-zero transforms.
5. Arrow keys + `End`/`Home`; dot click jumps to slide 5.
6. On `#projects`: drag the drum canvas → drum rotates, slide unchanged.
7. `window.scrollY` stays 0 throughout; no console errors.

- [ ] **Step 3: Playwright, mobile (390×844) + reduced-motion context**

No `data-deck` attribute; page scrolls; all six sections + project index visible; reveals fire. Blog routes unaffected.

- [ ] **Step 4: Report per verification-before-completion; screenshots of a mid-scatter frame and each slide.**
