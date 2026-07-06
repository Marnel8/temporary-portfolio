"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* ── SkillsRadar ──────────────────────────────────────────────────────
   Three-cluster radar (Software Engineering / Data Science / Security)
   drawn as SVG and animated in with ScrollTrigger: grid rings fade up,
   then the capability polygon draws itself (stroke-dashoffset), then
   the vertex markers pop. Values are relative self-assessed weights,
   backed by the per-cluster skill lists rendered next to the chart. */

export type RadarCluster = {
	label: string;
	/** 0..1 — how far the vertex sits from the centre */
	value: number;
	/** small mono caption under the label (e.g. skill count / status) */
	note: string;
	/** vertex + note colour; defaults to the teal accent */
	color?: string;
	/** render this cluster's edge dashed (used for "in progress") */
	provisional?: boolean;
};

const CX = 210;
const CY = 190;
const R = 150;
// vertex angles: top, bottom-right, bottom-left
const ANGLES = [-90, 30, 150].map((a) => (a * Math.PI) / 180);
const ACCENT = "#00E5C7";
const GRID = "#1E2530";

function polar(angle: number, dist: number): [number, number] {
	return [CX + Math.cos(angle) * dist, CY + Math.sin(angle) * dist];
}

function trianglePath(dist: number | number[]): string {
	const pts = ANGLES.map((a, i) =>
		polar(a, Array.isArray(dist) ? dist[i] : dist)
	);
	return `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]} L ${pts[2][0]} ${pts[2][1]} Z`;
}

export default function SkillsRadar({ clusters }: { clusters: RadarCluster[] }) {
	const root = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		gsap.registerPlugin(ScrollTrigger);
		const ctx = gsap.context(() => {
			// measure the polygon so stroke-dashoffset can "draw" it
			const shape = root.current!.querySelector<SVGPathElement>(".radar-shape")!;
			const len = shape.getTotalLength();
			gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });

			const tl = gsap.timeline({
				scrollTrigger: { trigger: root.current, start: "top 75%" },
			});
			tl.from(".radar-ring", {
				scale: 0.6,
				opacity: 0,
				transformOrigin: `${CX}px ${CY}px`,
				duration: 0.7,
				stagger: 0.08,
				ease: "power2.out",
			})
				.from(".radar-axis", { opacity: 0, duration: 0.4 }, "-=0.3")
				.to(shape, { strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut" }, "-=0.2")
				.to(".radar-fill", { opacity: 1, duration: 0.8 }, "-=0.6")
				.from(
					".radar-dot",
					{ scale: 0, transformOrigin: "center", duration: 0.4, stagger: 0.12, ease: "back.out(2.5)" },
					"-=0.8"
				)
				.from(".radar-label", { opacity: 0, y: 8, duration: 0.5, stagger: 0.1 }, "-=0.6");
		}, root);
		return () => ctx.revert();
	}, []);

	const values = clusters.map((c) => c.value);

	return (
		<div ref={root} className="relative">
			{/* extra horizontal room in the viewBox so the side labels never clip */}
			<svg viewBox="-100 0 640 380" className="w-full" role="img"
				aria-label={`Capability radar: ${clusters.map((c) => `${c.label} — ${c.note}`).join("; ")}`}>
				{/* concentric grid rings */}
				{[0.25, 0.5, 0.75, 1].map((r) => (
					<path
						key={r}
						className="radar-ring"
						d={trianglePath(R * r)}
						fill="none"
						stroke={GRID}
						strokeWidth="1"
						strokeDasharray="3 5"
					/>
				))}

				{/* axes from the centre to each vertex */}
				{ANGLES.map((a, i) => {
					const [x, y] = polar(a, R);
					return (
						<line key={i} className="radar-axis" x1={CX} y1={CY} x2={x} y2={y}
							stroke={GRID} strokeWidth="1" />
					);
				})}

				{/* capability polygon — fill fades in after the stroke draws */}
				<path
					className="radar-fill"
					d={trianglePath(values.map((v) => v * R))}
					fill={ACCENT}
					opacity="0"
					style={{ fillOpacity: 0.08 }}
				/>
				<path
					className="radar-shape"
					d={trianglePath(values.map((v) => v * R))}
					fill="none"
					stroke={ACCENT}
					strokeWidth="1.5"
				/>

				{/* vertex markers + labels */}
				{clusters.map((c, i) => {
					const color = c.color ?? ACCENT;
					const [dx, dy] = polar(ANGLES[i], c.value * R);
					const [lx, ly] = polar(ANGLES[i], R + 26);
					const anchor = i === 0 ? "middle" : i === 1 ? "start" : "end";
					return (
						<g key={c.label}>
							{c.provisional && (
								// dashed reach-line showing where this cluster is headed
								<line x1={dx} y1={dy} x2={polar(ANGLES[i], R * 0.85)[0]} y2={polar(ANGLES[i], R * 0.85)[1]}
									className="radar-axis" stroke={color} strokeWidth="1" strokeDasharray="2 6" opacity="0.5" />
							)}
							<circle className="radar-dot" cx={dx} cy={dy} r="4" fill={color} />
							<circle className="radar-dot" cx={dx} cy={dy} r="8" fill="none" stroke={color} opacity="0.35" />
							<g className="radar-label">
								<text x={lx} y={ly - 4} textAnchor={anchor}
									className="fill-[#E4E7EB] font-display text-[13px] font-semibold">
									{c.label}
								</text>
								<text x={lx} y={ly + 12} textAnchor={anchor}
									className="font-mono text-[9px] uppercase tracking-[0.2em]"
									fill={c.color ?? "#8B93A1"}>
									{c.note}
								</text>
							</g>
						</g>
					);
				})}
			</svg>
		</div>
	);
}
