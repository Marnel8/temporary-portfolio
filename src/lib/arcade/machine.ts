export type ArcadeStage = "boot" | "select" | "versus" | "round" | "results" | "classic";
export type InputMode = "keyboard" | "gamepad" | "touch";

export interface MatchResult {
	winner: "player" | "opponent";
	playerHealth: number;
	opponentHealth: number;
	timedOut: boolean;
}

export type ArcadeEvent =
	| { type: "START" }
	| { type: "SELECT_FIGHTER"; index: number }
	| { type: "VERSUS_DONE" }
	| { type: "ROUND_DONE"; result: MatchResult }
	| { type: "NEXT_FIGHTER" }
	| { type: "EXIT_TO_CLASSIC" }
	| { type: "ENTER_ARCADE" };

export interface ArcadeMachineState {
	stage: ArcadeStage;
	fighterIndex: number | null;
	result: MatchResult | null;
}

export function initialArcadeState(stage: ArcadeStage = "boot"): ArcadeMachineState {
	return { stage, fighterIndex: null, result: null };
}

export function arcadeReducer(state: ArcadeMachineState, event: ArcadeEvent): ArcadeMachineState {
	switch (event.type) {
		case "EXIT_TO_CLASSIC":
			return { ...state, stage: "classic" };
		case "ENTER_ARCADE":
			return { ...initialArcadeState("boot") };
		case "START":
			return state.stage === "boot" ? { ...state, stage: "select" } : state;
		case "SELECT_FIGHTER":
			return state.stage === "select"
				? { ...state, stage: "versus", fighterIndex: event.index, result: null }
				: state;
		case "VERSUS_DONE":
			return state.stage === "versus" ? { ...state, stage: "round" } : state;
		case "ROUND_DONE":
			return state.stage === "round"
				? { ...state, stage: "results", result: event.result }
				: state;
		case "NEXT_FIGHTER":
			return state.stage === "results"
				? { ...state, stage: "select", fighterIndex: null, result: null }
				: state;
		default:
			return state;
	}
}
