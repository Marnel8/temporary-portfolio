import { type FighterState, type InputFrame, NEUTRAL_INPUT, FIGHT } from "./fight-engine";

const ATTACK_RANGE = FIGHT.HEAVY.range;

export function decideAction(self: FighterState, foe: FighterState): InputFrame {
	const dx = foe.x - self.x;
	const dist = Math.abs(dx);
	const input: InputFrame = { ...NEUTRAL_INPUT };

	if (dist > ATTACK_RANGE) {
		// approach
		input.moveX = Math.sign(dx);
		// occasionally hop to feel alive
		if (Math.random() < 0.01) input.jump = true;
		return input;
	}

	// in range: mostly attack, sometimes block/retreat (beatable, not passive)
	const r = Math.random();
	if (r < 0.45) input.light = true;
	else if (r < 0.7) input.heavy = true;
	else if (r < 0.85) input.block = true;
	else input.moveX = -Math.sign(dx); // back off
	return input;
}

// Cinematic mode: scripted, deterministic player that closes distance and
// throws an attack on a steady cadence so the auto-fight reads cleanly.
export function scriptedPlayerFrame(self: FighterState, foe: FighterState, tick: number): InputFrame {
	const dx = foe.x - self.x;
	const dist = Math.abs(dx);
	const input: InputFrame = { ...NEUTRAL_INPUT };
	if (dist > ATTACK_RANGE * 0.85) {
		input.moveX = Math.sign(dx);
	}
	// Attack on cadence independent of position
	if (tick % 40 < 2) {
		input.heavy = true;
	} else if (tick % 20 < 2) {
		input.light = true;
	}
	return input;
}
