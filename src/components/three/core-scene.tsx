"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
	Float,
	Icosahedron,
	MeshDistortMaterial,
	Environment,
	Sparkles,
} from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { scrollState, pointer } from "@/lib/scroll-store";

const ACCENT = "#2f6bff";
const HOT = "#ff5a3c";

function Core() {
	const group = useRef<THREE.Group>(null!);
	const inner = useRef<THREE.Mesh>(null!);
	const wire = useRef<THREE.Mesh>(null!);

	useFrame((_, dt) => {
		pointer.x += (pointer.tx - pointer.x) * 0.05;
		pointer.y += (pointer.ty - pointer.y) * 0.05;

		const p = scrollState.progress; // 0..1 over whole page
		const g = group.current;

		// continuous spin + scroll-coupled tilt + mouse parallax
		g.rotation.y += dt * (0.18 + Math.abs(scrollState.velocity) * 0.02);
		g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.y * 0.35 + p * 1.4, 0.06);
		g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, pointer.x * 0.25, 0.06);

		// drift the core off-center and shrink as the page scrolls
		g.position.x = THREE.MathUtils.lerp(g.position.x, pointer.x * 0.4 + Math.sin(p * Math.PI) * 1.6, 0.05);
		g.position.y = THREE.MathUtils.lerp(g.position.y, pointer.y * 0.3 - p * 1.2, 0.05);
		const s = 1 - p * 0.35;
		g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, s, 0.06));

		wire.current.rotation.y -= dt * 0.25;
		wire.current.rotation.x += dt * 0.12;
	});

	return (
		<group ref={group}>
			<Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.8}>
				<Icosahedron ref={inner} args={[1.5, 6]}>
					<MeshDistortMaterial
						color={ACCENT}
						emissive={ACCENT}
						emissiveIntensity={0.12}
						roughness={0.12}
						metalness={0.92}
						distort={0.4}
						speed={1.6}
					/>
				</Icosahedron>
			</Float>

			<Icosahedron ref={wire} args={[2.35, 1]}>
				<meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.12} />
			</Icosahedron>
		</group>
	);
}

function Rig() {
	useFrame(({ camera, clock }) => {
		camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.6, 0.04);
		camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 0.6, 0.04);
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
			camera={{ position: [0, 0, 6], fov: 42 }}
		>
			<color attach="background" args={["#070809"]} />
			<fog attach="fog" args={["#070809", 6, 16]} />

			<ambientLight intensity={0.4} />
			<pointLight position={[5, 5, 5]} intensity={120} color={ACCENT} />
			<pointLight position={[-6, -3, 2]} intensity={70} color={HOT} />
			<pointLight position={[0, 4, -4]} intensity={40} color="#ffffff" />

			<Core />

			<Sparkles
				count={140}
				scale={[14, 10, 8]}
				size={2.4}
				speed={0.25}
				opacity={0.6}
				color={ACCENT}
			/>

			<Environment preset="city" />
			<Rig />
		</Canvas>
	);
}
