"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function Preloader() {
	const root = useRef<HTMLDivElement>(null);
	const counter = useRef<HTMLSpanElement>(null);
	const bar = useRef<HTMLDivElement>(null);
	const [done, setDone] = useState(false);
	// only the home page gets the cinematic load-in; deep links (blog…)
	// shouldn't sit behind a 3-second counter
	const isHome = usePathname() === "/";

	useEffect(() => {
		if (!isHome) return;
		const obj = { v: 0 };
		document.documentElement.style.overflow = "hidden";

		const ctx = gsap.context(() => {
			const tl = gsap.timeline({
				onComplete: () => {
					document.documentElement.style.overflow = "";
					setDone(true);
				},
			});

			tl.to(obj, {
				v: 100,
				duration: 2.2,
				ease: "power2.inOut",
				onUpdate: () => {
					const val = Math.round(obj.v);
					if (counter.current) counter.current.textContent = String(val).padStart(3, "0");
					if (bar.current) bar.current.style.transform = `scaleX(${obj.v / 100})`;
				},
			})
				.to(".pl-line", { scaleY: 0, transformOrigin: "top", duration: 0.7, stagger: 0.04, ease: "power3.inOut" }, "+=0.15")
				.to(root.current, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "-=0.3");
		}, root);

		return () => {
			// if the route changes mid-animation, don't leave scroll locked
			document.documentElement.style.overflow = "";
			ctx.revert();
		};
	}, [isHome]);

	if (done || !isHome) return null;

	return (
		<div
			ref={root}
			className="fixed inset-0 z-[100] flex flex-col justify-between bg-[#0A0E14] p-6 sm:p-10"
		>
			<div className="pointer-events-none absolute inset-0 flex">
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="pl-line h-full flex-1 border-r border-white/[0.04]" />
				))}
			</div>

			<div className="relative flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
				<span>MV // SIGNAL</span>
				<span>Establishing perimeter</span>
			</div>

			<div className="relative flex items-end justify-between">
				<div className="font-display text-[18vw] leading-[0.8] text-white sm:text-[12vw]">
					<span ref={counter}>000</span>
				</div>
				<span className="mb-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
					%
				</span>
			</div>

			<div className="relative h-px w-full bg-white/10">
				<div
					ref={bar}
					className="h-full origin-left scale-x-0 bg-[#00E5C7]"
				/>
			</div>
		</div>
	);
}
