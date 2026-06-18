"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { FighterState } from "@/lib/arcade/fight-engine";

export default function Fighter({
	state,
	color,
}: {
	state: FighterState;
	color: string;
}) {
	const group = useRef<THREE.Group>(null!);
	const armR = useRef<THREE.Mesh>(null!);
	const torso = useRef<THREE.Group>(null!);

	useFrame((_, dt) => {
		const g = group.current;
		if (!g) return;
		g.position.x = THREE.MathUtils.lerp(g.position.x, state.x, 0.5);
		g.position.y = state.y;
		g.scale.x = state.facing; // flip to face foe

		// punch pose: extend right arm during attack
		const attacking = state.move === "light" || state.move === "heavy";
		const target = attacking ? Math.PI / 2 : 0;
		if (armR.current)
			armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, target, 0.4);
		// crouch slightly when blocking
		if (torso.current) {
			const ty = state.move === "block" ? -0.12 : 0;
			torso.current.position.y = THREE.MathUtils.lerp(torso.current.position.y, ty, 0.3);
		}
	});

	const mat = (
		<meshStandardMaterial
			color={color}
			emissive={color}
			emissiveIntensity={0.6}
			roughness={0.25}
			metalness={0.7}
		/>
	);

	return (
		<group ref={group}>
			<group ref={torso}>
				{/* head */}
				<mesh position={[0, 1.5, 0]}>
					<sphereGeometry args={[0.22, 16, 16]} />
					{mat}
				</mesh>
				{/* torso */}
				<mesh position={[0, 1, 0]}>
					<capsuleGeometry args={[0.22, 0.6, 6, 12]} />
					{mat}
				</mesh>
				{/* right arm (punching) */}
				<mesh ref={armR} position={[0.25, 1.15, 0]}>
					<capsuleGeometry args={[0.08, 0.5, 4, 8]} />
					{mat}
				</mesh>
				{/* left arm */}
				<mesh position={[-0.25, 1.15, 0]} rotation={[0, 0, -0.2]}>
					<capsuleGeometry args={[0.08, 0.5, 4, 8]} />
					{mat}
				</mesh>
				{/* legs */}
				<mesh position={[0.12, 0.35, 0]}>
					<capsuleGeometry args={[0.09, 0.55, 4, 8]} />
					{mat}
				</mesh>
				<mesh position={[-0.12, 0.35, 0]}>
					<capsuleGeometry args={[0.09, 0.55, 4, 8]} />
					{mat}
				</mesh>
			</group>
		</group>
	);
}
