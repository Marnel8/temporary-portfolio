"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { fightStore, liveKeys } from "@/lib/arcade/store";
import { keysToInput, gamepadToInput } from "@/lib/arcade/input";
import { decideAction, scriptedPlayerFrame } from "@/lib/arcade/ai";
import { stepFight, FIGHT } from "@/lib/arcade/fight-engine";
import { getFighters } from "@/lib/arcade/fighters";
import type { MatchResult } from "@/lib/arcade/machine";
import Fighter from "./fighter";
import { ArcadeHud } from "./arcade-hud";

const ACCENT = "#2f6bff";
const HOT = "#ff5a3c";

function Loop({ cinematic, onDone }: { cinematic: boolean; onDone: (r: MatchResult) => void }) {
	const acc = useRef(0);
	const tick = useRef(0);
	const finished = useRef(false);

	useFrame(({ camera }, dt) => {
		acc.current += Math.min(dt, 0.05); // clamp huge frames
		const s = fightStore.state;

		while (acc.current >= FIGHT.DT) {
			acc.current -= FIGHT.DT;
			tick.current += 1;

			const pInput = cinematic
				? scriptedPlayerFrame(s.player, s.opponent, tick.current)
				: fightStore.mode === "gamepad"
				? gamepadToInput(navigator.getGamepads?.()[0] ?? null)
				: keysToInput(liveKeys);

			const oInput = decideAction(s.opponent, s.player);
			stepFight(s, pInput, oInput);
		}

		// camera shake on hit
		const shake = s.hitFlash * 0.12;
		camera.position.x = (Math.random() - 0.5) * shake;
		camera.position.y = 1 + (Math.random() - 0.5) * shake;

		if (s.over && !finished.current) {
			finished.current = true;
			onDone({
				winner: s.winner ?? "player",
				playerHealth: s.player.health,
				opponentHealth: s.opponent.health,
				timedOut: s.timer <= 0,
			});
		}
	});

	return null;
}

export default function StageRound({
	fighterIndex,
	cinematic,
	onDone,
}: {
	fighterIndex: number;
	cinematic: boolean;
	onDone: (r: MatchResult) => void;
}) {
	const fighters = useMemo(() => getFighters(), []);
	const opp = fighters[fighterIndex] ?? fighters[0];
	const [announce, setAnnounce] = useState("FIGHT!");

	useEffect(() => {
		fightStore.reset();
		fightStore.cinematic = cinematic;
		const t = setTimeout(() => setAnnounce(""), 1200);
		return () => clearTimeout(t);
	}, [cinematic, fighterIndex]);

	const getHud = useMemo(
		() => () => ({
			playerHealth: fightStore.state.player.health,
			oppHealth: fightStore.state.opponent.health,
			timer: fightStore.state.timer,
		}),
		[]
	);

	return (
		<div className="fixed inset-0 z-40 bg-[#070809]">
			<ArcadeHud playerName="MARNEL" oppName={opp.name} getState={getHud} />
			{announce && (
				<div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
					<span className="font-display text-7xl font-bold tracking-tight text-[#f5f3ef] drop-shadow-[0_0_20px_rgba(47,107,255,0.6)]">
						{announce}
					</span>
				</div>
			)}
			<Canvas
				dpr={[1, 1.6]}
				gl={{ antialias: true, powerPreference: "high-performance" }}
				camera={{ position: [0, 1, 6], fov: 45 }}
			>
				<color attach="background" args={["#070809"]} />
				<fog attach="fog" args={["#070809", 7, 18]} />
				<ambientLight intensity={0.5} />
				<pointLight position={[4, 5, 5]} intensity={120} color={ACCENT} />
				<pointLight position={[-5, 3, 4]} intensity={90} color={HOT} />
				{/* floor */}
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[30, 30]} />
					<meshStandardMaterial color="#0c0e12" metalness={0.6} roughness={0.4} />
				</mesh>
				<gridHelper args={[30, 30, ACCENT, "#1a1d24"]} position={[0, 0.01, 0]} />
				<Fighter state={fightStore.state.player} color={ACCENT} />
				<Fighter state={fightStore.state.opponent} color={HOT} />
				<Loop key={`${fighterIndex}-${cinematic}`} cinematic={cinematic} onDone={onDone} />
			</Canvas>
		</div>
	);
}
