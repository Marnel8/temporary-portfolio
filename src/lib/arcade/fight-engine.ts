export type Facing = 1 | -1;
export type MoveKind = "idle" | "light" | "heavy" | "block" | "jump";

export interface InputFrame {
	moveX: number; // -1..1
	jump: boolean;
	light: boolean;
	heavy: boolean;
	block: boolean;
}

export const NEUTRAL_INPUT: InputFrame = {
	moveX: 0,
	jump: false,
	light: false,
	heavy: false,
	block: false,
};

export interface FighterState {
	x: number;
	y: number;
	vx: number;
	vy: number;
	facing: Facing;
	health: number;
	move: MoveKind;
	moveTimer: number; // ticks remaining in current attack/jump
	hitstun: number; // ticks of stagger; can't act
	blockstun: number;
	hasHit: boolean; // true once this swing has already connected; reset on new attack
}

export interface FightState {
	player: FighterState;
	opponent: FighterState;
	timer: number; // seconds remaining
	over: boolean;
	winner: "player" | "opponent" | null;
	hitFlash: number; // 0..1, decays; used by renderer for shake/sparks
}

export const FIGHT = {
	DT: 1 / 60,
	MAX_HEALTH: 100,
	ROUND_TIME: 60,
	ARENA_HALF: 2.6,
	SPEED: 3.2, // units/sec
	GRAVITY: -16,
	JUMP_V: 6.5,
	GROUND: 0,
	// attack tuning: [windup, active, recovery] ticks, damage, range, knockback
	LIGHT: { windup: 4, active: 3, recovery: 8, dmg: 6, range: 0.95, kb: 0.6 },
	HEAVY: { windup: 8, active: 4, recovery: 16, dmg: 14, range: 1.1, kb: 1.4 },
	CHIP: 0.2, // fraction of damage taken while blocking
} as const;

function makeFighter(x: number, facing: Facing): FighterState {
	return {
		x,
		y: FIGHT.GROUND,
		vx: 0,
		vy: 0,
		facing,
		health: FIGHT.MAX_HEALTH,
		move: "idle",
		moveTimer: 0,
		hitstun: 0,
		blockstun: 0,
		hasHit: false,
	};
}

export function createFightState(): FightState {
	return {
		player: makeFighter(-1.2, 1),
		opponent: makeFighter(1.2, -1),
		timer: FIGHT.ROUND_TIME,
		over: false,
		winner: null,
		hitFlash: 0,
	};
}

function attackDef(move: MoveKind) {
	return move === "heavy" ? FIGHT.HEAVY : FIGHT.LIGHT;
}

// active-hit window check for an attacker mid-move
function inActiveFrames(f: FighterState): boolean {
	if (f.move !== "light" && f.move !== "heavy") return false;
	const d = attackDef(f.move);
	const elapsed = (d.windup + d.active + d.recovery) - f.moveTimer;
	return elapsed >= d.windup && elapsed < d.windup + d.active;
}

function startMove(f: FighterState, kind: "light" | "heavy") {
	const d = attackDef(kind);
	f.move = kind;
	f.moveTimer = d.windup + d.active + d.recovery;
	f.hasHit = false;
}

function canAct(f: FighterState): boolean {
	return f.hitstun <= 0 && f.blockstun <= 0 && f.moveTimer <= 0;
}

function stepFighter(f: FighterState, input: InputFrame) {
	if (f.hitstun > 0) f.hitstun -= 1;
	if (f.blockstun > 0) f.blockstun -= 1;
	if (f.moveTimer > 0) f.moveTimer -= 1;

	const grounded = f.y <= FIGHT.GROUND + 1e-4;

	if (canAct(f)) {
		f.move = input.block ? "block" : "idle";
		if (input.heavy) startMove(f, "heavy");
		else if (input.light) startMove(f, "light");
		else if (input.jump && grounded) {
			f.vy = FIGHT.JUMP_V;
			f.move = "jump";
		}
		// horizontal movement only when free to act and not attacking
		f.vx = f.move === "block" ? 0 : input.moveX * FIGHT.SPEED;
	} else {
		f.vx = 0;
	}

	// integrate
	f.x += f.vx * FIGHT.DT;
	f.vy += FIGHT.GRAVITY * FIGHT.DT;
	f.y += f.vy * FIGHT.DT;
	if (f.y < FIGHT.GROUND) {
		f.y = FIGHT.GROUND;
		f.vy = 0;
		if (f.move === "jump") f.move = "idle";
	}

	// clamp to arena
	f.x = Math.max(-FIGHT.ARENA_HALF, Math.min(FIGHT.ARENA_HALF, f.x));
}

function tryHit(attacker: FighterState, defender: FightState["player"], s: FightState) {
	if (!inActiveFrames(attacker)) return;
	if (attacker.hasHit) return;
	const d = attackDef(attacker.move);
	const dist = Math.abs(attacker.x - defender.x);
	const facingFoe = Math.sign(defender.x - attacker.x) === attacker.facing;
	if (dist > d.range || !facingFoe) return;

	const blocking = defender.move === "block";
	const dmg = blocking ? d.dmg * FIGHT.CHIP : d.dmg;
	defender.health = Math.max(0, defender.health - dmg);
	const dir = Math.sign(defender.x - attacker.x) || 1;
	defender.x += dir * d.kb * (blocking ? 0.3 : 1) * 0.1;
	if (blocking) defender.blockstun = 6;
	else defender.hitstun = attacker.move === "heavy" ? 16 : 8;

	attacker.hasHit = true;
	s.hitFlash = 1;
}

export function stepFight(s: FightState, p: InputFrame, o: InputFrame): void {
	if (s.over) return;

	// face each other
	s.player.facing = s.opponent.x >= s.player.x ? 1 : -1;
	s.opponent.facing = s.player.x >= s.opponent.x ? 1 : -1;

	stepFighter(s.player, p);
	stepFighter(s.opponent, o);

	tryHit(s.player, s.opponent, s);
	tryHit(s.opponent, s.player, s);

	// keep fighters from overlapping
	const minGap = 0.7;
	const gap = Math.abs(s.player.x - s.opponent.x);
	if (gap < minGap) {
		const push = (minGap - gap) / 2;
		const dir = Math.sign(s.player.x - s.opponent.x) || 1;
		s.player.x += dir * push;
		s.opponent.x -= dir * push;
	}

	if (s.hitFlash > 0) s.hitFlash = Math.max(0, s.hitFlash - FIGHT.DT * 3);

	s.timer = Math.max(0, s.timer - FIGHT.DT);

	if (s.player.health <= 0 || s.opponent.health <= 0) {
		s.over = true;
		s.winner = s.player.health <= 0 ? "opponent" : "player";
	} else if (s.timer <= 0) {
		s.over = true;
		s.winner = s.player.health >= s.opponent.health ? "player" : "opponent";
	}
}

export function isRoundOver(s: FightState): boolean {
	return s.over;
}
