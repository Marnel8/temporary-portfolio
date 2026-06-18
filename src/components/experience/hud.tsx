"use client";

import { useEffect, useState } from "react";
import { scrollState } from "@/lib/scroll-store";

const NAV = [
	{ id: "hero", label: "Start" },
	{ id: "about", label: "Profile" },
	{ id: "experience", label: "Log" },
	{ id: "projects", label: "Builds" },
	{ id: "contact", label: "Signal" },
];

export default function Hud() {
	const [pct, setPct] = useState(0);

	useEffect(() => {
		let raf = 0;
		const loop = () => {
			setPct(Math.round(scrollState.progress * 100));
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	}, []);

	const jump = (id: string) => {
		document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
	};

	return (
		<>
			{/* corner brackets */}
			<div className="pointer-events-none fixed inset-3 z-40 hidden sm:block">
				<span className="absolute left-0 top-0 h-5 w-5 border-l border-t border-white/20" />
				<span className="absolute right-0 top-0 h-5 w-5 border-r border-t border-white/20" />
				<span className="absolute bottom-0 left-0 h-5 w-5 border-b border-l border-white/20" />
				<span className="absolute bottom-0 right-0 h-5 w-5 border-b border-r border-white/20" />
			</div>

			{/* wordmark */}
			<div className="fixed left-6 top-6 z-50 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">
				<span className="inline-block size-1.5 animate-pulse rounded-full bg-[hsl(222,96%,64%)]" />
				MV / Valentin
			</div>

			{/* progress readout */}
			<div className="fixed right-6 top-6 z-50 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 tabular-nums">
				SCROLL {String(pct).padStart(3, "0")}%
			</div>

			{/* side nav */}
			<nav className="fixed right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col items-end gap-3 md:flex">
				{NAV.map((n, i) => (
					<button
						key={n.id}
						onClick={() => jump(n.id)}
						className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 transition-colors hover:text-white"
						data-hover
					>
						<span className="opacity-0 transition-opacity group-hover:opacity-100">
							{n.label}
						</span>
						<span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
						<span className="h-px w-6 bg-white/20 transition-all group-hover:w-10 group-hover:bg-[hsl(222,96%,64%)]" />
					</button>
				))}
			</nav>
		</>
	);
}
