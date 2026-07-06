"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/* ── Magnetic ─────────────────────────────────────────────────────────
   Wraps a button/link with two hover behaviours:
   1. magnetic pull — the element leans toward the cursor (gsap quickTo)
   2. cursor-follow glow — a teal radial gradient tracks the pointer via
      the --mx/--my CSS vars (consumed by an ::after-style overlay div)
   Skipped entirely on touch devices. */

export default function Magnetic({
	children,
	strength = 0.3,
	className,
}: {
	children: React.ReactNode;
	strength?: number;
	className?: string;
}) {
	const wrap = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = wrap.current;
		if (!el || window.matchMedia("(pointer: coarse)").matches) return;

		const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
		const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });

		const move = (e: PointerEvent) => {
			const r = el.getBoundingClientRect();
			// offset of the cursor from the element centre → lean that way
			xTo((e.clientX - (r.left + r.width / 2)) * strength);
			yTo((e.clientY - (r.top + r.height / 2)) * strength);
			// glow position, local to the element
			el.style.setProperty("--mx", `${e.clientX - r.left}px`);
			el.style.setProperty("--my", `${e.clientY - r.top}px`);
		};
		const leave = () => {
			xTo(0);
			yTo(0);
		};

		el.addEventListener("pointermove", move);
		el.addEventListener("pointerleave", leave);
		return () => {
			el.removeEventListener("pointermove", move);
			el.removeEventListener("pointerleave", leave);
		};
	}, [strength]);

	return (
		<div ref={wrap} className={`group/mag relative inline-block ${className ?? ""}`}>
			{children}
			{/* cursor-follow glow — sits above the child but ignores events */}
			<span
				aria-hidden
				className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/mag:opacity-100"
				style={{
					background:
						"radial-gradient(120px circle at var(--mx, 50%) var(--my, 50%), rgba(0,229,199,0.18), transparent 70%)",
				}}
			/>
		</div>
	);
}
