"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { scrollState, pointer } from "@/lib/scroll-store";

/* ── Signal / Perimeter — particle network background ─────────────────
   A low-density field of drifting points, joined by thin lines whenever
   two points come close. Reads the shared pointer/scroll stores (mutated
   outside React) so it reacts to the cursor and page scroll without
   re-rendering. Deliberately dim: it should read as instrumentation,
   not decoration. */

const ACCENT = "#00E5C7";
const COUNT = 80; // points in the field — keep low, this is O(n²) per frame
const LINK_DIST = 2.1; // world-space distance under which two points connect
const BOUNDS = new THREE.Vector3(9, 5.5, 3); // half-extents of the drift box

function Network() {
	const group = useRef<THREE.Group>(null!);
	const pointsGeo = useRef<THREE.BufferGeometry>(null!);
	const linesGeo = useRef<THREE.BufferGeometry>(null!);
	const { viewport } = useThree();

	// Static allocations: positions/velocities for every point, plus a
	// worst-case vertex buffer for the connecting line segments.
	const { positions, velocities, linePositions, reduced } = useMemo(() => {
		const positions = new Float32Array(COUNT * 3);
		const velocities = new Float32Array(COUNT * 3);
		for (let i = 0; i < COUNT; i++) {
			positions[i * 3] = (Math.random() * 2 - 1) * BOUNDS.x;
			positions[i * 3 + 1] = (Math.random() * 2 - 1) * BOUNDS.y;
			positions[i * 3 + 2] = (Math.random() * 2 - 1) * BOUNDS.z;
			// slow drift — a full crossing of the field takes ~a minute
			velocities[i * 3] = (Math.random() * 2 - 1) * 0.14;
			velocities[i * 3 + 1] = (Math.random() * 2 - 1) * 0.14;
			velocities[i * 3 + 2] = (Math.random() * 2 - 1) * 0.06;
		}
		const maxSegments = (COUNT * (COUNT - 1)) / 2;
		const linePositions = new Float32Array(maxSegments * 2 * 3);
		const reduced =
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		return { positions, velocities, linePositions, reduced };
	}, []);

	useFrame((_, rawDt) => {
		const dt = Math.min(rawDt, 0.05); // clamp tab-switch spikes

		// ease the shared pointer toward its raw target (same smoothing the
		// old scene applied — pointer.x/y is read smoothed elsewhere too)
		pointer.x += (pointer.tx - pointer.x) * 0.05;
		pointer.y += (pointer.ty - pointer.y) * 0.05;

		// cursor position projected onto the z=0 plane of the field
		const cx = pointer.x * viewport.width * 0.5;
		const cy = pointer.y * viewport.height * 0.5;

		if (!reduced) {
			for (let i = 0; i < COUNT; i++) {
				const ix = i * 3;
				positions[ix] += velocities[ix] * dt;
				positions[ix + 1] += velocities[ix + 1] * dt;
				positions[ix + 2] += velocities[ix + 2] * dt;

				// gentle repulsion within a small radius of the cursor
				const dxc = positions[ix] - cx;
				const dyc = positions[ix + 1] - cy;
				const dc2 = dxc * dxc + dyc * dyc;
				if (dc2 < 4 && dc2 > 0.0001) {
					const f = (0.55 * dt) / Math.max(dc2, 0.35);
					positions[ix] += dxc * f;
					positions[ix + 1] += dyc * f;
				}

				// wrap at the bounds so the field never empties out
				for (let a = 0; a < 3; a++) {
					const limit = a === 0 ? BOUNDS.x : a === 1 ? BOUNDS.y : BOUNDS.z;
					if (positions[ix + a] > limit) positions[ix + a] = -limit;
					else if (positions[ix + a] < -limit) positions[ix + a] = limit;
				}
			}
		}

		// rebuild the line-segment list from current point proximities
		let seg = 0;
		for (let i = 0; i < COUNT; i++) {
			for (let j = i + 1; j < COUNT; j++) {
				const dx = positions[i * 3] - positions[j * 3];
				const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
				const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
				if (dx * dx + dy * dy + dz * dz < LINK_DIST * LINK_DIST) {
					linePositions.set(
						[
							positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
							positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2],
						],
						seg * 6
					);
					seg++;
				}
			}
		}

		pointsGeo.current.attributes.position.needsUpdate = true;
		linesGeo.current.attributes.position.needsUpdate = true;
		linesGeo.current.setDrawRange(0, seg * 2);

		// slight tilt from scroll + cursor so the field feels attached to the page
		const g = group.current;
		g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, pointer.x * 0.08, 0.04);
		g.rotation.x = THREE.MathUtils.lerp(
			g.rotation.x,
			-pointer.y * 0.06 + scrollState.progress * 0.25,
			0.04
		);
	});

	return (
		<group ref={group}>
			<points>
				<bufferGeometry ref={pointsGeo}>
					<bufferAttribute attach="attributes-position" args={[positions, 3]} />
				</bufferGeometry>
				<pointsMaterial
					color={ACCENT}
					size={0.045}
					sizeAttenuation
					transparent
					opacity={0.55}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</points>
			<lineSegments>
				<bufferGeometry ref={linesGeo}>
					<bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
				</bufferGeometry>
				<lineBasicMaterial
					color={ACCENT}
					transparent
					opacity={0.1}
					depthWrite={false}
					blending={THREE.AdditiveBlending}
				/>
			</lineSegments>
		</group>
	);
}

/* subtle camera parallax against the smoothed pointer */
function Rig() {
	useFrame(({ camera }) => {
		camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.4, 0.04);
		camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.4, 0.04);
		camera.lookAt(0, 0, 0);
	});
	return null;
}

export default function CoreScene() {
	const dpr = useMemo<[number, number]>(() => [1, 1.6], []);

	return (
		<Canvas
			dpr={dpr}
			gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
			camera={{ position: [0, 0, 7], fov: 45 }}
		>
			<color attach="background" args={["#0A0E14"]} />
			<fog attach="fog" args={["#0A0E14", 7, 15]} />
			<Network />
			<Rig />
		</Canvas>
	);
}
