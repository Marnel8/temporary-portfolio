"use client";

import { useEffect, useRef } from "react";
import { DATA } from "@/data/resume";

export default function StageBoot({ onStart }: { onStart: () => void }) {
	const fired = useRef(false);

	useEffect(() => {
		const go = () => {
			if (fired.current) return;
			fired.current = true;
			onStart();
		};
		window.addEventListener("keydown", go);
		window.addEventListener("pointerdown", go);
		return () => {
			window.removeEventListener("keydown", go);
			window.removeEventListener("pointerdown", go);
		};
	}, [onStart]);

	return (
		<div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#070809] text-center">
			<div className="boot-flicker font-display text-[14vw] font-bold leading-[0.8] tracking-tight text-[#f5f3ef] sm:text-[9vw]">
				PORTFOLIO
				<br />
				<span className="text-[hsl(222,96%,64%)]">FIGHTER</span>
			</div>
			<div className="mt-8 font-mono text-[11px] uppercase tracking-[0.35em] text-white/50">
				{DATA.name} · Web Developer
			</div>
			<div className="mt-16 animate-pulse font-mono text-sm uppercase tracking-[0.3em] text-[hsl(222,96%,64%)]">
				Insert Coin · Press Start
			</div>
		</div>
	);
}
