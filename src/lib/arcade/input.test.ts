import { describe, it, expect } from "vitest";
import { keysToInput, gamepadToInput, detectMode } from "./input";

describe("keysToInput", () => {
	it("maps movement and attack keys", () => {
		const right = keysToInput(new Set(["KeyD"]));
		expect(right.moveX).toBe(1);
		const left = keysToInput(new Set(["ArrowLeft"]));
		expect(left.moveX).toBe(-1);
		const both = keysToInput(new Set(["KeyA", "KeyD"]));
		expect(both.moveX).toBe(0);
		expect(keysToInput(new Set(["KeyJ"])).light).toBe(true);
		expect(keysToInput(new Set(["KeyK"])).heavy).toBe(true);
		expect(keysToInput(new Set(["Space"])).block).toBe(true);
		expect(keysToInput(new Set(["KeyW"])).jump).toBe(true);
	});
});

describe("gamepadToInput", () => {
	it("reads axis and face buttons", () => {
		const gp = {
			axes: [0.9, 0],
			buttons: Array.from({ length: 8 }, () => ({ pressed: false, value: 0 })),
		} as any;
		gp.buttons[0] = { pressed: true, value: 1 }; // A -> light
		const inp = gamepadToInput(gp);
		expect(inp.moveX).toBe(1);
		expect(inp.light).toBe(true);
	});

	it("returns neutral for null pad", () => {
		expect(gamepadToInput(null).moveX).toBe(0);
	});
});

describe("detectMode", () => {
	it("picks touch when touch is present", () => {
		expect(detectMode(true)).toBe("touch");
		expect(detectMode(false)).toBe("keyboard");
	});
});
