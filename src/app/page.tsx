"use client";

import { useLayoutEffect } from "react";
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

				{/* SECTIONS-END */}
			</main>
		</>
	);
}
