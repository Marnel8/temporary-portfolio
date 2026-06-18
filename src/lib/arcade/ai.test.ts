import { describe, it, expect } from "vitest";
import { decideAction, scriptedPlayerFrame } from "./ai";
import { createFightState, FIGHT } from "./fight-engine";

describe("decideAction", () => {
	it("moves toward a far foe", () => {
		const s = createFightState();
		s.opponent.x = 2; // self
		s.player.x = -2; // foe far to the left
		const input = decideAction(s.opponent, s.player);
		expect(input.moveX).toBeLessThan(0); // moves left toward foe
	});

	it("attacks when foe is in range", () => {
		const s = createFightState();
		s.opponent.x = 0.4;
		s.player.x = -0.4; // close
		// AI is stochastic; over many calls it should attack at least once
		let attacked = false;
		for (let i = 0; i < 200; i++) {
			const inp = decideAction(s.opponent, s.player);
			if (inp.light || inp.heavy) attacked = true;
		}
		expect(attacked).toBe(true);
	});
});

describe("scriptedPlayerFrame", () => {
	it("advances toward foe and periodically attacks", () => {
		const s = createFightState();
		let attacked = false;
		for (let t = 0; t < 300; t++) {
			const inp = scriptedPlayerFrame(s.player, s.opponent, t);
			if (inp.light || inp.heavy) attacked = true;
		}
		expect(attacked).toBe(true);
	});
});
