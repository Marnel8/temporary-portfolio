"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DATA } from "@/data/resume";

export default function ProjectStack() {
	const root = useRef<HTMLDivElement>(null);
	const projects = DATA.projects;

	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			const cards = gsap.utils.toArray<HTMLElement>(".stk-card");

			cards.forEach((card, i) => {
				const inner = card.querySelector<HTMLElement>(".stk-inner");
				const media = card.querySelector<HTMLElement>(".stk-media-img");

				// each outgoing card shrinks + dims as the next one stacks over it
				if (i < cards.length - 1) {
					gsap.to(inner, {
						scale: 0.9,
						filter: "brightness(0.45)",
						ease: "none",
						scrollTrigger: {
							trigger: cards[i + 1],
							start: "top bottom",
							end: "top top",
							scrub: true,
						},
					});
				}

				// gentle parallax on the media inside each card
				if (media) {
					gsap.fromTo(
						media,
						{ yPercent: -8 },
						{
							yPercent: 8,
							ease: "none",
							scrollTrigger: {
								trigger: card,
								start: "top bottom",
								end: "bottom top",
								scrub: true,
							},
						}
					);
				}
			});
		}, root);

		return () => ctx.revert();
	}, []);

	return (
		<div ref={root} className="relative">
			{projects.map((p, i) => {
				const href = p.href || p.links?.find((l) => l.href)?.href || "";
				const flip = i % 2 === 1;
				return (
					<div
						key={i}
						className="stk-card sticky top-[10vh] mb-6"
						style={{ zIndex: i + 1 }}
					>
						<div
							className="stk-inner relative grid min-h-[68vh] origin-top overflow-hidden rounded-2xl border border-white/12 bg-[#0c0d0f]/90 backdrop-blur-md md:grid-cols-2"
							style={{ willChange: "transform, filter" }}
						>
							{/* media */}
							<div
								className={`relative overflow-hidden bg-black/50 ${
									flip ? "md:order-2" : ""
								}`}
							>
								<div className="stk-media-img absolute inset-0 h-[120%]">
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
										<img
											src={p.image}
											alt={p.title}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[hsl(222,96%,28%)] to-[#070809] font-display text-[10rem] text-white/15">
											{String(i + 1).padStart(2, "0")}
										</div>
									)}
								</div>
								<span className="absolute left-5 top-5 z-10 font-mono text-[10px] tracking-[0.3em] text-white/70">
									BUILD / {String(i + 1).padStart(2, "0")}
								</span>
							</div>

							{/* info */}
							<div className="flex flex-col justify-between p-8 sm:p-12">
								<div className="flex items-center justify-between">
									<span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
										{p.dates}
									</span>
									<span
										className={`size-2 rounded-full ${
											p.active ? "animate-pulse bg-emerald-400" : "bg-white/25"
										}`}
									/>
								</div>

								<div className="py-8">
									<h3 className="font-display text-4xl font-bold leading-[0.95] tracking-[-0.03em] sm:text-6xl">
										{p.title}
									</h3>
									<p className="mt-6 max-w-md text-sm leading-relaxed text-white/60">
										{p.description}
									</p>
								</div>

								<div>
									<div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-6">
										{p.technologies.map((t) => (
											<span
												key={t}
												className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/40"
											>
												{t}
											</span>
										))}
									</div>

									{href && (
										<Link
											href={href}
											target="_blank"
											data-hover
											className="group mt-8 inline-flex items-center gap-3 font-display text-lg font-semibold text-[hsl(222,96%,64%)]"
										>
											View build
											<span className="flex size-9 items-center justify-center rounded-full border border-[hsl(222,96%,64%)] transition-transform duration-300 group-hover:rotate-45">
												↗
											</span>
										</Link>
									)}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
