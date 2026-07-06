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
