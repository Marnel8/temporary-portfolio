"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getFighters } from "@/lib/arcade/fighters";
import type { MatchResult } from "@/lib/arcade/machine";

export default function StageResults({
	fighterIndex,
	result,
	onNext,
	onContact,
}: {
	fighterIndex: number;
	result: MatchResult;
	onNext: () => void;
	onContact: () => void;
}) {
	const fighters = useMemo(() => getFighters(), []);
	const f = fighters[fighterIndex] ?? fighters[0];
	const won = result.winner === "player";

	return (
		<div className="fixed inset-0 z-40 flex flex-col justify-center bg-[#070809] p-6 sm:p-12">
			<div className="mx-auto w-full max-w-3xl">
				<div className="font-display text-7xl font-black italic text-[#f5f3ef] drop-shadow-[0_0_24px_rgba(47,107,255,0.6)] sm:text-8xl">
					{won ? "YOU WIN" : "K.O."}
				</div>
				<div className="mt-2 font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(222,96%,64%)]">
					{result.timedOut ? "Time Over" : "Finish"} · {f.name}
				</div>

				<p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">{f.description}</p>

				<div className="mt-6 flex flex-wrap gap-2">
					{f.technologies.map((t) => (
						<span key={t} className="border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
							{t}
						</span>
					))}
				</div>

				<div className="mt-10 flex flex-wrap gap-4">
					{f.demoUrl && (
						<Link href={f.demoUrl} target="_blank" className="-skew-x-6 bg-[hsl(222,96%,64%)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#070809] hover:brightness-110">
							Live Demo →
						</Link>
					)}
					{f.repoUrl && (
						<Link href={f.repoUrl} target="_blank" className="-skew-x-6 border border-white/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-white/80 hover:border-white/50">
							Source
						</Link>
					)}
				</div>

				<div className="mt-12 flex flex-wrap gap-6 border-t border-white/10 pt-6">
					<button type="button" onClick={onNext} className="font-mono text-xs uppercase tracking-[0.3em] text-white/70 hover:text-[hsl(222,96%,64%)]">
						↻ Next Fighter
					</button>
					<button type="button" onClick={onContact} className="font-mono text-xs uppercase tracking-[0.3em] text-white/70 hover:text-[hsl(222,96%,64%)]">
						Enter the Dojo → Contact
					</button>
				</div>
			</div>
		</div>
	);
}
