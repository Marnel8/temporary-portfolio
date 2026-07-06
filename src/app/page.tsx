"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DATA } from "@/data/resume";
import ProjectBento from "@/components/experience/project-bento";
import DecryptText from "@/components/signal/decrypt-text";
import Magnetic from "@/components/signal/magnetic";
import SkillsRadar from "@/components/signal/skills-radar";

/* ═══════════════════════════════════════════════════════════════════════
   SIGNAL / PERIMETER — single-accent dark dashboard portfolio.
   All copy comes from src/data/resume.tsx; this file is layout + motion.
   Palette: bg #0A0E14 · panel #12161F · border #1E2530 · accent #00E5C7
   (secondary #7C6FFF, used only for the "security — in progress" marks)
   ═══════════════════════════════════════════════════════════════════ */

const ACCENT = "#00E5C7";
const VIOLET = "#7C6FFF";

/* ── skill clustering ────────────────────────────────────────────────
   Groups the flat DATA.skills list into the three radar clusters.
   Membership lives here (not in resume.tsx) so the data file stays a
   plain content record; any skill not matched falls into the SE bucket. */
const DS_SKILLS = new Set(["Python", "Jupyter", "R", "RStudio", "Data Analysis", "Forecasting"]);
const TOOLING_SKILLS = new Set(["Claude Code", "Cursor", "Codex", "Figma", "Photoshop", "MS Office Suite"]);

const dsSkills = DATA.skills.filter((s) => DS_SKILLS.has(s));
const toolingSkills = DATA.skills.filter((s) => TOOLING_SKILLS.has(s));
const seSkills = DATA.skills.filter((s) => !DS_SKILLS.has(s) && !TOOLING_SKILLS.has(s));

/* ────────────────────────────────────────────────────────── helpers ── */

function MonoLabel({ children, className }: { children: React.ReactNode; className?: string }) {
	return (
		<span className={`font-mono text-[10px] uppercase tracking-[0.3em] text-[#8B93A1] ${className ?? ""}`}>
			{children}
		</span>
	);
}

/* numbered section header, e.g. "SEC://02 · CAPABILITY MATRIX" */
function SectionTag({ index, title }: { index: string; title: string }) {
	return (
		<div className="reveal mb-12 flex items-center gap-4">
			<span className="font-mono text-[11px] tracking-[0.2em] text-[#00E5C7]">
				SEC://{index}
			</span>
			<span className="h-px w-10 bg-[#1E2530]" />
			<h2 className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#8B93A1]">
				{title}
			</h2>
		</div>
	);
}

/* mono status chip used in About + timeline */
function StatusChip({ children, tone = "teal" }: { children: React.ReactNode; tone?: "teal" | "violet" | "dim" }) {
	const color =
		tone === "teal" ? "border-[#00E5C7]/30 text-[#00E5C7]" :
		tone === "violet" ? "border-[#7C6FFF]/40 text-[#7C6FFF]" :
		"border-[#1E2530] text-[#8B93A1]";
	return (
		<span className={`inline-flex items-center gap-2 border ${color} bg-[#12161F] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em]`}>
			{children}
		</span>
	);
}

/* terminal-styled CTA — magnetic pull + cursor glow via <Magnetic> */
function TerminalButton({
	href, children, primary = false, external = false,
}: { href: string; children: React.ReactNode; primary?: boolean; external?: boolean }) {
	return (
		<Magnetic>
			<Link
				href={href}
				target={external ? "_blank" : undefined}
				data-hover
				className={`inline-flex items-center gap-2 border px-5 py-3 font-mono text-xs tracking-[0.15em] transition-colors duration-300 ${
					primary
						? "border-[#00E5C7]/60 bg-[#00E5C7]/10 text-[#00E5C7] hover:bg-[#00E5C7]/20"
						: "border-[#1E2530] bg-[#12161F] text-[#E4E7EB] hover:border-[#00E5C7]/40 hover:text-[#00E5C7]"
				}`}
			>
				<span className="text-[#00E5C7]">&gt;</span> {children}
			</Link>
		</Magnetic>
	);
}

/* one line of the contact terminal */
function TermRow({ label, href, value, external = true }: { label: string; href: string; value: string; external?: boolean }) {
	return (
		<div className="term-line flex flex-wrap items-baseline gap-x-3 py-1">
			<span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-[#8B93A1]">{label}</span>
			<Link
				href={href}
				target={external ? "_blank" : undefined}
				data-hover
				className="link-underline font-mono text-sm text-[#E4E7EB] transition-colors hover:text-[#00E5C7]"
			>
				{value}
			</Link>
		</div>
	);
}

/* ──────────────────────────────────────────────────────────── page ── */

export default function Page() {
	const scope = useRef<HTMLElement>(null);
	const firstName = DATA.name.split(" ")[0].toUpperCase();
	const lastName = DATA.name.split(" ").slice(1).join(" ").toUpperCase();

	// work log rendered most-recent-first; education follows on the same spine
	const work = [...DATA.work].reverse();

	useLayoutEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const ctx = gsap.context(() => {
			// HERO — fade/lift for everything except the name (which decrypts)
			gsap.set(".hero-fade", { opacity: 0, y: 24 });
			gsap.to(".hero-fade", {
				opacity: 1, y: 0, duration: 1, ease: "power3.out",
				stagger: 0.12, delay: 2.6, // waits for the preloader wipe
			});

			// generic staggered section reveals
			gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
				gsap.from(el, {
					y: 50, opacity: 0, duration: 0.9, ease: "power3.out",
					scrollTrigger: { trigger: el, start: "top 85%" },
				});
			});

			// timeline entries slide in against the drawn spine
			gsap.utils.toArray<HTMLElement>(".tl-entry").forEach((el) => {
				gsap.from(el, {
					x: -30, opacity: 0, duration: 0.8, ease: "power3.out",
					scrollTrigger: { trigger: el, start: "top 88%" },
				});
			});
			gsap.from(".timeline-line", {
				scaleY: 0, transformOrigin: "top", ease: "none",
				scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 85%", scrub: true },
			});

			// contact terminal types itself in line by line
			gsap.from(".term-line", {
				opacity: 0, x: -12, duration: 0.45, ease: "power2.out", stagger: 0.12,
				scrollTrigger: { trigger: ".terminal", start: "top 75%" },
			});

			// stat counters — animate 0 → data-count when scrolled into view
			gsap.utils.toArray<HTMLElement>(".counter").forEach((el) => {
				const target = parseInt(el.dataset.count || "0", 10);
				const o = { v: 0 };
				gsap.to(o, {
					v: target, duration: 1.6, ease: "power2.out",
					// "top bottom" so counters sitting in the hero status bar
					// (flush with the viewport edge) still fire on load
					scrollTrigger: { trigger: el, start: "top bottom" },
					onUpdate: () => {
						el.textContent = String(Math.round(o.v)).padStart(2, "0");
					},
				});
			});

			ScrollTrigger.refresh();
		}, scope);

		return () => ctx.revert();
	}, []);

	// real numbers only: years since first dev role (Feb 2023), shipped
	// project count and stack size straight from the data file
	const years = String(Math.max(1, new Date().getFullYear() - 2023)).padStart(2, "0");
	const projectsCount = String(DATA.projects.length).padStart(2, "0");
	const stackCount = String(DATA.skills.length).padStart(2, "0");

	return (
		<main ref={scope} className="relative z-10 text-[#E4E7EB]">
			{/* ════════════════════════════════ HERO ════════════════════════════
			    Poster layout: full-width name type with the figure layered
			    behind it, role/description in a tight left column, and all
			    stats + CTAs consolidated into a status bar pinned to the
			    bottom of the viewport. */}
			<section
				id="hero"
				className="relative flex min-h-[100svh] flex-col overflow-hidden"
			>
				{/* photo 1 — behind the type; feet disappear behind the status
				    bar so the figure reads as standing inside the interface */}
				<div className="pointer-events-none absolute bottom-0 right-[-3rem] z-0 h-[70svh] w-auto opacity-30 sm:right-[6vw] sm:h-[86svh] sm:opacity-90">
					<Image
						src="/photos/hero.png"
						alt="Marnel Valentin, standing with hands in pockets"
						width={444}
						height={1600}
						priority
						className="h-full w-auto select-none"
						style={{
							maskImage: "linear-gradient(to bottom, black 82%, transparent 99%)",
							WebkitMaskImage: "linear-gradient(to bottom, black 82%, transparent 99%)",
							filter: "grayscale(1) contrast(1.05)",
						}}
					/>
				</div>

				{/* main block — vertically centered above the status bar */}
				<div className="relative z-10 flex flex-1 flex-col justify-center px-6 pt-24 sm:px-12">
					<div className="hero-fade mb-8 flex items-center gap-3">
						<span className="inline-block size-1.5 animate-pulse rounded-full bg-[#00E5C7]" />
						<MonoLabel>
							signal: online · available for select projects · {DATA.location.split(",")[0]}
						</MonoLabel>
					</div>

					{/* name — poster type, decrypts character-by-character on load.
					    Solid teal for the second line (not text-stroke — Sora's
					    overlapping contours render artifacts as outlines). The
					    indent gives the two lines a diagonal flow. */}
					<h1 className="font-display text-[15vw] font-bold leading-[0.88] tracking-[-0.03em] sm:text-[11vw]">
						<DecryptText text={firstName} delay={2500} duration={1000} className="block" />
						<DecryptText
							text={lastName}
							delay={2800}
							duration={1200}
							className="signal-glow block text-[#00E5C7] sm:pl-[7vw]"
						/>
					</h1>

					{/* role + mission under the type, kept to a narrow column */}
					<div className="mt-10 max-w-md">
						<div className="hero-fade">
							<DecryptText
								text="SOFTWARE ENGINEER · DATA SCIENCE · SECURITY-MINDED"
								delay={3400}
								duration={900}
								trigger="mount"
								className="font-mono text-[11px] tracking-[0.3em] text-[#00E5C7] sm:text-xs"
							/>
						</div>
						<p className="hero-fade mt-5 text-balance text-base leading-relaxed text-[#8B93A1]">
							{DATA.description}
						</p>
					</div>
				</div>

				{/* status bar — full-bleed strip carrying the live counters,
				    the CTAs and the scroll hint */}
				<div className="hero-fade relative z-10 border-t border-[#1E2530] bg-[#0A0E14]/75 backdrop-blur">
					<div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 px-6 py-5 sm:px-12">
						{/* live stat counters, inline dashboard-style */}
						<div className="flex gap-5 sm:gap-14">
							{[
								[years, "yrs shipping"],
								[projectsCount, "deployments"],
								[stackCount, "stack tools"],
							].map(([n, label]) => (
								<div key={label} className="flex items-baseline gap-2 sm:gap-3">
									<span
										className="counter signal-glow font-display text-xl font-bold text-[#E4E7EB] sm:text-3xl"
										data-count={n}
									>
										00
									</span>
									<MonoLabel className="hidden sm:inline">{label}</MonoLabel>
									{/* short label so three counters fit a phone row */}
									<MonoLabel className="sm:hidden">{String(label).split(" ")[0]}</MonoLabel>
								</div>
							))}
						</div>

						<div className="hidden items-center gap-3 lg:flex">
							<span className="h-4 w-px animate-pulse bg-[#00E5C7]/40" />
							<MonoLabel>scroll to descend</MonoLabel>
						</div>

						<div className="flex flex-wrap gap-4">
							<TerminalButton href="#projects" primary>view_projects()</TerminalButton>
							<TerminalButton href="#contact">open_channel()</TerminalButton>
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════════════════════════ ABOUT ═══════════════════════════ */}
			<section id="about" className="relative px-6 py-32 sm:px-12 sm:py-44">
				<div className="mx-auto max-w-6xl">
					<SectionTag index="01" title="Profile" />

					<div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
						{/* photo 2 — free cutout, no panel; floating mono annotations
						    instead of a wrapper so the figure sits on the page itself */}
						<div className="reveal relative mx-auto w-full max-w-sm">
							<Image
								src="/photos/about.png"
								alt="Marnel Valentin holding a laptop with code on screen"
								width={741}
								height={1600}
								className="mx-auto h-auto w-full select-none"
								style={{
									maskImage: "linear-gradient(to bottom, black 86%, transparent 100%)",
									WebkitMaskImage: "linear-gradient(to bottom, black 86%, transparent 100%)",
									filter: "grayscale(1) contrast(1.05)",
								}}
							/>
							{/* callout in the empty space above the laptop, boxless */}
							<div className="absolute left-0 top-[9%] hidden items-center gap-3 sm:flex">
								<MonoLabel className="text-[#00E5C7]">subject: m.valentin</MonoLabel>
								<span className="h-px w-10 bg-[#00E5C7]/50" />
							</div>
							{/* callout: just under the laptop */}
							<div className="absolute left-0 top-[52%] hidden items-center gap-3 sm:flex">
								<MonoLabel>field: swe / data</MonoLabel>
								<span className="h-px w-10 bg-[#1E2530]" />
							</div>
						</div>

						{/* bio — verbatim from resume.tsx */}
						<div>
							<p className="reveal text-lg leading-relaxed text-[#E4E7EB]/90 sm:text-xl sm:leading-relaxed">
								{DATA.summary}
							</p>

							<div className="reveal mt-10 flex flex-wrap gap-3">
								<StatusChip tone="violet">
									<span className="inline-block size-1.5 animate-pulse rounded-full bg-[#7C6FFF]" />
									MS Data Science — in progress
								</StatusChip>
								<StatusChip tone="dim">BS Information Technology — 2019–2023</StatusChip>
								<StatusChip tone="dim">base: {DATA.location}</StatusChip>
								<StatusChip>
									<span className="inline-block size-1.5 animate-pulse rounded-full bg-[#00E5C7]" />
									open to select projects
								</StatusChip>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════════════════════════ SKILLS ══════════════════════════ */}
			<section id="skills" className="relative px-6 py-32 sm:px-12 sm:py-44">
				<div className="mx-auto max-w-6xl">
					<SectionTag index="02" title="Capability Matrix" />

					<div className="grid items-center gap-12 lg:grid-cols-2">
						<div className="reveal mx-auto w-full max-w-md">
							<SkillsRadar
								clusters={[
									{ label: "Software Engineering", value: 0.92, note: `${seSkills.length} tools · production` },
									{ label: "Data Science", value: 0.7, note: `${dsSkills.length} tools · ms coursework` },
									{ label: "Security", value: 0.34, note: "expanding · ms focus", color: VIOLET, provisional: true },
								]}
							/>
						</div>

						{/* the actual stack, grouped to match the radar clusters */}
						<div className="space-y-8">
							{[
								{ title: "software engineering", skills: seSkills, accent: true },
								{ title: "data science", skills: dsSkills, accent: true },
								{ title: "tooling & ai-assisted dev", skills: toolingSkills, accent: false },
							].map((g) => (
								<div key={g.title} className="reveal">
									<div className="mb-3 flex items-center gap-3">
										<span className={`h-px w-6 ${g.accent ? "bg-[#00E5C7]/60" : "bg-[#1E2530]"}`} />
										<MonoLabel>{g.title}</MonoLabel>
									</div>
									<div className="flex flex-wrap gap-2">
										{g.skills.map((s) => (
											<span
												key={s}
												className="border border-[#1E2530] bg-[#12161F] px-3 py-1.5 font-mono text-[11px] text-[#E4E7EB]/80 transition-colors duration-300 hover:border-[#00E5C7]/40 hover:text-[#00E5C7]"
											>
												{s}
											</span>
										))}
									</div>
								</div>
							))}
							{/* honest footnote for the violet vertex */}
							<p className="reveal font-mono text-[10px] uppercase tracking-[0.2em] text-[#8B93A1]">
								<span className="text-[#7C6FFF]">▲ security</span> — active focus area within the MS program
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════════════════════════ PROJECTS ════════════════════════ */}
			<section id="projects" className="relative px-6 py-32 sm:px-12 sm:py-44">
				<div className="mx-auto max-w-6xl">
					<div className="mb-10 flex items-end justify-between">
						<SectionTag index="03" title="Deployments" />
						<MonoLabel className="reveal hidden sm:block">hover any tile</MonoLabel>
					</div>
					<ProjectBento />
				</div>
			</section>

			{/* ═══════════════════ EXPERIENCE + EDUCATION ══════════════════════ */}
			<section id="experience" className="relative px-6 py-32 sm:px-12 sm:py-44">
				<div className="mx-auto max-w-5xl">
					<SectionTag index="04" title="Operation Log" />

					<div className="timeline relative pl-8 sm:pl-14">
						{/* spine drawn by ScrollTrigger as you scroll */}
						<div className="timeline-line absolute left-1.5 top-2 h-full w-px bg-gradient-to-b from-[#00E5C7] via-[#1E2530] to-transparent sm:left-3" />

						{work.map((w, i) => (
							<div key={i} className="tl-entry relative mb-14 last:mb-0">
								<span className="absolute -left-[31px] top-1.5 size-2.5 bg-[#00E5C7] shadow-[0_0_12px_rgba(0,229,199,0.6)] sm:-left-[50px]" />
								<div className="font-mono text-[11px] tracking-[0.2em] text-[#00E5C7]">
									[{w.start} — {(w.end ?? "PRESENT").toUpperCase()}]
								</div>
								<h3 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
									{w.title}
								</h3>
								<div className="mt-1 font-mono text-xs text-[#8B93A1]">
									{w.company} · {w.location}
								</div>
								<p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#8B93A1]">
									{w.description}
								</p>
							</div>
						))}

						{/* education on the same spine */}
						<div className="tl-entry relative mb-8 mt-20">
							<MonoLabel>── education ──</MonoLabel>
						</div>
						{DATA.education.map((e, i) => {
							const inProgress = e.end === "Present";
							return (
								<div key={i} className="tl-entry relative mb-12 last:mb-0">
									<span
										className={`absolute -left-[31px] top-1.5 size-2.5 sm:-left-[50px] ${
											inProgress ? "bg-[#7C6FFF] shadow-[0_0_12px_rgba(124,111,255,0.6)]" : "bg-[#8B93A1]"
										}`}
									/>
									<div className="font-mono text-[11px] tracking-[0.2em] text-[#00E5C7]">
										[{e.start} — {e.end.toUpperCase()}]
									</div>
									<h3 className="mt-2 font-display text-xl font-semibold tracking-tight sm:text-2xl">
										{e.degree}
									</h3>
									<div className="mt-1 flex flex-wrap items-center gap-3">
										<span className="font-mono text-xs text-[#8B93A1]">{e.school}</span>
										{inProgress && <StatusChip tone="violet">in progress</StatusChip>}
									</div>
								</div>
							);
						})}
					</div>

					{/* DICT certifications — compact mono index */}
					<div className="reveal mt-20">
						<MonoLabel>certifications — dict</MonoLabel>
						<div className="mt-4 grid gap-px border border-[#1E2530] bg-[#1E2530] sm:grid-cols-2">
							{DATA.trainings.map((t, i) => (
								<Link
									key={i}
									href={t.links[0]?.href ?? "#"}
									target="_blank"
									data-hover
									className="group flex items-center justify-between gap-4 bg-[#12161F] px-5 py-4 transition-colors hover:bg-[#161b26]"
								>
									<div>
										<div className="font-mono text-xs text-[#E4E7EB] transition-colors group-hover:text-[#00E5C7]">
											{t.title}
										</div>
										<div className="mt-1 font-mono text-[10px] tracking-[0.15em] text-[#8B93A1]">
											{t.dates}
										</div>
									</div>
									<span className="shrink-0 font-mono text-[10px] text-[#8B93A1] transition-colors group-hover:text-[#00E5C7]">
										cert ↗
									</span>
								</Link>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ═══════════════════════════════ CONTACT ═════════════════════════ */}
			<section
				id="contact"
				className="relative flex min-h-[90svh] flex-col justify-center px-6 py-32 sm:px-12"
			>
				<div className="mx-auto w-full max-w-4xl">
					<SectionTag index="05" title="Open Channel" />

					{/* terminal window */}
					<div className="terminal reveal overflow-hidden border border-[#1E2530] bg-[#12161F]/90 backdrop-blur">
						{/* title bar */}
						<div className="flex items-center gap-2 border-b border-[#1E2530] px-4 py-3">
							<span className="size-2.5 rounded-full bg-[#1E2530]" />
							<span className="size-2.5 rounded-full bg-[#1E2530]" />
							<span className="size-2.5 rounded-full bg-[#00E5C7]/60" />
							<span className="ml-3 font-mono text-[10px] tracking-[0.2em] text-[#8B93A1]">
								marnel@perimeter: ~
							</span>
						</div>

						<div className="p-6 sm:p-8">
							<div className="term-line font-mono text-sm text-[#8B93A1]">
								<span className="text-[#00E5C7]">$</span> send_message()
							</div>

							<div className="mt-5 space-y-1 border-l border-[#1E2530] pl-5">
								<TermRow label="email" href={`mailto:${DATA.contact.email}`} value={DATA.contact.email} external={false} />
								<TermRow label="phone" href={`tel:${DATA.contact.phone}`} value={DATA.contact.phone} external={false} />
								{Object.entries(DATA.contact.social)
									.filter(([, s]) => s.navbar)
									.map(([name, s]) => (
										<TermRow key={name} label={name.toLowerCase()} href={s.url} value={`/${name.toLowerCase()}`} />
									))}
								<TermRow label="resume" href="/resume.pdf" value="cat resume.pdf" />
							</div>

							<div className="term-line mt-6 font-mono text-sm text-[#8B93A1]">
								<span className="text-[#00E5C7]">$</span> await response
								<span className="caret" />
							</div>
						</div>
					</div>

					<div className="reveal mt-10 flex flex-wrap gap-4">
						<TerminalButton href={`mailto:${DATA.contact.email}`} primary>
							initiate_contact()
						</TerminalButton>
						<TerminalButton href="/resume.pdf" external>
							download_resume()
						</TerminalButton>
					</div>

					<footer className="mt-24 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-[#8B93A1]/70">
						<span>© {new Date().getFullYear()} Marnel Valentin</span>
						<span className="hidden sm:inline">Next.js · GSAP · Three.js</span>
						<span>end transmission</span>
					</footer>
				</div>
			</section>
		</main>
	);
}
