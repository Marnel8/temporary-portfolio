"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import Link from "next/link";
import { DATA } from "@/data/resume";

/* ═══════════════════════════════════════════════════════════════════════
   PROJECT DRUM — the projects section as a Three.js scene.

   A rotating cylinder ("drum") of translucent wireframe panels, one per
   project. Each panel's text (index, title, description, tech stack) is
   drawn to an offscreen 2D canvas in the site's mono font and mapped on
   as a texture — crisper and far cheaper than SDF text, and it stays
   perfectly on-palette.

   Interaction:
   - drag horizontally (mouse or touch) to spin; releases snap to the
     nearest panel
   - ‹ / › buttons under the canvas step one panel (also the keyboard-
     accessible path)
   - the active project's dates + live links render as HTML under the
     canvas, and a full plain-HTML index sits below as fallback/SEO

   Atmosphere: a slowly tumbling wireframe torus + icosahedron and a
   sparse particle field float inside the drum.
   ═══════════════════════════════════════════════════════════════════ */

const PHOS = "#00ff6a";
const PALE = "#c8ffdd";

type Project = (typeof DATA.projects)[number];
const PROJECTS = DATA.projects;
const COUNT = PROJECTS.length;
const STEP = (Math.PI * 2) / COUNT;
const RADIUS = 4.4;
const PANEL_W = 2.75;
const PANEL_H = 1.85;

/* ── texture: draw one project card to a canvas ─────────────────────── */

function wrapText(
	ctx: CanvasRenderingContext2D,
	text: string,
	maxWidth: number,
	maxLines: number
) {
	const words = text.split(" ");
	const lines: string[] = [];
	let line = "";
	for (const word of words) {
		const attempt = line ? `${line} ${word}` : word;
		if (ctx.measureText(attempt).width > maxWidth && line) {
			lines.push(line);
			line = word;
			if (lines.length === maxLines) break;
		} else {
			line = attempt;
		}
	}
	if (lines.length < maxLines && line) lines.push(line);
	else if (lines.length === maxLines)
		lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, " …");
	return lines;
}

function drawPanelTexture(project: Project, index: number, mono: string) {
	const W = 660;
	const H = 444; // matches PANEL_W : PANEL_H
	const canvas = document.createElement("canvas");
	canvas.width = W;
	canvas.height = H;
	const ctx = canvas.getContext("2d")!;

	// header row: zero-padded index + dates
	ctx.fillStyle = PHOS;
	ctx.globalAlpha = 0.8;
	ctx.font = `500 20px ${mono}`;
	ctx.fillText(String(index + 1).padStart(2, "0"), 36, 56);
	ctx.textAlign = "right";
	ctx.globalAlpha = 0.5;
	ctx.fillText(project.dates.toUpperCase(), W - 36, 56, W / 2);
	ctx.textAlign = "left";

	// title
	ctx.globalAlpha = 1;
	ctx.fillStyle = PALE;
	ctx.font = `700 44px ${mono}`;
	ctx.fillText(project.title.toUpperCase(), 36, 128, W - 72);

	// separator
	ctx.fillStyle = PHOS;
	ctx.globalAlpha = 0.4;
	ctx.fillRect(36, 152, 90, 2);

	// description
	ctx.globalAlpha = 0.85;
	ctx.fillStyle = PALE;
	ctx.font = `400 23px ${mono}`;
	wrapText(ctx, project.description, W - 72, 4).forEach((l, i) =>
		ctx.fillText(l, 36, 204 + i * 34)
	);

	// tech stack
	ctx.fillStyle = PHOS;
	ctx.globalAlpha = 0.75;
	ctx.font = `500 19px ${mono}`;
	wrapText(ctx, project.technologies.join(" · "), W - 72, 2).forEach((l, i) =>
		ctx.fillText(l, 36, 368 + i * 28)
	);

	const tex = new THREE.CanvasTexture(canvas);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 4;
	return tex;
}

/* ── panel geometry: rect with two 45°-cut corners, like the CSS ────── */

function usePanelShape() {
	return useMemo(() => {
		const w = PANEL_W / 2;
		const h = PANEL_H / 2;
		const c = 0.2;
		const shape = new THREE.Shape();
		shape.moveTo(-w + c, -h);
		shape.lineTo(w, -h);
		shape.lineTo(w, h - c);
		shape.lineTo(w - c, h);
		shape.lineTo(-w, h);
		shape.lineTo(-w, -h + c);
		shape.closePath();
		return shape;
	}, []);
}

function Panel({
	texture,
	active,
	position,
	rotationY,
}: {
	texture: THREE.CanvasTexture | null;
	active: boolean;
	position: [number, number, number];
	rotationY: number;
}) {
	const shape = usePanelShape();
	const outline = useMemo(
		() => new THREE.BufferGeometry().setFromPoints(shape.getPoints()),
		[shape]
	);

	return (
		<group position={position} rotation-y={rotationY}>
			{/* translucent fill */}
			<mesh>
				<shapeGeometry args={[shape]} />
				<meshBasicMaterial
					color={PHOS}
					transparent
					opacity={active ? 0.055 : 0.02}
					side={THREE.DoubleSide}
					depthWrite={false}
				/>
			</mesh>
			{/* wireframe border */}
			{/* eslint-disable-next-line react/no-unknown-property */}
			<lineLoop geometry={outline}>
				<lineBasicMaterial
					color={PHOS}
					transparent
					opacity={active ? 0.9 : 0.28}
				/>
			</lineLoop>
			{/* text texture */}
			{texture && (
				<mesh position-z={0.01}>
					<planeGeometry args={[PANEL_W * 0.96, PANEL_H * 0.96]} />
					<meshBasicMaterial
						map={texture}
						transparent
						opacity={active ? 1 : 0.4}
						depthWrite={false}
						toneMapped={false}
					/>
				</mesh>
			)}
		</group>
	);
}

/* ── floating wireframe primitives + particles ──────────────────────── */

function Atmosphere() {
	const torus = useRef<THREE.Mesh>(null);
	const ico = useRef<THREE.Mesh>(null);
	const points = useRef<THREE.Points>(null);

	// sparse particle cloud filling the drum's interior
	const positions = useMemo(() => {
		const arr = new Float32Array(360 * 3);
		for (let i = 0; i < arr.length; i += 3) {
			const r = 1 + Math.random() * 5.5;
			const theta = Math.random() * Math.PI * 2;
			const y = (Math.random() - 0.5) * 4;
			arr[i] = Math.cos(theta) * r;
			arr[i + 1] = y;
			arr[i + 2] = Math.sin(theta) * r;
		}
		return arr;
	}, []);

	useFrame((_, dt) => {
		if (torus.current) {
			torus.current.rotation.x += dt * 0.18;
			torus.current.rotation.y += dt * 0.11;
		}
		if (ico.current) {
			ico.current.rotation.y -= dt * 0.22;
			ico.current.rotation.z += dt * 0.07;
		}
		if (points.current) points.current.rotation.y += dt * 0.015;
	});

	return (
		<>
			<mesh ref={torus} position={[0, 0.4, 0]}>
				<torusGeometry args={[1.1, 0.36, 10, 26]} />
				<meshBasicMaterial color={PHOS} wireframe transparent opacity={0.14} />
			</mesh>
			<mesh ref={ico} position={[0, -1.1, 0]} scale={0.5}>
				<icosahedronGeometry args={[1, 0]} />
				<meshBasicMaterial color={PHOS} wireframe transparent opacity={0.2} />
			</mesh>
			<points ref={points}>
				<bufferGeometry>
					<bufferAttribute
						attach="attributes-position"
						args={[positions, 3]}
					/>
				</bufferGeometry>
				<pointsMaterial
					color={PHOS}
					size={0.025}
					transparent
					opacity={0.5}
					sizeAttenuation
				/>
			</points>
		</>
	);
}

/* ── the drum itself ────────────────────────────────────────────────── */

function Drum({
	targetRot,
	onActive,
}: {
	targetRot: React.MutableRefObject<number>;
	onActive: (i: number) => void;
}) {
	const group = useRef<THREE.Group>(null);
	const lastActive = useRef(-1);
	const [textures, setTextures] = useState<(THREE.CanvasTexture | null)[]>(
		() => PROJECTS.map(() => null)
	);
	const [active, setActive] = useState(0);
	const invalidate = useThree((s) => s.invalidate);

	// Draw all panel textures once the site's mono font is loaded, so the
	// drum uses the same face as the rest of the page.
	useEffect(() => {
		let disposed = false;
		document.fonts.ready.then(() => {
			if (disposed) return;
			const mono = getComputedStyle(document.body).fontFamily;
			setTextures(PROJECTS.map((p, i) => drawPanelTexture(p, i, mono)));
			invalidate();
		});
		return () => {
			disposed = true;
			setTextures((prev) => {
				prev.forEach((t) => t?.dispose());
				return prev;
			});
		};
	}, [invalidate]);

	useFrame((_, dt) => {
		const g = group.current;
		if (!g) return;
		// ease toward the drag/snap target
		g.rotation.y += (targetRot.current - g.rotation.y) * Math.min(1, dt * 5);

		// whichever panel faces the camera is "active"
		const idx =
			((Math.round(-targetRot.current / STEP) % COUNT) + COUNT) % COUNT;
		if (idx !== lastActive.current) {
			lastActive.current = idx;
			setActive(idx);
			onActive(idx);
		}
	});

	return (
		<group ref={group}>
			{PROJECTS.map((p, i) => {
				const angle = i * STEP;
				return (
					<Panel
						key={p.title}
						texture={textures[i]}
						active={i === active}
						position={[
							Math.sin(angle) * RADIUS,
							0,
							Math.cos(angle) * RADIUS,
						]}
						rotationY={angle}
					/>
				);
			})}
			<Atmosphere />
		</group>
	);
}

/* ── public component: canvas + controls + HTML fallback index ──────── */

export default function ProjectDrum() {
	const targetRot = useRef(0);
	const [active, setActive] = useState(0);
	const drag = useRef({ on: false, x: 0, moved: 0 });

	const spinTo = (idx: number) => {
		// rotate the shortest way to the requested panel
		const current = Math.round(-targetRot.current / STEP);
		const delta = idx - (((current % COUNT) + COUNT) % COUNT);
		const shortest =
			Math.abs(delta) > COUNT / 2 ? delta - Math.sign(delta) * COUNT : delta;
		targetRot.current = -(current + shortest) * STEP;
	};

	const onPointerDown = (e: React.PointerEvent) => {
		drag.current = { on: true, x: e.clientX, moved: 0 };
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
	};
	const onPointerMove = (e: React.PointerEvent) => {
		if (!drag.current.on) return;
		const dx = e.clientX - drag.current.x;
		drag.current.x = e.clientX;
		drag.current.moved += Math.abs(dx);
		targetRot.current += dx * 0.006;
	};
	const onPointerUp = () => {
		drag.current.on = false;
		// snap to the nearest panel so text is always readable at rest
		targetRot.current = Math.round(targetRot.current / STEP) * STEP;
	};

	const activeProject = PROJECTS[active];

	return (
		<div>
			{/* the 3D drum — touch-action pan-y keeps vertical page scroll alive */}
			<div
				className="relative h-[420px] cursor-grab select-none active:cursor-grabbing sm:h-[520px]"
				style={{ touchAction: "pan-y" }}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
			>
				<Canvas
					camera={{ position: [0, 0.2, 9], fov: 38 }}
					dpr={[1, 2]}
					gl={{ antialias: true, alpha: true }}
					fallback={null}
				>
					<Drum targetRot={targetRot} onActive={setActive} />
				</Canvas>

				{/* drag hint */}
				<div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.35em] text-phos/40">
					‹ DRAG TO ROTATE ›
				</div>
			</div>

			{/* active project readout: prev/next + live links */}
			<div className="mt-2 flex flex-wrap items-center justify-between gap-4 border-t border-phos/15 pt-5 font-mono text-xs">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => spinTo((active - 1 + COUNT) % COUNT)}
						className="border border-phos/30 px-3 py-1.5 text-phos/80 transition-colors hover:border-phos/70 hover:text-phos"
						aria-label="Previous project"
					>
						‹
					</button>
					<button
						type="button"
						onClick={() => spinTo((active + 1) % COUNT)}
						className="border border-phos/30 px-3 py-1.5 text-phos/80 transition-colors hover:border-phos/70 hover:text-phos"
						aria-label="Next project"
					>
						›
					</button>
					<span className="ml-2 text-phos/60">
						{String(active + 1).padStart(2, "0")} /{" "}
						{String(COUNT).padStart(2, "0")} — {activeProject.title}
					</span>
				</div>
				<div className="flex gap-4">
					{activeProject.links.map((l) => (
						<Link
							key={l.type}
							href={l.href || "#"}
							target="_blank"
							className="text-phos/70 underline-offset-4 transition-colors hover:text-phos hover:underline"
						>
							[{l.type.toLowerCase()}]
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
