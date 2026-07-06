"use client";

import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   SCRAMBLE CYCLE — the four corner labels around the hero.
   Holds a word, then "re-detects" the next one: characters flip through
   random glyphs left-to-right until they settle. Loops forever.

   words     — the set to cycle through (real roles/interests only)
   holdMs    — how long a settled word stays before the next scramble
   startDelay— offset so the four corners don't all fire in unison
   ═══════════════════════════════════════════════════════════════════ */

const GLYPHS = "ABCDEFGHKMNPRSTUVWXYZ0123456789#$%&<>/\\|=+*";

export default function ScrambleCycle({
	words,
	holdMs = 3800,
	startDelay = 0,
	className,
}: {
	words: readonly string[];
	holdMs?: number;
	startDelay?: number;
	className?: string;
}) {
	const [text, setText] = useState(words[0]);
	const idx = useRef(0);

	useEffect(() => {
		let frame: number;
		let timer: ReturnType<typeof setTimeout>;
		let cancelled = false;

		// Scramble from the current word into `target` over ~600ms.
		const scrambleTo = (target: string) => {
			const start = performance.now();
			const duration = 600;
			const tick = (now: number) => {
				if (cancelled) return;
				const t = Math.min(1, (now - start) / duration);
				// Characters left of the "resolve front" are final; the rest churn.
				const resolved = Math.floor(t * target.length);
				let out = "";
				for (let i = 0; i < target.length; i++) {
					if (i < resolved || target[i] === " ") out += target[i];
					else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
				}
				setText(out);
				if (t < 1) frame = requestAnimationFrame(tick);
				else schedule();
			};
			frame = requestAnimationFrame(tick);
		};

		const schedule = () => {
			timer = setTimeout(() => {
				idx.current = (idx.current + 1) % words.length;
				scrambleTo(words[idx.current]);
			}, holdMs);
		};

		const kickoff = setTimeout(schedule, startDelay);
		return () => {
			cancelled = true;
			cancelAnimationFrame(frame);
			clearTimeout(timer);
			clearTimeout(kickoff);
		};
	}, [words, holdMs, startDelay]);

	return (
		<span className={className} aria-live="off">
			{text}
		</span>
	);
}
