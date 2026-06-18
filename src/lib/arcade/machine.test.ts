import { describe, it, expect } from "vitest";
import { arcadeReducer, initialArcadeState, type ArcadeMachineState } from "./machine";

const win = { winner: "player" as const, playerHealth: 50, opponentHealth: 0, timedOut: false };

describe("arcadeReducer", () => {
	it("boot -> select on START", () => {
		const s = arcadeReducer(initialArcadeState("boot"), { type: "START" });
		expect(s.stage).toBe("select");
	});

	it("select -> versus records fighter index", () => {
		let s: ArcadeMachineState = initialArcadeState("select");
		s = arcadeReducer(s, { type: "SELECT_FIGHTER", index: 2 });
		expect(s.stage).toBe("versus");
		expect(s.fighterIndex).toBe(2);
	});

	it("versus -> round, round -> results stores result", () => {
		let s = arcadeReducer(initialArcadeState("versus"), { type: "VERSUS_DONE" });
		expect(s.stage).toBe("round");
		s = arcadeReducer(s, { type: "ROUND_DONE", result: win });
		expect(s.stage).toBe("results");
		expect(s.result).toEqual(win);
	});

	it("results -> select on NEXT_FIGHTER and clears result", () => {
		let s = arcadeReducer({ stage: "results", fighterIndex: 1, result: win }, { type: "NEXT_FIGHTER" });
		expect(s.stage).toBe("select");
		expect(s.result).toBeNull();
	});

	it("EXIT_TO_CLASSIC works from any stage", () => {
		const s = arcadeReducer(initialArcadeState("round"), { type: "EXIT_TO_CLASSIC" });
		expect(s.stage).toBe("classic");
	});

	it("ENTER_ARCADE from classic returns to boot", () => {
		const s = arcadeReducer(initialArcadeState("classic"), { type: "ENTER_ARCADE" });
		expect(s.stage).toBe("boot");
	});

	it("ignores irrelevant events without throwing", () => {
		const s0 = initialArcadeState("boot");
		const s1 = arcadeReducer(s0, { type: "VERSUS_DONE" });
		expect(s1.stage).toBe("boot");
	});
});
