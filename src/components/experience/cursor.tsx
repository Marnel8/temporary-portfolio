"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Cursor() {
	const dot = useRef<HTMLDivElement>(null);
	const ring = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (window.matchMedia("(pointer: coarse)").matches) return;

		const xDot = gsap.quickTo(dot.current, "x", { duration: 0.15, ease: "power3" });
		const yDot = gsap.quickTo(dot.current, "y", { duration: 0.15, ease: "power3" });
		const xRing = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
		const yRing = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });

		const move = (e: PointerEvent) => {
			xDot(e.clientX);
			yDot(e.clientY);
			xRing(e.clientX);
			yRing(e.clientY);
		};

		const over = (e: Event) => {
			const t = e.target as HTMLElement;
			if (t.closest("a, button, [data-hover]")) {
				gsap.to(ring.current, { scale: 2.4, opacity: 0.9, duration: 0.3 });
				gsap.to(dot.current, { scale: 0, duration: 0.3 });
			}
		};
		const out = (e: Event) => {
			const t = e.target as HTMLElement;
			if (t.closest("a, button, [data-hover]")) {
				gsap.to(ring.current, { scale: 1, opacity: 0.5, duration: 0.3 });
				gsap.to(dot.current, { scale: 1, duration: 0.3 });
			}
		};

		window.addEventListener("pointermove", move);
		document.addEventListener("pointerover", over);
		document.addEventListener("pointerout", out);
		return () => {
			window.removeEventListener("pointermove", move);
			document.removeEventListener("pointerover", over);
			document.removeEventListener("pointerout", out);
		};
	}, []);

	return (
		<div className="pointer-events-none fixed inset-0 z-[90] hidden md:block">
			<div
				ref={ring}
				className="absolute -left-5 -top-5 size-10 rounded-full border border-[hsl(222,96%,64%)] opacity-50 mix-blend-difference"
			/>
			<div
				ref={dot}
				className="absolute -left-[3px] -top-[3px] size-1.5 rounded-full bg-white mix-blend-difference"
			/>
		</div>
	);
}
