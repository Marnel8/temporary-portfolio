import { createFightState, NEUTRAL_INPUT, type FightState, type InputFrame } from "./fight-engine";
import type { InputMode } from "./machine";

export const liveKeys = new Set<string>();

export const fightStore: {
	state: FightState;
	playerInput: InputFrame;
	mode: InputMode;
	cinematic: boolean;
	reset: () => void;
} = {
	state: createFightState(),
	playerInput: { ...NEUTRAL_INPUT },
	mode: "keyboard",
	cinematic: false,
	reset() {
		this.state = createFightState();
		this.playerInput = { ...NEUTRAL_INPUT };
	},
};
