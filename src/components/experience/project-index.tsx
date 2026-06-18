"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DATA } from "@/data/resume";

type Project = (typeof DATA.projects)[number];

export default function ProjectIndex() {
	const root = useRef<HTMLDivElement>(null);
	const preview = useRef<HTMLDivElement>(null);
	const [active, setActive] = useState<number | null>(null);

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			// follow cursor
			const xTo = gsap.quickTo(preview.current, "x", { duration: 0.55, ease: "power3" });
			const yTo = gsap.quickTo(preview.current, "y", { duration: 0.55, ease: "power3" });
			const move = (e: PointerEvent) => {
				xTo(e.clientX);
				yTo(e.clientY);
			};
			window.addEventListener("pointermove", move);

			// rows reveal
			gsap.from(".pi-row", {
				yPercent: 105,
				opacity: 0,
				duration: 0.9,
				ease: "power3.out",
				stagger: 0.08,
				scrollTrigger: { trigger: root.current, start: "top 75%" },
			});

			return () => window.removeEventListener("pointermove", move);
		}, root);

		return () => ctx.revert();
	}, []);

	useEffect(() => {
		if (active === null) {
			gsap.to(preview.current, { autoAlpha: 0, scale: 0.85, duration: 0.4, ease: "power3" });
		} else {
			gsap.to(preview.current, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3" });
		}
	}, [active]);

	const projects = DATA.projects;
	const current: Project | null = active !== null ? projects[active] : null;

	return (
		<div ref={root} className="relative">
			{/* cursor-following media preview (desktop) */}
			<div
				ref={preview}
				className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[260px] w-[380px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-white/15 opacity-0 shadow-2xl shadow-black/60 md:block"
				style={{ willChange: "transform" }}
			>
				{projects.map((p, i) => (
					<div
						key={i}
						className="absolute inset-0 transition-opacity duration-300"
						style={{ opacity: active === i ? 1 : 0 }}
					>
						{p.video ? (
							<video
								src={p.video}
								autoPlay
								loop
								muted
								playsInline
								className="h-full w-full object-cover"
							/>
						) : p.image ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={p.image} alt={p.title} className="h-full w-full object-cover" />
						) : (
							<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(222,96%,30%)] to-[#070809] font-display text-6xl text-white/30">
								{String(i + 1).padStart(2, "0")}
							</div>
						)}
						<span className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.3em] text-white/80">
							P/{String(i + 1).padStart(2, "0")}
						</span>
					</div>
				))}
			</div>

			{/* the index list */}
			<ul
				className="border-t border-white/10"
				onPointerLeave={() => setActive(null)}
			>
				{projects.map((p, i) => {
					const href = p.href || p.links?.find((l) => l.href)?.href || "";
					const dim = active !== null && active !== i;
					const Row = (
						<div
							className={`pi-row group relative flex items-center gap-4 border-b border-white/10 py-6 transition-all duration-500 sm:gap-8 sm:py-8 ${
								dim ? "opacity-30" : "opacity-100"
							}`}
							onPointerEnter={() => setActive(i)}
							data-hover
						>
							{/* fill sweep on hover */}
							<span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-white/[0.03] transition-transform duration-500 ease-out group-hover:scale-x-100" />

							<span className="w-10 shrink-0 font-mono text-xs text-white/40 tabular-nums sm:w-14">
								{String(i + 1).padStart(2, "0")}
							</span>

							<h3 className="flex-1 font-display text-3xl font-semibold tracking-[-0.02em] text-white/70 transition-all duration-500 group-hover:translate-x-3 group-hover:text-[#f5f3ef] sm:text-5xl lg:text-6xl">
								{p.title}
							</h3>

							<span className="hidden max-w-[220px] flex-wrap justify-end gap-x-3 font-mono text-[10px] uppercase tracking-[0.15em] text-white/35 lg:flex">
								{p.technologies.slice(0, 3).map((t) => (
									<span key={t}>{t}</span>
								))}
							</span>

							<span className="hidden w-24 shrink-0 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 sm:block">
								{p.dates.split(" - ")[0].split(" ").slice(-1)}
							</span>

							<span className="shrink-0 text-xl text-white/40 transition-all duration-500 group-hover:translate-x-1 group-hover:text-[hsl(222,96%,64%)]">
								↗
							</span>
						</div>
					);

					return (
						<li key={i}>
							{href ? (
								<Link href={href} target="_blank">
									{Row}
								</Link>
							) : (
								Row
							)}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
