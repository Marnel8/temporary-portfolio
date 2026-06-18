"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DATA } from "@/data/resume";

// span pattern across a 6-col grid — deliberately irregular for a mosaic feel
const SPANS = [
	"md:col-span-4 md:row-span-2",
	"md:col-span-2 md:row-span-1",
	"md:col-span-2 md:row-span-1",
	"md:col-span-3 md:row-span-2",
	"md:col-span-3 md:row-span-1",
	"md:col-span-3 md:row-span-1",
	"md:col-span-2 md:row-span-2",
	"md:col-span-4 md:row-span-1",
];

export default function ProjectBento() {
	const root = useRef<HTMLDivElement>(null);
	const projects = DATA.projects;

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);
		const ctx = gsap.context(() => {
			gsap.from(".bento-tile", {
				y: 70,
				opacity: 0,
				scale: 0.95,
				duration: 0.9,
				ease: "power3.out",
				stagger: { each: 0.07, grid: "auto", from: "start" },
				scrollTrigger: { trigger: root.current, start: "top 78%" },
			});
		}, root);
		return () => ctx.revert();
	}, []);

	return (
		<div
			ref={root}
			className="grid auto-rows-[170px] grid-cols-1 gap-3 sm:auto-rows-[200px] md:grid-cols-6"
		>
			{projects.map((p, i) => {
				const href = p.href || p.links?.find((l) => l.href)?.href || "";
				const span = SPANS[i % SPANS.length];
				const Tile = (
					<div
						data-hover
						className={`bento-tile group relative h-full overflow-hidden rounded-xl border border-white/12 bg-[#0c0d0f] ${span}`}
					>
						{/* media */}
						<div className="absolute inset-0">
							{p.video ? (
								<video
									src={p.video}
									autoPlay
									loop
									muted
									playsInline
									className="h-full w-full object-cover opacity-50 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-80 group-hover:grayscale-0"
								/>
							) : p.image ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={p.image}
									alt={p.title}
									className="h-full w-full object-cover opacity-45 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-80 group-hover:grayscale-0"
								/>
							) : (
								<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(222,96%,24%)] to-[#070809] font-display text-[6rem] text-white/15">
									{String(i + 1).padStart(2, "0")}
								</div>
							)}
						</div>

						{/* gradient scrim */}
						<div className="absolute inset-0 bg-gradient-to-t from-[#070809] via-[#070809]/40 to-transparent" />

						{/* HUD index */}
						<span className="absolute right-4 top-4 font-mono text-[10px] tracking-[0.3em] text-white/50">
							{String(i + 1).padStart(2, "0")}
						</span>
						{p.active && (
							<span className="absolute left-4 top-4 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-emerald-300">
								<span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
								Live
							</span>
						)}

						{/* content */}
						<div className="absolute inset-x-0 bottom-0 p-5">
							<div className="translate-y-0 transition-transform duration-500 group-hover:-translate-y-1">
								<h3 className="font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
									{p.title}
								</h3>
								<div className="mt-1 flex flex-wrap gap-x-3 font-mono text-[9px] uppercase tracking-[0.15em] text-white/45">
									{p.technologies.slice(0, 4).map((t) => (
										<span key={t}>{t}</span>
									))}
								</div>
							</div>
							{/* description revealed on hover */}
							<p className="mt-2 max-h-0 overflow-hidden text-xs leading-relaxed text-white/60 opacity-0 transition-all duration-500 group-hover:max-h-24 group-hover:opacity-100">
								{p.description}
							</p>
						</div>

						{/* hover arrow */}
						<span className="absolute right-4 bottom-4 flex size-8 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/70 opacity-0 backdrop-blur transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
							↗
						</span>
					</div>
				);

				return href ? (
					<Link key={i} href={href} target="_blank" className={`contents`}>
						{Tile}
					</Link>
				) : (
					<div key={i} className="contents">
						{Tile}
					</div>
				);
			})}
		</div>
	);
}
