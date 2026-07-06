"use client";

import { useEffect, useRef, useState } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   BOOT GATE — the full-screen "boot sequence" shown when the home page
   loads. Types POST-style lines, flashes "SYSTEM READY", then wipes
   away to reveal the site.

   - Home page only (mounted from page.tsx, not the layout) so /blog
     stays instant.
   - Shown once per tab session (sessionStorage "boot.seen"); repeat
     navigations skip straight to the page.
   - Click / Enter / Escape skips it.
   - When finished it stamps <html data-booted="1"> and fires a
     "bootdone" window event — the hero listens for that to start its
     own reveal, so the two never overlap.
   ═══════════════════════════════════════════════════════════════════ */

const BOOT_LINES = [
	"BIOS v5.2 — MV SYSTEMS",
	"mem check ............... OK",
	"loading /usr/marnel ..... OK",
	"mounting portfolio ...... OK",
	"init display: phosphor_green",
	"",
	"SYSTEM READY_",
];

const CHAR_MS = 8;
const LINE_MS = 90;

// flat character offsets where a new line begins (for the longer pause)
const LINE_BOUNDARIES = new Set(
	BOOT_LINES.reduce<number[]>((acc, l) => {
		acc.push((acc[acc.length - 1] ?? 0) + l.length + 1);
		return acc;
	}, [])
);

function finishSignal() {
	document.documentElement.dataset.booted = "1";
	window.dispatchEvent(new Event("bootdone"));
}

export default function BootGate() {
	// null = undecided (SSR), true = play boot, false = skip
	const [active, setActive] = useState<boolean | null>(null);
	const [leaving, setLeaving] = useState(false);
	const [progress, setProgress] = useState(0);
	const doneRef = useRef(false);

	const total = BOOT_LINES.reduce((n, l) => n + l.length + 1, 0);

	// Decide on mount whether to play (avoids SSR/client mismatch).
	useEffect(() => {
		const seen = sessionStorage.getItem("boot.seen") === "1";
		setActive(!seen);
		if (seen) finishSignal();
	}, []);

	// Typing loop.
	useEffect(() => {
		if (!active || progress >= total) return;
		const id = setTimeout(
			() => setProgress((p) => p + 1),
			LINE_BOUNDARIES.has(progress) ? LINE_MS : CHAR_MS
		);
		return () => clearTimeout(id);
	}, [active, progress, total]);

	// Wrap up once fully typed (small hold so READY registers).
	useEffect(() => {
		if (!active || progress < total) return;
		const id = setTimeout(finish, 450);
		return () => clearTimeout(id);
	}, [active, progress, total]);

	function finish() {
		if (doneRef.current) return;
		doneRef.current = true;
		sessionStorage.setItem("boot.seen", "1");
		setLeaving(true);
		finishSignal();
		// matches the css wipe duration below
		setTimeout(() => setActive(false), 650);
	}

	// Skip handlers.
	useEffect(() => {
		if (!active) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Enter" || e.key === "Escape") finish();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [active]);

	if (!active) return null;

	// Reveal lines according to the flat progress counter.
	let remaining = progress;
	const rendered = BOOT_LINES.map((line) => {
		const take = Math.max(0, Math.min(line.length + 1, remaining));
		remaining -= take;
		return line.slice(0, take);
	});

	return (
		<div
			onClick={finish}
			className={`fixed inset-0 z-[90] flex cursor-pointer items-center bg-boot px-8 font-mono text-sm text-phos transition-[clip-path] duration-[650ms] ease-in ${
				leaving
					? "[clip-path:inset(0_0_100%_0)]"
					: "[clip-path:inset(0_0_0_0)]"
			}`}
			role="button"
			aria-label="Skip boot animation"
		>
			<div className="mx-auto w-full max-w-md">
				{rendered.map((txt, i) =>
					txt.length === 0 && progress < total ? null : (
						<div
							key={i}
							className={`whitespace-pre leading-loose ${
								BOOT_LINES[i].startsWith("SYSTEM")
									? "phos-glow mt-2 text-base"
									: "text-phos/70"
							}`}
						>
							{txt || " "}
						</div>
					)
				)}
				<div className="mt-8 text-[10px] tracking-[0.3em] text-phos/30">
					[ CLICK TO SKIP ]
				</div>
			</div>
		</div>
	);
}
