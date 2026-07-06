"use client";

import { useLayoutEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DATA } from "@/data/resume";
import BootGate from "@/components/boot/boot-gate";
import DitherPortrait from "@/components/boot/dither-portrait";
import ScrambleCycle from "@/components/boot/scramble-cycle";
import TypedLog from "@/components/boot/typed-log";
import { triggerRain } from "@/components/boot/rain-overlay";

/* ═══════════════════════════════════════════════════════════════════════
   BOOT SEQUENCE — phosphor-terminal portfolio home page.
   All copy comes from src/data/resume.tsx; this file is layout + motion.
   Palette: boot #010603 · pale #C8FFDD · phos #00FF6A (single accent)
   Conventions used by every section:
   - `.reveal`     → fades/slides in when scrolled into view
   - `[data-rain]` → fires a digital-rain burst when the section enters
   ═══════════════════════════════════════════════════════════════════ */

/* hero boot readout — real facts only (resume.tsx + stated focus) */
const LOG_LINES = [
	"whoami ............. marnel valentin",
	"role ............... software engineer — full-stack web",
	"edu ................ MS data science, batangas state university (2025—present)",
	"focus .............. web systems · data analysis · security (leaning)",
	`location ........... ${DATA.location.toLowerCase()}`,
	"status ............. building — freelance + university research",
];

/* corner label word sets — actual roles/interests, no filler */
const CORNER_TL = ["SOFTWARE ENGINEER", "WEB DEVELOPER"] as const;
const CORNER_TR = ["MS DATA SCIENCE", "FORECASTING / EDA"] as const;
const CORNER_BL = ["FULL-STACK", "REACT · NEXT · NODE"] as const;
const CORNER_BR = ["SECURITY-LEANING", "AI-ASSISTED DEV"] as const;

/* ── shared helpers ──────────────────────────────────────────────────── */

/* numbered section header, e.g. "[02] OPS LOG" */
function SectionTag({ index, title }: { index: string; title: string }) {
	return (
		<div className="reveal mb-12 flex items-center gap-4 font-mono">
			<span className="text-[11px] tracking-[0.2em] text-phos">[{index}]</span>
			<span className="h-px w-12 bg-phos/25" />
			<h2 className="text-[11px] uppercase tracking-[0.35em] text-phos/60">
				{title}
			</h2>
		</div>
	);
}

/* small outlined mono status chip */
function Chip({ children }: { children: React.ReactNode }) {
	return (
		<span className="inline-flex items-center border border-phos/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-phos/80">
			{children}
		</span>
	);
}

export default function Home() {
	useLayoutEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		/* hero intro — waits for the boot gate's "bootdone" signal so the
		   gate wipe and the name reveal never overlap */
		const intro = () => {
			gsap.fromTo(
				".hero-name span",
				{ yPercent: 55, opacity: 0 },
				{ yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.12, ease: "power3.out" }
			);
		};
		let introArmed = false;
		if (document.documentElement.dataset.booted === "1") {
			intro();
		} else {
			introArmed = true;
			window.addEventListener("bootdone", intro, { once: true });
		}

		const ctx = gsap.context(() => {
			// generic reveal-on-scroll for everything marked .reveal
			gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
				gsap.fromTo(
					el,
					{ y: 28, opacity: 0 },
					{
						y: 0,
						opacity: 1,
						duration: 0.7,
						ease: "power2.out",
						scrollTrigger: { trigger: el, start: "top 82%" },
					}
				);
			});

			// digital-rain burst as each major section takes the viewport
			// (rain-overlay rate-limits itself, so fast scrolling can't strobe)
			gsap.utils.toArray<HTMLElement>("[data-rain]").forEach((el) => {
				ScrollTrigger.create({
					trigger: el,
					start: "top 55%",
					onEnter: () => triggerRain(),
					onEnterBack: () => triggerRain(),
				});
			});
		});

		return () => {
			if (introArmed) window.removeEventListener("bootdone", intro);
			ctx.revert();
		};
	}, []);

	return (
		<>
			{/* typed BIOS gate — once per tab session, click/Enter/Esc skips */}
			<BootGate />

			<main className="relative">
				{/* ── [00] HERO ─────────────────────────────────────────── */}
				<section
					id="hero"
					data-rain
					className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6"
				>
					{/* ghosted ordered-dither portrait behind the name */}
					<DitherPortrait
						src="/photos/hero.png"
						cols={120}
						dot={5}
						opacity={0.32}
						className="pointer-events-none absolute left-1/2 top-1/2 h-[84vh] w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
					/>

					{/* four glitch-cycling corner labels */}
					<div className="pointer-events-none absolute inset-x-6 top-20 z-10 flex justify-between font-mono text-[10px] tracking-[0.3em] text-phos/60 sm:inset-x-14">
						<ScrambleCycle words={CORNER_TL} />
						<ScrambleCycle words={CORNER_TR} startDelay={950} />
					</div>
					<div className="pointer-events-none absolute inset-x-6 bottom-24 z-10 flex justify-between font-mono text-[10px] tracking-[0.3em] text-phos/60 sm:inset-x-14">
						<ScrambleCycle words={CORNER_BL} startDelay={1900} />
						<ScrambleCycle words={CORNER_BR} startDelay={2850} />
					</div>

					{/* the name — massive, blocky, solid fills */}
					<h1 className="hero-name relative z-10 text-center font-display uppercase leading-[0.88] text-pale">
						<span className="block text-[clamp(3rem,12.5vw,10rem)]">Marnel</span>
						<span className="phos-glow block text-[clamp(3rem,12.5vw,10rem)] text-phos">
							Valentin
						</span>
					</h1>

					{/* typed system readout */}
					<TypedLog
						lines={LOG_LINES}
						startDelay={350}
						className="relative z-10 mt-10 w-full max-w-xl font-mono text-[11px] text-phos/80 sm:text-xs"
					/>

					{/* scroll cue */}
					<div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] text-phos/50">
						<span className="scroll-cue">▼ SCROLL</span>
					</div>
				</section>

				{/* ── [01] OPERATOR PROFILE (about) ─────────────────────── */}
				<section id="about" data-rain className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
					<SectionTag index="01" title="operator profile" />
					<div className="grid items-center gap-14 md:grid-cols-[1fr_minmax(220px,320px)]">
						<div>
							<TypedLog
								lines={["cat /usr/marnel/about.txt"]}
								className="mb-6 font-mono text-xs text-phos/60"
							/>
							<p className="reveal max-w-prose font-mono text-sm leading-relaxed text-pale/85">
								{DATA.summary}
							</p>
							<div className="reveal mt-8 flex flex-wrap gap-3">
								<Chip>MS data science — in progress</Chip>
								<Chip>BS information technology · 2019–2023</Chip>
								<Chip>{DATA.location}</Chip>
							</div>
							{/* capability list — plain mono tags, no meters */}
							<div className="reveal mt-10">
								<div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-phos/50">
									&gt; ls /skills
								</div>
								<ul className="flex max-w-prose flex-wrap gap-x-4 gap-y-2 font-mono text-[11px] text-pale/70">
									{DATA.skills.map((skill) => (
										<li key={skill} className="before:mr-1 before:text-phos/50 before:content-['·']">
											{skill}
										</li>
									))}
								</ul>
							</div>
						</div>
						{/* free-floating dithered cutout — deliberately no panel/border */}
						<DitherPortrait
							src="/photos/about.png"
							cols={96}
							dot={5}
							opacity={0.85}
							className="reveal mx-auto h-auto w-full max-w-[300px]"
							alt="Marnel holding a laptop"
						/>
					</div>
				</section>

				{/* ── [02] OPS LOG (experience) + [03] TRAINING (education) ── */}
				<section id="ops" data-rain className="mx-auto max-w-5xl px-6 py-28">
					<SectionTag index="02" title="ops log — experience" />
					<ol className="space-y-12">
						{DATA.work.map((job) => (
							<li
								key={job.company + job.start}
								className="reveal grid gap-2 border-l border-phos/20 pl-6 sm:grid-cols-[190px_1fr] sm:gap-8"
							>
								{/* timestamp column, log-file style */}
								<div className="font-mono text-[11px] uppercase tracking-[0.15em] text-phos/50">
									[{job.start} — {job.end}]
								</div>
								<div>
									<h3 className="font-mono text-sm font-bold uppercase tracking-[0.08em] text-pale">
										{job.title}
									</h3>
									<div className="mt-1 font-mono text-xs text-phos/70">
										{job.href ? (
											<Link href={job.href} target="_blank" className="transition-colors hover:text-phos">
												{job.company}
											</Link>
										) : (
											job.company
										)}
										<span className="text-phos/40"> · {job.location}</span>
									</div>
									<p className="mt-3 max-w-prose font-mono text-xs leading-relaxed text-pale/70">
										{job.description}
									</p>
								</div>
							</li>
						))}
					</ol>

					<div className="mt-24">
						<SectionTag index="03" title="training — education" />
						<ol className="space-y-8">
							{DATA.education.map((edu) => (
								<li
									key={edu.degree}
									className="reveal grid gap-2 border-l border-phos/20 pl-6 sm:grid-cols-[190px_1fr] sm:gap-8"
								>
									<div className="font-mono text-[11px] uppercase tracking-[0.15em] text-phos/50">
										[{edu.start} — {edu.end}]
									</div>
									<div>
										<h3 className="font-mono text-sm font-bold uppercase tracking-[0.08em] text-pale">
											{edu.degree}
										</h3>
										<Link
											href={edu.href}
											target="_blank"
											className="mt-1 inline-block font-mono text-xs text-phos/70 transition-colors hover:text-phos"
										>
											{edu.school}
										</Link>
									</div>
								</li>
							))}
						</ol>
					</div>
				</section>

				{/* SECTIONS-END */}
			</main>
		</>
	);
}
