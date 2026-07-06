"use client";

import { useEffect, useRef } from "react";
import { FIGHT } from "@/lib/arcade/fight-engine";

export function ArcadeHud({
	playerName,
	oppName,
	getState,
}: {
	playerName: string;
	oppName: string;
	getState: () => { playerHealth: number; oppHealth: number; timer: number };
}) {
	const pBar = useRef<HTMLDivElement>(null);
	const oBar = useRef<HTMLDivElement>(null);
	const clock = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let raf = 0;
		const tick = () => {
			const { playerHealth, oppHealth, timer } = getState();
			if (pBar.current) pBar.current.style.width = `${(playerHealth / FIGHT.MAX_HEALTH) * 100}%`;
			if (oBar.current) oBar.current.style.width = `${(oppHealth / FIGHT.MAX_HEALTH) * 100}%`;
			if (clock.current) clock.current.textContent = String(Math.ceil(timer)).padStart(2, "0");
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [getState]);

	return (
		<div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-6">
			<div className="flex-1">
				<div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">{playerName}</div>
				<div className="mt-1 h-3 w-full -skew-x-12 overflow-hidden border border-white/20 bg-black/40">
					<div ref={pBar} className="h-full bg-[#00E5C7]" style={{ width: "100%" }} />
				</div>
			</div>
			<div
				ref={clock}
				className="font-display text-3xl font-bold tabular-nums text-[#E4E7EB]"
			>
				60
			</div>
			<div className="flex-1">
				<div className="text-right font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">{oppName}</div>
				<div className="mt-1 flex h-3 w-full -skew-x-12 justify-end overflow-hidden border border-white/20 bg-black/40">
					<div ref={oBar} className="h-full bg-[#ff5a3c]" style={{ width: "100%" }} />
				</div>
			</div>
		</div>
	);
}
