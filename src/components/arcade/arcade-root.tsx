"use client";

import { useEffect, useLayoutEffect, useReducer, useState } from "react";
import { usePathname } from "next/navigation";
import {
	arcadeReducer,
	initialArcadeState,
	type MatchResult,
} from "@/lib/arcade/machine";
import { fightStore, liveKeys } from "@/lib/arcade/store";
import { detectMode } from "@/lib/arcade/input";
import StageBoot from "./stage-boot";
import StageSelect from "./stage-select";
import StageVersus from "./stage-versus";
import StageRound from "./stage-round";
import StageResults from "./stage-results";

export default function ArcadeRoot({ children }: { children: React.ReactNode }) {
	// The arcade intro only gates the home page — deep links (blog posts,
	// etc.) go straight to the content. pathname is identical on the server
	// and client, so this doesn't introduce a hydration mismatch.
	const pathname = usePathname();
	const isHome = pathname === "/";

	// The initializer must be deterministic between server and client or React
	// reports a hydration mismatch — so it only looks at the pathname. The
	// reduced-motion downgrade happens in the layout effect below instead.
	const [state, dispatch] = useReducer(arcadeReducer, undefined, () =>
		initialArcadeState(isHome ? "boot" : "classic")
	);

	// prefers-reduced-motion users skip the arcade intro; useLayoutEffect so
	// the boot screen never paints for them
	useLayoutEffect(() => {
		if (isHome && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			dispatch({ type: "EXIT_TO_CLASSIC" });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [cinematic, setCinematic] = useState(false);

	useEffect(() => {
		setCinematic(
			"ontouchstart" in window ||
				window.matchMedia("(prefers-reduced-motion: reduce)").matches
		);

		const hasTouch = "ontouchstart" in window;
		fightStore.mode = detectMode(hasTouch);
		const pads = navigator.getGamepads?.() ?? [];
		if (Array.from(pads).some((p) => p)) fightStore.mode = "gamepad";

		const down = (e: KeyboardEvent) => {
			liveKeys.add(e.code);
			if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code))
				e.preventDefault();
		};
		const up = (e: KeyboardEvent) => liveKeys.delete(e.code);
		const pad = () => {
			fightStore.mode = "gamepad";
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		window.addEventListener("gamepadconnected", pad);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
			window.removeEventListener("gamepadconnected", pad);
		};
	}, []);

	// lock body scroll while in the arcade
	useEffect(() => {
		document.body.style.overflow = state.stage === "classic" ? "" : "hidden";
		return () => { document.body.style.overflow = ""; };
	}, [state.stage]);

	if (state.stage === "classic") {
		return (
			<>
				{children}
				{/* arcade entry only offered on the home page — parked top-right
				    under the HUD scroll readout so it never collides with the
				    hero status bar or section CTAs */}
				{isHome && (
					<button
						type="button"
						onClick={() => dispatch({ type: "ENTER_ARCADE" })}
						className="fixed right-6 top-14 z-50 border border-white/20 bg-black/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 backdrop-blur transition hover:border-[#00E5C7]/50 hover:text-[#00E5C7]"
					>
						▸ Enter Arcade
					</button>
				)}
			</>
		);
	}

	return (
		<>
			{state.stage === "boot" && <StageBoot onStart={() => dispatch({ type: "START" })} />}
			{state.stage === "select" && (
				<StageSelect onPick={(index) => dispatch({ type: "SELECT_FIGHTER", index })} />
			)}
			{state.stage === "versus" && state.fighterIndex !== null && (
				<StageVersus
					fighterIndex={state.fighterIndex}
					onDone={() => dispatch({ type: "VERSUS_DONE" })}
				/>
			)}
			{state.stage === "round" && state.fighterIndex !== null && (
				<StageRound
					fighterIndex={state.fighterIndex}
					cinematic={cinematic}
					onDone={(result: MatchResult) => dispatch({ type: "ROUND_DONE", result })}
				/>
			)}
			{state.stage === "results" && state.fighterIndex !== null && state.result && (
				<StageResults
					fighterIndex={state.fighterIndex}
					result={state.result}
					onNext={() => dispatch({ type: "NEXT_FIGHTER" })}
					onContact={() => dispatch({ type: "EXIT_TO_CLASSIC" })}
				/>
			)}

			{/* persistent escape hatch */}
			<button
				type="button"
				onClick={() => dispatch({ type: "EXIT_TO_CLASSIC" })}
				className="fixed bottom-5 right-5 z-50 border border-white/20 bg-black/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 backdrop-blur transition hover:border-white/50 hover:text-white"
			>
				Skip → Résumé
			</button>
		</>
	);
}
