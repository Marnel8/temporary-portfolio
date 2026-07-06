"use client";

import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   TYPED LOG — a block of terminal boot-output lines, revealed by typing.
   Types each line character-by-character with a blinking block caret on
   the active line. Starts when the block scrolls into view (or after
   `startDelay` if it's already visible on load).
   ═══════════════════════════════════════════════════════════════════ */

export default function TypedLog({
	lines,
	charMs = 14,
	lineGapMs = 110,
	startDelay = 0,
	className,
}: {
	lines: readonly string[];
	charMs?: number; // per-character delay
	lineGapMs?: number; // pause between lines
	startDelay?: number;
	className?: string;
}) {
	const ref = useRef<HTMLDivElement>(null);
	const [started, setStarted] = useState(false);
	// progress = number of characters revealed across the whole block
	const [progress, setProgress] = useState(0);

	const total = lines.reduce((n, l) => n + l.length, 0);

	// Begin typing once visible.
	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => setStarted(true), startDelay);
					io.disconnect();
				}
			},
			{ threshold: 0.2 }
		);
		io.observe(el);
		return () => io.disconnect();
	}, [startDelay]);

	useEffect(() => {
		if (!started || progress >= total) return;
		// Insert the longer line-gap pause at line boundaries.
		let seen = 0;
		let atBoundary = false;
		for (const l of lines) {
			seen += l.length;
			if (progress === seen && progress < total) {
				atBoundary = true;
				break;
			}
		}
		const id = setTimeout(
			() => setProgress((p) => p + 1),
			atBoundary ? lineGapMs : charMs
		);
		return () => clearTimeout(id);
	}, [started, progress, total, lines, charMs, lineGapMs]);

	// Slice the flat progress counter back into per-line text.
	let remaining = progress;
	const rendered = lines.map((line) => {
		const take = Math.max(0, Math.min(line.length, remaining));
		remaining -= take;
		return line.slice(0, take);
	});
	const activeLine = rendered.findIndex(
		(txt, i) => txt.length < lines[i].length
	);
	const done = progress >= total;

	return (
		<div ref={ref} className={className} aria-label={lines.join("\n")}>
			{rendered.map((txt, i) => {
				// Don't render lines the caret hasn't reached yet.
				if (!done && activeLine !== -1 && i > activeLine) return null;
				return (
					<div key={i} className="whitespace-pre-wrap leading-relaxed">
						<span className="opacity-50 select-none">&gt; </span>
						{txt}
						{/* caret sits on the line being typed, or the last line when done */}
						{(i === activeLine || (done && i === lines.length - 1)) && (
							<span className="term-caret" aria-hidden />
						)}
					</div>
				);
			})}
		</div>
	);
}
