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
		const pieces = mode === "chars" ? Array.from(text) : text.split(/(\s+)/);
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

export default function SlideDeck({ children }: { children: React.ReactNode }) {
	const wrapRef = useRef<HTMLDivElement>(null);
	const slidesRef = useRef<HTMLElement[]>([]);
	const activeRef = useRef(0);
	const lockedRef = useRef(false);
	// deck=null → undecided (SSR/first paint); the page renders scroll layout
	const [deck, setDeck] = useState<boolean | null>(null);
	const [active, setActive] = useState(0);
	const [count, setCount] = useState(0);

	/* ── transition: outgoing glyphs scatter → rain swap → assemble ────── */
	const goTo = (next: number) => {
		const slides = slidesRef.current;
		if (lockedRef.current || next === activeRef.current) return;
		if (next < 0 || next >= slides.length) return;
		lockedRef.current = true;
		const out = slides[activeRef.current];
		const inn = slides[next];
		activeRef.current = next;
		setActive(next);

		ensureSplit(out);
		ensureSplit(inn);
		// "block" units scatter/fade whole: canvases, dynamic text, chips.
		// .deck-block is the marker for components that only take className.
		// Flat element arrays, never NodeLists — GSAP throws on an empty
		// NodeList nested in a target array, and a slide with no glyphs
		// (e.g. projects: all blocks) must still transition cleanly.
		const BLOCK_SEL = '[data-explode="block"], .deck-block';
		const outGlyphs = Array.from(out.querySelectorAll<HTMLElement>(".deck-glyph"));
		const outBlocks = Array.from(out.querySelectorAll<HTMLElement>(BLOCK_SEL));
		const innGlyphs = Array.from(inn.querySelectorAll<HTMLElement>(".deck-glyph"));
		const innBlocks = Array.from(inn.querySelectorAll<HTMLElement>(BLOCK_SEL));
		const allGlyphs = [...outGlyphs, ...innGlyphs];

		const tl = gsap.timeline({
			onComplete: () => {
				lockedRef.current = false;
			},
		});
		// explicit positions so empty groups can't shift the schedule:
		// 0.00–0.50 explode out · 0.45 swap+rain · 0.50–1.05 assemble in
		if (allGlyphs.length) tl.set(allGlyphs, { willChange: "transform" }, 0);
		// 1 · outgoing text explodes into scattered glyphs
		if (outGlyphs.length)
			tl.to(
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
			);
		if (outBlocks.length)
			tl.to(outBlocks, { opacity: 0, scale: 0.92, duration: 0.4, ease: "power2.in" }, 0);
		// 2 · midpoint: rain burst covers the swap.
		// Transform writes must only hit VISIBLE elements: GSAP measures a
		// display:none element by reparenting it to <html> and restores it
		// via nextElementSibling (gsap _getMatrix), which hops whitespace
		// text nodes and joins words ("and smarter" → "andsmarter"). So:
		// reset the outgoing slide BEFORE hiding it, scatter the incoming
		// glyphs AFTER showing it, and assemble with to() tweens (lazy
		// init) instead of fromTo() (immediateRender while still hidden).
		tl.add(() => {
			triggerRain(true);
			// reset the outgoing slide for its next entrance
			if (outGlyphs.length) gsap.set(outGlyphs, { x: 0, y: 0, rotation: 0, opacity: 1 });
			if (outBlocks.length) gsap.set(outBlocks, { opacity: 1, scale: 1 });
			out.classList.remove("deck-active");
			inn.classList.add("deck-active");
			// scattered start state — same tick as the display flip, so the
			// assembled slide never paints before it scatters
			if (innGlyphs.length)
				gsap.set(innGlyphs, {
					x: () => gsap.utils.random(-420, 420),
					y: () => gsap.utils.random(-300, 300),
					rotation: () => gsap.utils.random(-90, 90),
					opacity: 0,
				});
			if (innBlocks.length) gsap.set(innBlocks, { opacity: 0, scale: 0.95 });
			inn.focus({ preventScroll: true });
		}, 0.45);
		// 3 · incoming glyphs assemble from scatter
		if (innGlyphs.length)
			tl.to(
				innGlyphs,
				{
					x: 0,
					y: 0,
					rotation: 0,
					opacity: 1,
					duration: 0.55,
					ease: "power3.out",
					stagger: { each: 0.004, from: "random" },
				},
				0.5
			);
		if (innBlocks.length)
			tl.to(
				innBlocks,
				{ opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" },
				0.5
			);
		if (allGlyphs.length) tl.set(allGlyphs, { willChange: "auto" }, 1.05);
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

		// one flick = one step; drum drags are ignored (canvas).
		// wheelSpeed -1 makes wheel direction match touch, so a single
		// mapping works for both: onUp advances, onDown goes back
		// (wheel-down / swipe-up both land in onUp = "next slide").
		const obs = Observer.create({
			type: "wheel,touch",
			wheelSpeed: -1,
			tolerance: 12,
			preventDefault: true,
			ignore: "canvas",
			onUp: () => goTo(activeRef.current + 1),
			onDown: () => goTo(activeRef.current - 1),
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
