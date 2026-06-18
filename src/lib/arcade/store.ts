import { createFightState, type FightState } from "./fight-engine";
import type { InputMode } from "./machine";

export const liveKeys = new Set<string>();

export const fightStore: {
	state: FightState;
	mode: InputMode;
	cinematic: boolean;
	reset: () => void;
} = {
	state: createFightState(),
	mode: "keyboard",
	cinematic: false,
	reset() {
		this.state = createFightState();
	},
};
