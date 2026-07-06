"use client";

import { useEffect, useRef, useState } from "react";

/* ── DecryptText ──────────────────────────────────────────────────────
   Scramble/decrypt reveal: every character cycles through random glyphs,
   then resolves to the real text left-to-right. Used for the hero name
   and section-level "classified" labels.

   - `delay`    ms before the effect starts
   - `duration` ms for the full resolve
   - `trigger`  "mount" runs immediately, "scroll" waits until visible
   Falls back to plain text for prefers-reduced-motion. */

const GLYPHS = "!<>-_\\/[]{}—=+*^?#$_%&@01";

type Props = {
	text: string;
	className?: string;
	delay?: number;
	duration?: number;
	trigger?: "mount" | "scroll";
};

export default function DecryptText({
	text,
	className,
	delay = 0,
	duration = 1200,
	trigger = "mount",
}: Props) {
	// Render the real text on the server / first paint so there is no
	// hydration mismatch and no-JS visitors still see the content;
	// the scramble only kicks in after mount.
	const [display, setDisplay] = useState(text);
	const el = useRef<HTMLSpanElement>(null);
	const started = useRef(false);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		let raf = 0;
		let timeout: ReturnType<typeof setTimeout>;
		let observer: IntersectionObserver | undefined;

		const run = () => {
			if (started.current) return;
			started.current = true;
			timeout = setTimeout(() => {
				const t0 = performance.now();
				const tick = (now: number) => {
					const p = Math.min((now - t0) / duration, 1);
					// characters left of the "resolve front" are final,
					// the rest keep cycling random glyphs
					const front = Math.floor(p * text.length);
					let out = "";
					for (let i = 0; i < text.length; i++) {
						const ch = text[i];
						if (ch === " " || i < front) out += ch;
						else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
					}
					setDisplay(out);
					if (p < 1) raf = requestAnimationFrame(tick);
					else setDisplay(text);
				};
				raf = requestAnimationFrame(tick);
			}, delay);
		};

		if (trigger === "mount") {
			run();
		} else {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((e) => e.isIntersecting)) {
						run();
						observer?.disconnect();
					}
				},
				{ threshold: 0.4 }
			);
			if (el.current) observer.observe(el.current);
		}

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(timeout);
			observer?.disconnect();
		};
	}, [text, delay, duration, trigger]);

	return (
		// aria-label keeps the real text for screen readers while the
		// visible glyphs churn
		<span ref={el} className={className} aria-label={text}>
			<span aria-hidden="true">{display}</span>
		</span>
	);
}
