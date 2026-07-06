# Boot Sequence Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the half-built "Boot Sequence" terminal/hacker-OS redesign: wire the existing `src/components/boot/` kit into the theme, layout, and home page; add a footer scene; restyle the blog; remove the superseded arcade/Signal designs.

**Architecture:** Next.js 16 App Router. A phosphor-green token layer (Tailwind v3 + CSS utilities) feeds 11 prebuilt client components. `layout.tsx` hosts the persistent HUD chrome; `page.tsx` is a client page of five sections driven by GSAP ScrollTrigger, with Three.js (react-three-fiber) for the project drum and footer scene. All copy reads from `src/data/resume.tsx`.

**Tech Stack:** Next 16, React 19, Tailwind 3.4, GSAP 3.12 + ScrollTrigger, Lenis, three + @react-three/fiber, vitest (jsdom).

**Spec:** `docs/superpowers/specs/2026-07-06-boot-sequence-redesign-design.md`

## Global Constraints

- All copy comes from `src/data/resume.tsx` (plus facts Marnel stated directly: MS Data Science in progress, security-leaning). Never invent or delete content.
- `npm run build` must pass at every commit; the site must render at every commit.
- Comment new code (match the boot kit's comment style: block header per component, short inline notes).
- Accent: `phos #00FF6A` on `boot #010603`; readable text `pale #C8FFDD`. No second hue.
- Portrait cutouts render free-floating (dithered canvas) — no panels/borders/wrappers around them.
- Solid fills for display type — no `-webkit-text-stroke` (renders artifacts).
- Font CSS variables keep their names: `--font-display`, `--font-sans`, `--font-mono`.
- Tab width in this repo is tabs (see existing files); match it.

---

### Task 1: Checkpoint commit

**Files:** none created/modified — commits the entire current working tree.

**Interfaces:**
- Consumes: nothing.
- Produces: a git commit preserving the Signal/Perimeter design + unwired boot kit + photos, so later deletions are recoverable.

- [ ] **Step 1: Verify the tree state matches expectations**

Run: `git status --short | head -40`
Expected: modified files (`package.json`, `src/app/*`, `src/components/*`, `tsconfig.json`) and untracked `public/my-pic*.png`, `public/photos/`, `src/components/boot/`, `src/components/signal/`.

- [ ] **Step 2: Commit everything**

```bash
git add -A
git commit -m "checkpoint: signal/perimeter design + unwired boot-sequence kit

Snapshot before the boot-sequence redesign replaces the signal/perimeter
home page and the arcade entry experience. Everything here stays
recoverable from this commit.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

- [ ] **Step 3: Confirm build is green at the checkpoint**

Run: `npm run build`
Expected: exit 0. (If it fails, fix nothing yet — report; the checkpoint must reflect reality.)

---

### Task 2: Phosphor theme layer (additive)

**Files:**
- Modify: `tailwind.config.ts` (colors block, ~line 25)
- Modify: `src/app/globals.css` (`.dark` block lines 44–72; append utilities)

**Interfaces:**
- Consumes: nothing.
- Produces: Tailwind colors `phos`, `pale`, `boot` (usable as `text-phos/70`, `bg-boot`, …); CSS classes `.phos-glow`, `.term-caret`, `.crt-scanlines`, `.crt-vignette`, `.scroll-cue`; `html[data-fx="on"]` gating. The boot kit components already reference all of these names.

This task is **additive** — the old design still renders afterward (it uses hard-coded hex classes, not these tokens).

- [ ] **Step 1: Add the three palette tokens to Tailwind**

In `tailwind.config.ts`, inside `theme.extend.colors`, add at the top of the object:

```ts
			colors: {
				/* ── Boot Sequence phosphor palette ─────────────────────
				   phos — the single glowing accent (all UI derives from it)
				   pale — "lit phosphor" body text, readable at length
				   boot — near-black with a faint green cast              */
				phos: "#00FF6A",
				pale: "#C8FFDD",
				boot: "#010603",
				border: "hsl(var(--border))",
				/* …rest unchanged… */
```

- [ ] **Step 2: Repoint the `.dark` CSS variables at the phosphor palette**

Replace the whole `.dark { … }` block in `src/app/globals.css` (currently the Signal/Perimeter values, lines 39–72 including the comment) with:

```css
	/* ── "Boot Sequence" dark theme ──────────────────────────────────
	   bg #010603 · text #C8FFDD · accent #00FF6A (phosphor green)
	   One hue only; everything else is that hue at lower saturation.
	   These vars restyle the blog + shadcn/ui pieces for free.        */
	.dark {
		--background: 144 71% 1%;        /* #010603 boot black */
		--foreground: 143 100% 89%;      /* #C8FFDD pale phosphor */

		--card: 144 45% 3%;
		--card-foreground: 143 100% 89%;

		--popover: 144 45% 3%;
		--popover-foreground: 143 100% 89%;

		--primary: 145 100% 50%;         /* #00FF6A */
		--primary-foreground: 144 71% 1%;

		--secondary: 145 35% 8%;
		--secondary-foreground: 143 100% 89%;

		--muted: 145 35% 8%;
		--muted-foreground: 145 15% 55%; /* dim green-gray */

		--accent: 145 100% 50%;
		--accent-foreground: 144 71% 1%;

		--destructive: 0 62% 40%;
		--destructive-foreground: 143 100% 89%;

		--border: 145 55% 11%;           /* hairline */
		--input: 145 55% 11%;
		--ring: 145 100% 50%;
	}
```

- [ ] **Step 3: Append the CRT / terminal utilities**

Append inside the existing `@layer utilities { … }` block in `globals.css` (after `.eyebrow`):

```css
	/* ── Boot Sequence utilities ─────────────────────────────────── */

	/* soft phosphor bloom on key text */
	.phos-glow {
		text-shadow: 0 0 8px rgba(0, 255, 106, 0.55), 0 0 26px rgba(0, 255, 106, 0.22);
	}

	/* blinking block cursor used by typed-log / boot-gate */
	.term-caret {
		display: inline-block;
		width: 0.55em;
		height: 1em;
		margin-left: 0.15em;
		background: #00ff6a;
		vertical-align: -0.15em;
		animation: caret-blink 1.05s steps(1) infinite;
	}

	/* CRT overlays — rendered by hud-frame, switched by the FX toggle
	   via html[data-fx] so no React re-render is needed */
	.crt-scanlines {
		position: absolute;
		inset: 0;
		display: none;
		background: repeating-linear-gradient(
			to bottom,
			rgba(0, 255, 106, 0.045) 0px,
			rgba(0, 255, 106, 0.045) 1px,
			transparent 1px,
			transparent 3px
		);
	}
	.crt-vignette {
		position: absolute;
		inset: 0;
		display: none;
		background: radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.55) 100%);
	}
	html[data-fx="on"] .crt-scanlines {
		display: block;
		animation: crt-flicker 6s steps(1) infinite;
	}
	html[data-fx="on"] .crt-vignette {
		display: block;
	}
	/* occasional two-frame brightness dip — subtle, not strobing */
	@keyframes crt-flicker {
		0%, 93%, 95.5%, 100% { opacity: 1; }
		94%, 95% { opacity: 0.75; }
	}

	/* hero scroll cue */
	@keyframes cue-float {
		0%, 100% { transform: translateY(0); opacity: 0.55; }
		50% { transform: translateY(6px); opacity: 1; }
	}
	.scroll-cue {
		display: inline-block;
		animation: cue-float 2.4s ease-in-out infinite;
	}
```

(The `caret-blink` keyframes already exist in this layer — reuse, don't duplicate.)

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: exit 0.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat(boot): phosphor theme tokens + CRT/terminal utilities

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: App shell swap (`layout.tsx`)

**Files:**
- Modify: `src/app/layout.tsx` (whole file)

**Interfaces:**
- Consumes: `FxProvider` (default export, `{children}`), `HudFrame` (default, no props), `RainOverlay` (default, no props), `SmoothScroll` (default, `{children}`) from `@/components/boot/*`; Tailwind tokens from Task 2.
- Produces: the app shell every route renders in. Removes `ArcadeRoot`, `Preloader`, `Cursor`, `Hud`, `Background` from the tree of live imports (files still exist until Task 9).

Transitional note: after this task the old Signal home page renders inside the new HUD frame until Task 4 replaces it. That's fine — it builds and renders.

- [ ] **Step 1: Replace `layout.tsx`**

Keep the `metadata` export exactly as-is. Replace imports, fonts, and the component tree:

```tsx
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Archivo_Black, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import FxProvider from "@/components/boot/fx-context";
import HudFrame from "@/components/boot/hud-frame";
import RainOverlay from "@/components/boot/rain-overlay";
import SmoothScroll from "@/components/boot/smooth-scroll";
import "./globals.css";

/* "Boot Sequence" type stack:
   Archivo Black → the massive hero display face (solid fills only)
   JetBrains Mono → nearly everything else: labels, logs, UI, body
   Inter → long-form prose on the blog, where mono tires the eye
   Variable names are kept from the previous design so existing
   components pick the fonts up without edits. */
const display = Archivo_Black({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-display",
	display: "swap",
});

const body = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	/* … unchanged from current file … */
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn("dark", body.variable, mono.variable, display.variable)}
		>
			<body className="relative min-h-screen overflow-x-hidden bg-boot font-mono text-pale antialiased">
				{/* FxProvider mirrors the CRT toggle onto <html data-fx>;
				    HudFrame + RainOverlay are fixed chrome on every route. */}
				<FxProvider>
					<HudFrame />
					<RainOverlay />
					<SmoothScroll>{children}</SmoothScroll>
				</FxProvider>
				<Analytics />
			</body>
		</html>
	);
}
```

- [ ] **Step 2: Verify build and dev render**

Run: `npm run build`
Expected: exit 0.
Run: `npm run dev` (background), then `curl -s localhost:3000 | grep -o "FX·"` — expected: `FX·` present (HUD frame server-rendered). Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(boot): swap app shell to HUD frame + fx/rain; retire arcade/preloader mounts

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Home page rewrite — hero + motion plumbing

**Files:**
- Modify: `src/app/page.tsx` (full replacement)

**Interfaces:**
- Consumes: `BootGate` (default, no props), `DitherPortrait` (`{src, cols?, dot?, color?, opacity?, className?, alt?}`), `ScrambleCycle` (`{words, holdMs?, startDelay?, className?}`), `TypedLog` (`{lines, charMs?, lineGapMs?, startDelay?, className?}`), `triggerRain()` from `@/components/boot/rain-overlay`.
- Produces: `page.tsx` with helpers `SectionTag({index, title})` and `Chip({children})` and the `.reveal` / `[data-rain]` GSAP conventions that Tasks 5–7 rely on; a `{/* SECTIONS-END */}` marker comment where later tasks insert sections.

- [ ] **Step 1: Replace `page.tsx` in full**

```tsx
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
   - `.reveal`   → fades/slides in when scrolled into view
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
```

- [ ] **Step 2: Verify build + boot flow in the browser**

Run: `npm run build` → exit 0.
Run dev server; load `/`: boot gate types BIOS lines then wipes; name reveals after; corner labels scramble; typed log runs; reload in same tab skips the gate. Check `/blog` loads with no gate.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(boot): rebuild home hero — boot gate, dithered portrait, scramble corners, typed log

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: About + Ops Log sections

**Files:**
- Modify: `src/app/page.tsx` (insert before `{/* SECTIONS-END */}`)

**Interfaces:**
- Consumes: `SectionTag`, `Chip`, `DitherPortrait`, `TypedLog` (already in the file); `DATA.summary`, `DATA.skills`, `DATA.work[]` (`company,title,location,href,start,end,description`), `DATA.education[]` (`school,degree,href,start,end`).
- Produces: sections `#about`, `#ops` — no exports.

- [ ] **Step 1: Add `Link` import**

Add `import Link from "next/link";` to the imports in `page.tsx`.

- [ ] **Step 2: Insert the two sections before `{/* SECTIONS-END */}`**

```tsx
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
```

- [ ] **Step 3: Verify build + render**

Run: `npm run build` → exit 0. In the browser: about text is `DATA.summary` verbatim; all 4 work entries and both degrees render; rain bursts when scrolling between sections (FX on).

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(boot): about + ops-log/education sections as terminal log entries

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Projects section — drum + HTML index

**Files:**
- Modify: `src/app/page.tsx` (import + insert before `{/* SECTIONS-END */}`)

**Interfaces:**
- Consumes: `ProjectDrum` (default export, no props — reads `DATA.projects` itself); `DATA.projects[]` (`title,dates,description,technologies[],links[{type,href}]`).
- Produces: section `#projects`.

- [ ] **Step 1: Add the import**

`import ProjectDrum from "@/components/boot/project-drum";`

- [ ] **Step 2: Insert the section before `{/* SECTIONS-END */}`**

```tsx
				{/* ── [04] PROJECT ARCHIVE ──────────────────────────────── */}
				<section id="projects" data-rain className="mx-auto max-w-6xl px-6 py-28">
					<SectionTag index="04" title="project archive" />

					{/* 3D drum — drag or use the ‹ › buttons to rotate */}
					<div className="reveal">
						<ProjectDrum />
					</div>

					{/* plain HTML index — SEO + fallback when WebGL is unavailable */}
					<ol className="mt-16 divide-y divide-phos/10 border-y border-phos/10">
						{DATA.projects.map((project, i) => (
							<li
								key={project.title}
								className="reveal grid gap-3 py-6 sm:grid-cols-[56px_1fr_auto] sm:gap-6"
							>
								<span className="font-mono text-xs text-phos/50">
									{String(i + 1).padStart(2, "0")}
								</span>
								<div>
									<h3 className="font-mono text-sm font-bold uppercase tracking-[0.06em] text-pale">
										{project.title}
									</h3>
									<p className="mt-1 max-w-prose font-mono text-xs leading-relaxed text-pale/70">
										{project.description}
									</p>
									<p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-phos/60">
										{project.technologies.join(" · ")}
									</p>
								</div>
								<div className="flex items-start gap-3 font-mono text-xs">
									{project.links.map((link) => (
										<Link
											key={link.type}
											href={link.href || "#"}
											target="_blank"
											className="text-phos/70 underline-offset-4 transition-colors hover:text-phos hover:underline"
										>
											[{link.type.toLowerCase()}]
										</Link>
									))}
								</div>
							</li>
						))}
					</ol>
				</section>
```

- [ ] **Step 3: Verify build + drum interaction**

Run: `npm run build` → exit 0. Browser: drum renders all projects on wireframe panels; drag spins and snaps; ‹ › buttons step; active project readout + links update; HTML index lists every project.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(boot): project drum section with plain-HTML index fallback

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: FooterWire scene + contact/footer section

**Files:**
- Create: `src/components/boot/footer-wire.tsx`
- Modify: `src/app/page.tsx` (imports + insert before `{/* SECTIONS-END */}`)

**Interfaces:**
- Consumes: `PixelMark` (`{size?, className?}`), `DATA.contact.email`, `DATA.contact.social` (record of `{name, url, icon, navbar}`).
- Produces: `FooterWire` default export, props `{ className?: string }` — a decorative R3F canvas.

- [ ] **Step 1: Create `src/components/boot/footer-wire.tsx`**

```tsx
"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER WIRE — quiet closing scene behind the footer: a slowly
   rotating wireframe icosphere over a faint static particle field.
   Deliberately dimmer and slower than the hero/drum; purely decorative
   (aria-hidden), so it renders nothing meaningful to assistive tech.
   ═══════════════════════════════════════════════════════════════════ */

const PHOS = "#00ff6a";

function Scene() {
	const ico = useRef<THREE.Mesh>(null);
	const pts = useRef<THREE.Points>(null);

	// sparse field spread wider than the sphere so edges stay soft
	const positions = useMemo(() => {
		const arr = new Float32Array(220 * 3);
		for (let i = 0; i < arr.length; i += 3) {
			arr[i] = (Math.random() - 0.5) * 9;
			arr[i + 1] = (Math.random() - 0.5) * 4.5;
			arr[i + 2] = (Math.random() - 0.5) * 4;
		}
		return arr;
	}, []);

	useFrame((_, dt) => {
		if (ico.current) {
			ico.current.rotation.y += dt * 0.12;
			ico.current.rotation.x += dt * 0.05;
		}
		if (pts.current) pts.current.rotation.y += dt * 0.01;
	});

	return (
		<>
			<mesh ref={ico}>
				<icosahedronGeometry args={[1.35, 1]} />
				<meshBasicMaterial color={PHOS} wireframe transparent opacity={0.22} />
			</mesh>
			<points ref={pts}>
				<bufferGeometry>
					<bufferAttribute attach="attributes-position" args={[positions, 3]} />
				</bufferGeometry>
				<pointsMaterial color={PHOS} size={0.02} transparent opacity={0.4} sizeAttenuation />
			</points>
		</>
	);
}

export default function FooterWire({ className }: { className?: string }) {
	return (
		<div className={className} aria-hidden>
			<Canvas
				camera={{ position: [0, 0, 5], fov: 40 }}
				dpr={[1, 1.5]}
				gl={{ antialias: true, alpha: true }}
				fallback={null}
			>
				<Scene />
			</Canvas>
		</div>
	);
}
```

- [ ] **Step 2: Add imports to `page.tsx`**

```tsx
import PixelMark from "@/components/boot/pixel-mark";
import FooterWire from "@/components/boot/footer-wire";
```

- [ ] **Step 3: Insert the footer before `{/* SECTIONS-END */}`**

```tsx
				{/* ── [05] CONTACT / FOOTER ─────────────────────────────── */}
				<footer
					id="contact"
					data-rain
					className="relative overflow-hidden border-t border-phos/15 px-6 py-24"
				>
					{/* rotating wireframe icosphere + particles, behind the text */}
					<FooterWire className="pointer-events-none absolute inset-0 opacity-60" />

					<div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center gap-8 text-center">
						<PixelMark size={44} className="reveal text-phos" />

						<div className="reveal">
							<div className="font-display text-2xl uppercase tracking-wide text-pale">
								{DATA.name}
							</div>
							<div className="mt-2 font-mono text-[11px] uppercase tracking-[0.25em] text-phos/60">
								software engineer · {DATA.location}
							</div>
						</div>

						<a
							href={`mailto:${DATA.contact.email}`}
							className="reveal border border-phos/40 px-6 py-3 font-mono text-xs tracking-[0.2em] text-phos transition-colors hover:border-phos"
						>
							&gt; SEND_TRANSMISSION — {DATA.contact.email}
						</a>

						{/* social links in outlined squares */}
						<div className="reveal flex gap-3">
							{Object.values(DATA.contact.social)
								.filter((social) => social.navbar)
								.map((social) => {
									const Icon = social.icon;
									return (
										<Link
											key={social.name}
											href={social.url}
											target="_blank"
											aria-label={social.name}
											className="flex h-10 w-10 items-center justify-center border border-phos/30 text-phos/70 transition-colors hover:border-phos hover:text-phos"
										>
											<Icon className="size-4" />
										</Link>
									);
								})}
						</div>

						<div className="reveal font-mono text-[10px] tracking-[0.3em] text-phos/40">
							© {new Date().getFullYear()} — SYSTEM ONLINE
						</div>
					</div>
				</footer>
```

- [ ] **Step 4: Verify build + render**

Run: `npm run build` → exit 0. Browser: icosphere rotates slowly behind footer; 4 social squares link out; mailto works; footer is visually quieter than the hero.

- [ ] **Step 5: Commit**

```bash
git add src/components/boot/footer-wire.tsx src/app/page.tsx
git commit -m "feat(boot): footer with pixel logomark, social squares, wireframe icosphere

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Blog restyle

**Files:**
- Modify: `src/app/blog/page.tsx` (heading + list item classes)
- Modify: `src/app/blog/[slug]/page.tsx` (heading/date/article classes only — data logic untouched)

**Interfaces:**
- Consumes: theme vars from Task 2 (most restyling is already inherited via `--foreground`/`--muted-foreground`).
- Produces: nothing new — visual pass only.

- [ ] **Step 1: Restyle the blog index**

In `src/app/blog/page.tsx`, replace the `<h1>`:

```tsx
			<BlurFade delay={BLUR_FADE_DELAY}>
				<h1 className="mb-10 font-mono text-sm uppercase tracking-[0.35em] text-phos">
					[log] blog
				</h1>
			</BlurFade>
```

and the list-item inner block:

```tsx
							<div className="w-full flex flex-col">
								<p className="font-mono text-sm tracking-tight text-pale transition-colors hover:text-phos">
									{post.metadata.title}
								</p>
								<p className="h-6 font-mono text-xs text-phos/50">
									{post.metadata.publishedAt}
								</p>
							</div>
```

- [ ] **Step 2: Restyle the post page**

In `src/app/blog/[slug]/page.tsx`, replace the `<h1>` className with:

```tsx
			<h1 className="max-w-[650px] font-mono text-2xl font-bold uppercase tracking-tight text-pale">
```

the date `<p>` className with:

```tsx
					<p className="font-mono text-xs text-phos/60">
```

and the `<article>` className with (prose stays Inter via `font-sans` for readability):

```tsx
			<article
				className="prose prose-invert font-sans prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-tight prose-a:text-phos prose-code:text-pale prose-hr:border-phos/15"
				dangerouslySetInnerHTML={{ __html: post.source }}
			></article>
```

- [ ] **Step 3: Verify build + both blog routes**

Run: `npm run build` → exit 0. Browser: `/blog` lists posts in phosphor style; a post page renders readable prose (Inter body, mono headings, green links); direct deep-link shows no boot gate.

- [ ] **Step 4: Commit**

```bash
git add src/app/blog/page.tsx "src/app/blog/[slug]/page.tsx"
git commit -m "feat(boot): restyle blog index + posts to phosphor palette

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: Remove superseded designs + keep vitest non-empty

**Files:**
- Create: `src/components/boot/pixel-mark.test.tsx`
- Delete: `src/components/arcade/`, `src/components/experience/`, `src/components/signal/`, `src/components/three/`, `src/lib/arcade/`
- Modify: `src/app/globals.css` (remove dead utilities)

**Interfaces:**
- Consumes: `PixelMark` from Task 7's imports (unchanged component).
- Produces: a leaner tree; vitest still has a suite after the arcade tests go.

- [ ] **Step 1: Write the boot-kit test FIRST (so vitest never hits zero tests)**

Create `src/components/boot/pixel-mark.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PixelMark from "./pixel-mark";

/* PixelMark is pure SVG-from-data, so static markup is enough to verify
   the glyph grid renders and stays accessible. */
describe("PixelMark", () => {
	it("renders lit pixels as rects with an MV label", () => {
		const html = renderToStaticMarkup(<PixelMark size={20} />);
		const rects = html.match(/<rect/g) ?? [];
		expect(rects.length).toBeGreaterThan(0);
		expect(html).toContain('aria-label="MV"');
		expect(html).toContain('role="img"');
	});

	it("scales width from the size prop and the 11-column grid", () => {
		const html = renderToStaticMarkup(<PixelMark size={55} />);
		// 55px tall / 5 rows = 11px cells × 11 cols = 121px wide
		expect(html).toContain('width="121"');
		expect(html).toContain('height="55"');
	});
});
```

- [ ] **Step 2: Run the new test alongside the arcade suite**

Run: `npx vitest run src/components/boot/pixel-mark.test.tsx`
Expected: 2 passed.

- [ ] **Step 3: Delete the superseded directories**

```bash
git rm -r src/components/arcade src/components/experience src/components/signal src/components/three src/lib/arcade
```

- [ ] **Step 4: Confirm nothing still imports them**

Run: `grep -rn "components/arcade\|components/experience\|components/signal\|components/three\|lib/arcade" src`
Expected: no matches. (If any appear, fix that import — it's a missed rewrite.)

- [ ] **Step 5: Strip dead CSS utilities**

For each of these `globals.css` blocks, grep the codebase for usage and delete the block if only `globals.css` mentions it (expected for all): `.signal-grid`, `.scanlines` (hover variant), `@keyframes glitch-slice` + `.glitch-once`, `.signal-glow`, `.grain` (both blocks), `.reveal-wipe` + its keyframes, `.caret` (old 2px cursor — superseded by `.term-caret`; keep the shared `@keyframes caret-blink`), `.link-underline`, `.eyebrow`, `@keyframes boot-flicker` + `.boot-flicker` (arcade-only).

Verify with e.g.: `grep -rn "signal-grid\|glitch-once\|signal-glow\|reveal-wipe\|link-underline\|eyebrow\|boot-flicker" src --include="*.tsx"` → no matches.

- [ ] **Step 6: Full verification**

Run: `npm run build` → exit 0.
Run: `npm test` → only the pixel-mark suite runs, 2 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(boot): remove arcade/signal/experience/three designs; add pixel-mark test

Superseded by the boot-sequence design; all recoverable from the
checkpoint commit.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: End-to-end verification pass

**Files:** none (fixes only if something fails).

**Interfaces:**
- Consumes: everything above.
- Produces: verified, shippable branch state.

- [ ] **Step 1: Static checks**

```bash
npm run build && npm test && npm run lint
```
Expected: build 0, tests pass, lint reports no NEW errors (pre-existing warnings unrelated to touched files are acceptable — note them).

- [ ] **Step 2: Server-rendered content check**

Start dev server, then:

```bash
curl -s localhost:3000 | grep -c "MARNEL\|Marnel"      # ≥ 1 (name in HTML)
curl -s localhost:3000 | grep -o "BatStateU RMS"       # project index is SSR'd
curl -s -o /dev/null -w "%{http_code}" localhost:3000/blog   # 200
```

- [ ] **Step 3: Browser flow check (real interaction, not just curl)**

On `/`: boot gate types + wipes; Esc skips it; same-tab reload skips it; hero name + dither portrait + scramble corners + typed log; scroll → rain bursts between sections, reveals fire; drum drags/snaps and buttons step; FX toggle OFF removes scanlines/rain instantly and persists across reload; footer icosphere rotates. Emulate `prefers-reduced-motion: reduce` in a fresh profile → FX defaults OFF.

- [ ] **Step 4: Report results**

Summarize what passed/failed with evidence (per superpowers:verification-before-completion). Fix anything broken before claiming done.
