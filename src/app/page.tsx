"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DATA } from "@/data/resume";
import ProjectBento from "@/components/experience/project-bento";

const ACCENT = "hsl(222,96%,64%)";

/* ──────────────────────────────────────────────────────────── helpers ── */

function HudLabel({ children }: { children: React.ReactNode }) {
	return (
		<span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
			{children}
		</span>
	);
}

function SectionTag({ index, title }: { index: string; title: string }) {
	return (
		<div className="mb-12 flex items-center gap-4">
			<span className="font-mono text-[11px] tracking-[0.3em] text-[hsl(222,96%,64%)]">
				{index}
			</span>
			<span className="h-px w-10 bg-white/20" />
			<h2 className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/60">
				{title}
			</h2>
		</div>
	);
}

/* ──────────────────────────────────────────────────────────────── page ── */

export default function Page() {
	const scope = useRef<HTMLElement>(null);
	const firstName = DATA.name.split(" ")[0].toUpperCase();
	const lastName = DATA.name.split(" ").slice(1).join(" ").toUpperCase();

	useLayoutEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			// HERO — staggered reveal of clipped lines
			gsap.set(".hero-line span", { yPercent: 110 });
			gsap.set(".hero-fade", { opacity: 0, y: 24 });

			const tl = gsap.timeline({ delay: 2.7 });
			tl.to(".hero-line span", {
				yPercent: 0,
				duration: 1.1,
				ease: "power4.out",
				stagger: 0.12,
			}).to(
				".hero-fade",
				{ opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.12 },
				"-=0.7"
			);

			// generic parallax-on-scroll for [data-speed] elements
			gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
				const speed = parseFloat(el.dataset.speed || "0");
				gsap.to(el, {
					y: () => speed * ScrollTrigger.maxScroll(window) * -0.06,
					ease: "none",
					scrollTrigger: {
						trigger: el,
						start: "top bottom",
						end: "bottom top",
						scrub: true,
					},
				});
			});

			// MANIFESTO — word-by-word colour reveal
			gsap.to(".manifesto-word", {
				color: "#f5f3ef",
				stagger: 0.5,
				ease: "none",
				scrollTrigger: {
					trigger: ".manifesto",
					start: "top 75%",
					end: "bottom 60%",
					scrub: true,
				},
			});

			// section heads + rows reveal
			gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
				gsap.from(el, {
					y: 60,
					opacity: 0,
					duration: 1,
					ease: "power3.out",
					scrollTrigger: { trigger: el, start: "top 85%" },
				});
			});

			// EXPERIENCE timeline progress line
			gsap.from(".timeline-line", {
				scaleY: 0,
				transformOrigin: "top",
				ease: "none",
				scrollTrigger: {
					trigger: ".timeline",
					start: "top 70%",
					end: "bottom 80%",
					scrub: true,
				},
			});

			// stat counters
			gsap.utils.toArray<HTMLElement>(".counter").forEach((el) => {
				const target = parseInt(el.dataset.count || "0", 10);
				const o = { v: 0 };
				gsap.to(o, {
					v: target,
					duration: 1.6,
					ease: "power2.out",
					scrollTrigger: { trigger: el, start: "top 85%" },
					onUpdate: () => {
						el.textContent = String(Math.round(o.v)).padStart(2, "0");
					},
				});
			});

			ScrollTrigger.refresh();
		}, scope);

		return () => ctx.revert();
	}, []);

	const yearsExp = "02";
	const projectsCount = String(DATA.projects.length).padStart(2, "0");
	const stackCount = String(DATA.skills.length).padStart(2, "0");

	return (
		<main ref={scope} className="relative z-10 text-[#f5f3ef]">
			{/* ════════════════════════════════ HERO ════════════════════════════ */}
			<section
				id="hero"
				className="relative flex min-h-[100svh] flex-col justify-center px-6 sm:px-12"
			>
				<div className="hero-fade mb-8 flex items-center gap-3">
					<span className="inline-block size-1.5 animate-pulse rounded-full bg-[hsl(222,96%,64%)]" />
					<HudLabel>
						Available for select projects · {DATA.location.split(",")[0]}
					</HudLabel>
				</div>

				<h1 className="font-display text-[16vw] font-bold leading-[0.82] tracking-[-0.04em] sm:text-[13vw] lg:text-[11.5vw]">
					<span className="hero-line block overflow-hidden">
						<span className="block">{firstName}</span>
					</span>
					<span className="hero-line block overflow-hidden">
						<span className="block text-transparent [-webkit-text-stroke:1.5px_rgba(245,243,239,0.55)]">
							{lastName}
						</span>
					</span>
				</h1>

				<div className="mt-10 grid gap-8 sm:grid-cols-12 sm:items-end">
					<p className="hero-fade max-w-md text-balance text-base leading-relaxed text-white/70 sm:col-span-7">
						{DATA.description}
					</p>
					<div className="hero-fade flex gap-10 sm:col-span-5 sm:justify-end">
						<div>
							<div className="font-display text-3xl font-bold">{yearsExp}+</div>
							<HudLabel>Years</HudLabel>
						</div>
						<div>
							<div className="font-display text-3xl font-bold">{projectsCount}</div>
							<HudLabel>Builds</HudLabel>
						</div>
						<div>
							<div className="font-display text-3xl font-bold">{stackCount}</div>
							<HudLabel>Tools</HudLabel>
						</div>
					</div>
				</div>

				<div className="hero-fade absolute bottom-8 left-6 flex items-center gap-3 sm:left-12">
					<span className="h-8 w-px animate-pulse bg-white/30" />
					<HudLabel>Scroll to enter</HudLabel>
				</div>
			</section>

			{/* ═══════════════════════════════ MANIFESTO ═══════════════════════ */}
			<section
				id="about"
				className="manifesto relative px-6 py-32 sm:px-12 sm:py-48"
			>
				<div className="mx-auto max-w-5xl">
					<SectionTag index="01" title="Profile" />
					<p className="font-display text-3xl font-medium leading-[1.25] tracking-[-0.02em] sm:text-5xl sm:leading-[1.2]">
						{(
							"Web developer & data-science grad student. I design and ship full-stack products end to end — interfaces, APIs, data pipelines — and I build with AI in the loop to move faster and smarter."
						)
							.split(" ")
							.map((w, i) => (
								<span
									key={i}
									className="manifesto-word"
									style={{ color: "rgba(245,243,239,0.18)" }}
								>
									{w}{" "}
								</span>
							))}
					</p>
				</div>
			</section>

			{/* ═══════════════════════════════ SKILLS MARQUEE ══════════════════ */}
			<section className="relative overflow-hidden border-y border-white/10 py-6">
				<div className="marquee flex w-max gap-8 whitespace-nowrap">
					{[...DATA.skills, ...DATA.skills].map((s, i) => (
						<span
							key={i}
							className="font-display text-2xl font-medium text-white/30 sm:text-4xl"
						>
							{s}
							<span className="px-4 text-[hsl(222,96%,64%)]">✦</span>
						</span>
					))}
				</div>
			</section>

			{/* ═══════════════════════════════ EXPERIENCE ══════════════════════ */}
			<section id="experience" className="relative px-6 py-32 sm:px-12 sm:py-48">
				<div className="mx-auto max-w-5xl">
					<SectionTag index="02" title="Career Log" />
					<div className="timeline relative pl-8 sm:pl-16">
						<div className="timeline-line absolute left-1.5 top-2 h-full w-px bg-gradient-to-b from-[hsl(222,96%,64%)] via-white/30 to-transparent sm:left-3" />
						{DATA.work.map((w, i) => (
							<div key={i} className="reveal relative mb-16 last:mb-0">
								<span className="absolute -left-[34px] top-2 size-2.5 rounded-full bg-[hsl(222,96%,64%)] ring-4 ring-[#070809] sm:-left-[58px]" />
								<HudLabel>
									{w.start} — {w.end ?? "Present"}
								</HudLabel>
								<h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-4xl">
									{w.title}
								</h3>
								<div className="mt-1 text-sm text-[hsl(222,96%,64%)]">
									{w.company}
								</div>
								<p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">
									{w.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ═══════════════════════════════ PROJECTS (interactive index) ════ */}
			<section id="projects" className="relative px-6 py-32 sm:px-12 sm:py-48">
				<div className="mx-auto max-w-6xl">
					<div className="reveal mb-10 flex items-end justify-between">
						<SectionTag index="03" title="Selected Builds" />
						<HudLabel>Hover any tile</HudLabel>
					</div>
					<ProjectBento />
				</div>
			</section>

			{/* ═══════════════════════════════ CONTACT ═════════════════════════ */}
			<section
				id="contact"
				className="relative flex min-h-[90svh] flex-col justify-center px-6 py-32 sm:px-12"
			>
				<div className="mx-auto w-full max-w-5xl">
					<SectionTag index="04" title="Open Signal" />
					<h2 className="reveal font-display text-[12vw] font-bold leading-[0.85] tracking-[-0.04em] sm:text-[8vw]">
						LET&apos;S
						<br />
						<span className="text-[hsl(222,96%,64%)]">BUILD IT.</span>
					</h2>

					<div className="reveal mt-16 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-3">
						<div>
							<HudLabel>Email</HudLabel>
							<Link
								href={`mailto:${DATA.contact.email}`}
								className="mt-2 block text-lg font-medium hover:text-[hsl(222,96%,64%)]"
								data-hover
							>
								{DATA.contact.email}
							</Link>
						</div>
						<div>
							<HudLabel>Phone</HudLabel>
							<div className="mt-2 text-lg font-medium tabular-nums">
								{DATA.contact.phone}
							</div>
						</div>
						<div>
							<HudLabel>Channels</HudLabel>
							<div className="mt-2 flex flex-wrap gap-4">
								{Object.entries(DATA.contact.social)
									.filter(([, s]) => s.navbar)
									.map(([name, s]) => (
										<Link
											key={name}
											href={s.url}
											target="_blank"
											className="text-lg font-medium hover:text-[hsl(222,96%,64%)]"
											data-hover
										>
											{name}
										</Link>
									))}
							</div>
						</div>
					</div>

					<footer className="mt-24 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
						<span>© {new Date().getFullYear()} Marnel Valentin</span>
						<span className="hidden sm:inline">WebGL · GSAP · Next.js</span>
						<span>End transmission</span>
					</footer>
				</div>
			</section>
		</main>
	);
}
