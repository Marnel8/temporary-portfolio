"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";

/* ═══════════════════════════════════════════════════════════════════════
   FOOTER WIRE — quiet closing scene behind the footer: a slowly
   rotating wireframe icosphere over a faint static particle field.
   Deliberately dimmer and slower than the hero/drum; purely decorative
   (aria-hidden), so it renders nothing meaningful to assistive tech.
   ═══════════════════════════════════════════════════════════════════ */

const PHOS = "#00ff6a";

function Scene() {
	const ico = useRef<THREE.Mesh>(null);
	const pts = useRef<THREE.Points>(null);

	// sparse field spread wider than the sphere so edges stay soft
	const positions = useMemo(() => {
		const arr = new Float32Array(220 * 3);
		for (let i = 0; i < arr.length; i += 3) {
			arr[i] = (Math.random() - 0.5) * 9;
			arr[i + 1] = (Math.random() - 0.5) * 4.5;
			arr[i + 2] = (Math.random() - 0.5) * 4;
		}
		return arr;
	}, []);

	useFrame((_, dt) => {
		if (ico.current) {
			ico.current.rotation.y += dt * 0.12;
			ico.current.rotation.x += dt * 0.05;
		}
		if (pts.current) pts.current.rotation.y += dt * 0.01;
	});

	return (
		<>
			<mesh ref={ico}>
				<icosahedronGeometry args={[1.35, 1]} />
				<meshBasicMaterial color={PHOS} wireframe transparent opacity={0.22} />
			</mesh>
			<points ref={pts}>
				<bufferGeometry>
					<bufferAttribute attach="attributes-position" args={[positions, 3]} />
				</bufferGeometry>
				<pointsMaterial color={PHOS} size={0.02} transparent opacity={0.4} sizeAttenuation />
			</points>
		</>
	);
}

export default function FooterWire({ className }: { className?: string }) {
	return (
		<div className={className} aria-hidden>
			<Canvas
				camera={{ position: [0, 0, 5], fov: 40 }}
				dpr={[1, 1.5]}
				gl={{ antialias: true, alpha: true }}
				fallback={null}
			>
				<Scene />
			</Canvas>
		</div>
	);
}
