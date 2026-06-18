import { describe, it, expect } from "vitest";
import {
	createFightState,
	stepFight,
	isRoundOver,
	NEUTRAL_INPUT,
	FIGHT,
	type InputFrame,
} from "./fight-engine";

const move = (moveX: number): InputFrame => ({ ...NEUTRAL_INPUT, moveX });
const attack = (k: "light" | "heavy"): InputFrame => ({ ...NEUTRAL_INPUT, [k]: true });

describe("fight-engine", () => {
	it("starts both fighters at full health within the arena", () => {
		const s = createFightState();
		expect(s.player.health).toBe(FIGHT.MAX_HEALTH);
		expect(s.opponent.health).toBe(FIGHT.MAX_HEALTH);
		expect(s.over).toBe(false);
	});

	it("moving right increases player x and clamps to arena", () => {
		const s = createFightState();
		for (let i = 0; i < 600; i++) stepFight(s, move(1), NEUTRAL_INPUT);
		expect(s.player.x).toBeGreaterThan(0);
		expect(s.player.x).toBeLessThanOrEqual(FIGHT.ARENA_HALF + 0.001);
	});

	it("a connecting attack reduces opponent health", () => {
		const s = createFightState();
		s.player.x = -0.4;
		s.opponent.x = 0.4; // within hit range
		const before = s.opponent.health;
		// trigger + let the active frames resolve
		for (let i = 0; i < 30; i++) stepFight(s, attack("heavy"), NEUTRAL_INPUT);
		expect(s.opponent.health).toBeLessThan(before);
	});

	it("blocking reduces incoming damage to chip", () => {
		const ref = createFightState();
		ref.player.x = -0.4;
		ref.opponent.x = 0.4;
		for (let i = 0; i < 30; i++) stepFight(ref, attack("heavy"), NEUTRAL_INPUT);
		const fullDamage = FIGHT.MAX_HEALTH - ref.opponent.health;

		const s = createFightState();
		s.player.x = -0.4;
		s.opponent.x = 0.4;
		const blocking: InputFrame = { ...NEUTRAL_INPUT, block: true };
		for (let i = 0; i < 30; i++) stepFight(s, attack("heavy"), blocking);
		const blockedDamage = FIGHT.MAX_HEALTH - s.opponent.health;

		expect(blockedDamage).toBeGreaterThan(0);
		expect(blockedDamage).toBeLessThan(fullDamage);
	});

	it("ends the round and names a winner when health hits zero", () => {
		const s = createFightState();
		s.opponent.health = 1;
		s.player.x = -0.4;
		s.opponent.x = 0.4;
		for (let i = 0; i < 60; i++) stepFight(s, attack("heavy"), NEUTRAL_INPUT);
		expect(isRoundOver(s)).toBe(true);
		expect(s.winner).toBe("player");
	});

	it("times out to the higher-health fighter", () => {
		const s = createFightState();
		s.timer = FIGHT.DT * 1.5; // about to expire
		s.player.health = 80;
		s.opponent.health = 30;
		stepFight(s, NEUTRAL_INPUT, NEUTRAL_INPUT);
		stepFight(s, NEUTRAL_INPUT, NEUTRAL_INPUT);
		expect(s.over).toBe(true);
		expect(s.winner).toBe("player");
	});
});
