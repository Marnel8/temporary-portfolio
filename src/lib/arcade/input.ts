import { type InputFrame, NEUTRAL_INPUT } from "./fight-engine";

// KeyboardEvent.code sets
export const KEY_MAP = {
	left: ["KeyA", "ArrowLeft"],
	right: ["KeyD", "ArrowRight"],
	jump: ["KeyW", "ArrowUp"],
	light: ["KeyJ"],
	heavy: ["KeyK"],
	block: ["Space", "ShiftLeft"],
} as const;

const has = (keys: Set<string>, codes: readonly string[]) => codes.some((c) => keys.has(c));

export function keysToInput(keys: Set<string>): InputFrame {
	const left = has(keys, KEY_MAP.left);
	const right = has(keys, KEY_MAP.right);
	return {
		moveX: (right ? 1 : 0) - (left ? 1 : 0),
		jump: has(keys, KEY_MAP.jump),
		light: has(keys, KEY_MAP.light),
		heavy: has(keys, KEY_MAP.heavy),
		block: has(keys, KEY_MAP.block),
	};
}

// Standard gamepad mapping: axes[0] = left stick X; buttons 0..3 = A,B,X,Y;
// buttons 12..15 = dpad up,down,left,right.
export function gamepadToInput(gp: Pick<Gamepad, "axes" | "buttons"> | null): InputFrame {
	if (!gp) return { ...NEUTRAL_INPUT };
	const ax = gp.axes[0] ?? 0;
	const dz = 0.3;
	const b = (i: number) => Boolean(gp.buttons[i]?.pressed);
	let moveX = Math.abs(ax) > dz ? Math.sign(ax) : 0;
	if (b(14)) moveX = -1; // dpad left
	if (b(15)) moveX = 1; // dpad right
	return {
		moveX,
		jump: b(12) || b(3), // dpad up or Y
		light: b(0), // A
		heavy: b(2), // X
		block: b(1) || b(5), // B or RB
	};
}

export function detectMode(hasTouch: boolean): "touch" | "keyboard" {
	return hasTouch ? "touch" : "keyboard";
}
