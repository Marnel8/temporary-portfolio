"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { getFighters } from "@/lib/arcade/fighters";

export default function StageSelect({ onPick }: { onPick: (index: number) => void }) {
	const fighters = useMemo(() => getFighters(), []);
	const [active, setActive] = useState(0);
	const f = fighters[active];

	return (
		<div className="fixed inset-0 z-40 flex flex-col bg-[#070809] p-6 sm:p-10">
			<div className="mb-6 flex items-center gap-4">
				<span className="font-mono text-[11px] tracking-[0.3em] text-[hsl(222,96%,64%)]">SELECT</span>
				<span className="h-px w-10 bg-white/20" />
				<h2 className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/60">Choose your fighter</h2>
			</div>

			<div className="grid flex-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
				{/* roster grid */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{fighters.map((fighter) => (
						<button
							key={fighter.index}
							onMouseEnter={() => setActive(fighter.index)}
							onFocus={() => setActive(fighter.index)}
							onClick={() => onPick(fighter.index)}
							className={`group relative aspect-[3/4] overflow-hidden border bg-white/[0.02] text-left transition ${
								active === fighter.index
									? "border-[hsl(222,96%,64%)] shadow-[0_0_30px_-8px_hsl(222,96%,64%)]"
									: "border-white/10 hover:border-white/30"
							}`}
						>
							{fighter.image && (
								<Image
									src={fighter.image}
									alt={fighter.name}
									fill
									className="object-cover opacity-50 transition group-hover:opacity-80"
									sizes="200px"
								/>
							)}
							<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
								<span className="font-display text-sm font-semibold text-[#f5f3ef]">{fighter.name}</span>
							</div>
						</button>
					))}
				</div>

				{/* fighter card */}
				<div className="flex flex-col justify-end border border-white/10 bg-white/[0.02] p-6">
					<div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[hsl(222,96%,64%)]">{f.stage}</div>
					<h3 className="mt-2 font-display text-4xl font-bold tracking-tight text-[#f5f3ef]">{f.name}</h3>
					<p className="mt-3 text-sm leading-relaxed text-white/55">{f.description}</p>
					<div className="mt-6 space-y-2">
						{f.stats.map((s) => (
							<div key={s.label}>
								<div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
									<span>{s.label}</span>
									<span>{s.value}</span>
								</div>
								<div className="mt-1 h-1.5 w-full overflow-hidden bg-white/10">
									<div className="h-full bg-[hsl(222,96%,64%)]" style={{ width: `${s.value}%` }} />
								</div>
							</div>
						))}
					</div>
					<button
						onClick={() => onPick(f.index)}
						className="mt-8 w-full -skew-x-6 bg-[hsl(222,96%,64%)] py-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#070809] transition hover:brightness-110"
					>
						Fight →
					</button>
				</div>
			</div>
		</div>
	);
}
