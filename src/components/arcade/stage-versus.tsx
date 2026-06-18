"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { getFighters } from "@/lib/arcade/fighters";
import { DATA } from "@/data/resume";

export default function StageVersus({
	fighterIndex,
	onDone,
}: {
	fighterIndex: number;
	onDone: () => void;
}) {
	const fighters = useMemo(() => getFighters(), []);
	const opp = fighters[fighterIndex] ?? fighters[0];
	const scope = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ onComplete: onDone });
			tl.from(".vs-left", { xPercent: -120, duration: 0.6, ease: "power4.out" })
				.from(".vs-right", { xPercent: 120, duration: 0.6, ease: "power4.out" }, "<")
				.from(".vs-badge", { scale: 0, rotate: -30, duration: 0.5, ease: "back.out(2)" }, "-=0.2")
				.from(".vs-stage", { opacity: 0, y: 20, duration: 0.4 }, "-=0.1")
				.to({}, { duration: 1.4 }); // hold
		}, scope);
		return () => ctx.revert();
	}, [fighterIndex, onDone]);

	return (
		<div ref={scope} className="fixed inset-0 z-40 flex items-stretch overflow-hidden bg-[#070809]">
			<div className="vs-left relative flex-1 bg-gradient-to-br from-[hsl(222,96%,64%)]/20 to-transparent">
				<Image src={DATA.avatarUrl} alt={DATA.name} fill className="object-cover object-top opacity-60" sizes="50vw" />
				<div className="absolute bottom-10 left-8 font-display text-5xl font-bold text-[#f5f3ef] sm:text-7xl">MARNEL</div>
			</div>
			<div className="vs-right relative flex-1 bg-gradient-to-bl from-[#ff5a3c]/20 to-transparent">
				{opp.image && (
					<Image src={opp.image} alt={opp.name} fill className="object-cover opacity-60" sizes="50vw" />
				)}
				<div className="absolute bottom-10 right-8 text-right font-display text-5xl font-bold text-[#f5f3ef] sm:text-7xl">{opp.name}</div>
			</div>
			<div className="vs-badge absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-8xl font-black italic text-[#f5f3ef] drop-shadow-[0_0_30px_rgba(255,90,60,0.7)]">
				VS
			</div>
			<div className="vs-stage absolute inset-x-0 bottom-4 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-white/60">
				Stage · {opp.stage}
			</div>
		</div>
	);
}
