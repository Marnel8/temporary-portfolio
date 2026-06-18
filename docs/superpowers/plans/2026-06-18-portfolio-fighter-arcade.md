# PORTFOLIO FIGHTER Arcade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the portfolio into a Tekken-style arcade (Boot → Character Select → Versus → playable 2.5D Round → Results) where each project is a fighter, with a persistent escape to the classic scrollable site.

**Architecture:** A client-side state machine (`React` reducer) drives infrequent stage transitions; per-frame fight data lives in a mutable ref store (like the existing `scroll-store.ts`) so the R3F game loop never triggers React re-renders. All game logic (state machine, fight engine, AI, input normalization) is framework-free and unit-tested with Vitest. Stages are React components; the fight renders in its own `<Canvas>`.

**Tech Stack:** Next.js 14 (App Router, `"use client"`), React 18, React-Three-Fiber 8 / drei 9, three 0.160, GSAP 3, TypeScript 5, Vitest (added in Task 1).

## Global Constraints

- Palette: background `#070809`, foreground `#f5f3ef`, player/accent blue `#2f6bff` (also used as `hsl(222,96%,64%)` in CSS), opponent hot `#ff5a3c`. Reuse these exact values.
- Fonts/utility classes: reuse `font-display`, `font-mono`, and the existing HUD-label style (`font-mono text-[10px] uppercase tracking-[0.3em] text-white/40`).
- All arcade components are client components (`"use client"`).
- Roster source is `DATA.projects` from `src/data/resume.tsx`. New arcade fields are **optional** with fallbacks — never break existing project rendering.
- Per-frame game state must NOT live in React state. Use the mutable store from Task 6.
- Touch devices and `prefers-reduced-motion` users get the cinematic auto-fight, never touch combat.
- Fixed-timestep physics: the fight integrates at a fixed `DT = 1/60` via an accumulator so behavior is frame-rate independent.
- Commit after every task with the shown message.

---

### Task 1: Vitest setup + arcade data layer

**Files:**
- Modify: `package.json` (add devDeps + `test` script)
- Create: `vitest.config.ts`
- Create: `src/lib/arcade/fighters.ts`
- Test: `src/lib/arcade/fighters.test.ts`

**Interfaces:**
- Produces:
  - `interface Fighter { index: number; name: string; title: string; description: string; technologies: string[]; stats: { label: string; value: number }[]; stage: string; demoUrl: string | null; repoUrl: string | null; image: string | null; }`
  - `function getFighters(): Fighter[]` — derives the roster from `DATA.projects` with fallbacks.

- [ ] **Step 1: Add Vitest deps and test script**

Run:
```bash
npm install -D vitest@^2 @vitejs/plugin-react@^4 jsdom@^25
```
Then in `package.json` `"scripts"`, add after `"lint"`:
```json
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
```

- [ ] **Step 2: Create Vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
	plugins: [react()],
	test: {
		environment: "jsdom",
		globals: true,
	},
	resolve: {
		alias: { "@": path.resolve(__dirname, "src") },
	},
});
```

- [ ] **Step 3: Write the failing test**

Create `src/lib/arcade/fighters.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getFighters } from "./fighters";

describe("getFighters", () => {
	it("returns one fighter per project", () => {
		const fighters = getFighters();
		expect(fighters.length).toBeGreaterThan(0);
	});

	it("assigns sequential indices and falls back name to title", () => {
		const f = getFighters()[0];
		expect(f.index).toBe(0);
		expect(f.name.length).toBeGreaterThan(0);
		expect(f.name).toBe(f.title.toUpperCase());
	});

	it("derives up to 4 stats from technologies", () => {
		const f = getFighters()[0];
		expect(f.stats.length).toBeGreaterThan(0);
		expect(f.stats.length).toBeLessThanOrEqual(4);
		for (const s of f.stats) {
			expect(s.value).toBeGreaterThanOrEqual(40);
			expect(s.value).toBeLessThanOrEqual(100);
		}
	});

	it("always assigns a non-empty stage name", () => {
		for (const f of getFighters()) {
			expect(f.stage.length).toBeGreaterThan(0);
		}
	});
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm run test -- fighters`
Expected: FAIL — `getFighters` not found / module missing.

- [ ] **Step 5: Implement `getFighters`**

Create `src/lib/arcade/fighters.ts`:
```ts
import { DATA } from "@/data/resume";

export interface FighterStat {
	label: string;
	value: number;
}

export interface Fighter {
	index: number;
	name: string;
	title: string;
	description: string;
	technologies: string[];
	stats: FighterStat[];
	stage: string;
	demoUrl: string | null;
	repoUrl: string | null;
	image: string | null;
}

const STAGES = ["NEON DOJO", "DATA TEMPLE", "THE STACK", "SHIP YARD", "EDGE ARENA"];

// Deterministic 40-100 "power" from a string so stats are stable per build.
function powerFor(seed: string): number {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	return 40 + (Math.abs(h) % 61);
}

export function getFighters(): Fighter[] {
	return DATA.projects.map((p, index) => {
		const technologies = p.technologies ?? [];
		const stats = technologies.slice(0, 4).map((t) => ({
			label: t.toUpperCase(),
			value: powerFor(t + p.title),
		}));
		const repo = p.links?.find((l) => /source|github/i.test(l.type))?.href || null;
		const demo =
			p.links?.find((l) => /web|site|live|demo/i.test(l.type))?.href ||
			(p.href ? p.href : null);
		return {
			index,
			name: p.title.toUpperCase(),
			title: p.title,
			description: p.description ?? "",
			technologies,
			stats: stats.length ? stats : [{ label: "FULL STACK", value: 70 }],
			stage: STAGES[index % STAGES.length],
			demoUrl: demo,
			repoUrl: repo,
			image: p.image || null,
		};
	});
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm run test -- fighters`
Expected: PASS (all 4 tests).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/arcade/fighters.ts src/lib/arcade/fighters.test.ts
git commit -m "feat(arcade): add vitest + fighter roster derived from projects

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Arcade state machine (pure reducer)

**Files:**
- Create: `src/lib/arcade/machine.ts`
- Test: `src/lib/arcade/machine.test.ts`

**Interfaces:**
- Consumes: nothing from prior tasks.
- Produces:
  - `type ArcadeStage = "boot" | "select" | "versus" | "round" | "results" | "classic"`
  - `type InputMode = "keyboard" | "gamepad" | "touch"`
  - `interface MatchResult { winner: "player" | "opponent"; playerHealth: number; opponentHealth: number; timedOut: boolean }`
  - `type ArcadeEvent = { type: "START" } | { type: "SELECT_FIGHTER"; index: number } | { type: "VERSUS_DONE" } | { type: "ROUND_DONE"; result: MatchResult } | { type: "NEXT_FIGHTER" } | { type: "EXIT_TO_CLASSIC" } | { type: "ENTER_ARCADE" }`
  - `interface ArcadeMachineState { stage: ArcadeStage; fighterIndex: number | null; result: MatchResult | null }`
  - `const initialArcadeState: (start: ArcadeStage) => ArcadeMachineState`
  - `function arcadeReducer(state: ArcadeMachineState, event: ArcadeEvent): ArcadeMachineState`

- [ ] **Step 1: Write the failing test**

Create `src/lib/arcade/machine.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- machine`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement the reducer**

Create `src/lib/arcade/machine.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- machine`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/arcade/machine.ts src/lib/arcade/machine.test.ts
git commit -m "feat(arcade): add arcade state machine reducer

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Fight engine (pure, fixed-timestep)

**Files:**
- Create: `src/lib/arcade/fight-engine.ts`
- Test: `src/lib/arcade/fight-engine.test.ts`

**Interfaces:**
- Produces:
  - `type Facing = 1 | -1`
  - `type MoveKind = "idle" | "light" | "heavy" | "block" | "jump"`
  - `interface InputFrame { moveX: number; jump: boolean; light: boolean; heavy: boolean; block: boolean }`
  - `const NEUTRAL_INPUT: InputFrame`
  - `interface FighterState { x: number; y: number; vx: number; vy: number; facing: Facing; health: number; move: MoveKind; moveTimer: number; hitstun: number; blockstun: number; }`
  - `interface FightState { player: FighterState; opponent: FighterState; timer: number; over: boolean; winner: "player" | "opponent" | null; hitFlash: number }`
  - `const FIGHT = { DT, MAX_HEALTH, ROUND_TIME, ARENA_HALF, ... }` constants
  - `function createFightState(): FightState`
  - `function stepFight(s: FightState, p: InputFrame, o: InputFrame): void` — advances exactly one fixed `DT` tick, mutating `s`.
  - `function isRoundOver(s: FightState): boolean`

- [ ] **Step 1: Write the failing test**

Create `src/lib/arcade/fight-engine.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- fight-engine`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement the engine**

Create `src/lib/arcade/fight-engine.ts`:
```ts
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

function tryHit(attacker: FighterState, defender: FightState["player"], s: FightState, who: "player" | "opponent") {
	if (!inActiveFrames(attacker)) return;
	// one hit per active window: mark by zeroing remaining active via flag on moveTimer
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

	// consume the rest of the active+recovery so a single swing lands once
	attacker.moveTimer = Math.min(attacker.moveTimer, d.recovery);
	s.hitFlash = 1;
}

export function stepFight(s: FightState, p: InputFrame, o: InputFrame): void {
	if (s.over) return;

	// face each other
	s.player.facing = s.opponent.x >= s.player.x ? 1 : -1;
	s.opponent.facing = s.player.x >= s.opponent.x ? 1 : -1;

	stepFighter(s.player, p);
	stepFighter(s.opponent, o);

	tryHit(s.player, s.opponent, s, "player");
	tryHit(s.opponent, s.player, s, "opponent");

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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- fight-engine`
Expected: PASS (6 tests). If the "connecting attack" test is flaky on range, confirm `FIGHT.HEAVY.range` ≥ the test's 0.8 gap — it is (1.1).

- [ ] **Step 5: Commit**

```bash
git add src/lib/arcade/fight-engine.ts src/lib/arcade/fight-engine.test.ts
git commit -m "feat(arcade): add fixed-timestep fight engine

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Opponent AI + cinematic script

**Files:**
- Create: `src/lib/arcade/ai.ts`
- Test: `src/lib/arcade/ai.test.ts`

**Interfaces:**
- Consumes: `FighterState`, `InputFrame`, `NEUTRAL_INPUT`, `FIGHT` from `fight-engine.ts`.
- Produces:
  - `function decideAction(self: FighterState, foe: FighterState): InputFrame` — opponent brain.
  - `function scriptedPlayerFrame(self: FighterState, foe: FighterState, tick: number): InputFrame` — drives the player capsule in cinematic mode (approach + periodic attacks).

- [ ] **Step 1: Write the failing test**

Create `src/lib/arcade/ai.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- ai`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement the AI**

Create `src/lib/arcade/ai.ts`:
```ts
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
	} else if (tick % 40 < 2) {
		input.heavy = true;
	} else if (tick % 20 < 2) {
		input.light = true;
	}
	return input;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- ai`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/arcade/ai.ts src/lib/arcade/ai.test.ts
git commit -m "feat(arcade): add opponent AI and cinematic player script

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Input normalization (keyboard + gamepad)

**Files:**
- Create: `src/lib/arcade/input.ts`
- Test: `src/lib/arcade/input.test.ts`

**Interfaces:**
- Consumes: `InputFrame`, `NEUTRAL_INPUT` from `fight-engine.ts`.
- Produces:
  - `const KEY_MAP` (documented mapping)
  - `function keysToInput(keys: Set<string>): InputFrame` — keys are `KeyboardEvent.code` values.
  - `function gamepadToInput(gp: Pick<Gamepad, "axes" | "buttons"> | null): InputFrame`
  - `function detectMode(hasTouch: boolean): "touch" | "keyboard"` — initial mode (gamepad upgrades at runtime when a pad reports activity).

- [ ] **Step 1: Write the failing test**

Create `src/lib/arcade/input.test.ts`:
```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- input`
Expected: FAIL — module missing.

- [ ] **Step 3: Implement input mapping**

Create `src/lib/arcade/input.ts`:
```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- input`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/arcade/input.ts src/lib/arcade/input.test.ts
git commit -m "feat(arcade): add keyboard + gamepad input normalization

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 6: Mutable fight store

**Files:**
- Create: `src/lib/arcade/store.ts`

**Interfaces:**
- Consumes: `FightState`, `createFightState`, `InputMode`.
- Produces:
  - `const fightStore: { state: FightState; playerInput: InputFrame; mode: InputMode; cinematic: boolean; reset(): void }`
  - `const liveKeys: Set<string>` — current pressed `KeyboardEvent.code`s, mutated by the keyboard listener.

This task has no separate unit test (it is a mutable singleton consumed by the renderer); it is verified via the round in Task 8.

- [ ] **Step 1: Implement the store**

Create `src/lib/arcade/store.ts`:
```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors from these files.

- [ ] **Step 3: Commit**

```bash
git add src/lib/arcade/store.ts
git commit -m "feat(arcade): add mutable fight store

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 7: Procedural neon fighter (R3F)

**Files:**
- Create: `src/components/arcade/fighter.tsx`

**Interfaces:**
- Consumes: `FighterState` from `fight-engine.ts`.
- Produces: default export `Fighter` React component:
  `function Fighter({ state, color }: { state: FighterState; color: string }): JSX.Element` — a group that reads `state` each frame (via parent passing the live object) and poses limbs from `state.move`, `state.x`, `state.y`, `state.facing`.

This is a visual unit; verified in Task 8.

- [ ] **Step 1: Implement the fighter**

Create `src/components/arcade/fighter.tsx`:
```tsx
"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { FighterState } from "@/lib/arcade/fight-engine";

export default function Fighter({
	state,
	color,
}: {
	state: FighterState;
	color: string;
}) {
	const group = useRef<THREE.Group>(null!);
	const armR = useRef<THREE.Mesh>(null!);
	const torso = useRef<THREE.Group>(null!);

	useFrame((_, dt) => {
		const g = group.current;
		if (!g) return;
		g.position.x = THREE.MathUtils.lerp(g.position.x, state.x, 0.5);
		g.position.y = state.y;
		g.scale.x = state.facing; // flip to face foe

		// punch pose: extend right arm during attack
		const attacking = state.move === "light" || state.move === "heavy";
		const target = attacking ? Math.PI / 2 : 0;
		if (armR.current)
			armR.current.rotation.z = THREE.MathUtils.lerp(armR.current.rotation.z, target, 0.4);
		// crouch slightly when blocking
		if (torso.current) {
			const ty = state.move === "block" ? -0.12 : 0;
			torso.current.position.y = THREE.MathUtils.lerp(torso.current.position.y, ty, 0.3);
		}
	});

	const mat = (
		<meshStandardMaterial
			color={color}
			emissive={color}
			emissiveIntensity={0.6}
			roughness={0.25}
			metalness={0.7}
		/>
	);

	return (
		<group ref={group}>
			<group ref={torso}>
				{/* head */}
				<mesh position={[0, 1.5, 0]}>
					<sphereGeometry args={[0.22, 16, 16]} />
					{mat}
				</mesh>
				{/* torso */}
				<mesh position={[0, 1, 0]}>
					<capsuleGeometry args={[0.22, 0.6, 6, 12]} />
					{mat}
				</mesh>
				{/* right arm (punching) */}
				<mesh ref={armR} position={[0.25, 1.15, 0]}>
					<capsuleGeometry args={[0.08, 0.5, 4, 8]} />
					{mat}
				</mesh>
				{/* left arm */}
				<mesh position={[-0.25, 1.15, 0]} rotation={[0, 0, -0.2]}>
					<capsuleGeometry args={[0.08, 0.5, 4, 8]} />
					{mat}
				</mesh>
				{/* legs */}
				<mesh position={[0.12, 0.35, 0]}>
					<capsuleGeometry args={[0.09, 0.55, 4, 8]} />
					{mat}
				</mesh>
				<mesh position={[-0.12, 0.35, 0]}>
					<capsuleGeometry args={[0.09, 0.55, 4, 8]} />
					{mat}
				</mesh>
			</group>
		</group>
	);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/arcade/fighter.tsx
git commit -m "feat(arcade): add procedural neon fighter component

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 8: Round stage — fight canvas, loop, and HUD

**Files:**
- Create: `src/components/arcade/arcade-hud.tsx`
- Create: `src/components/arcade/stage-round.tsx`

**Interfaces:**
- Consumes: `fightStore`, `liveKeys` (store.ts); `keysToInput`, `gamepadToInput` (input.ts); `decideAction`, `scriptedPlayerFrame` (ai.ts); `stepFight`, `FIGHT` (fight-engine.ts); `Fighter` (fighter.tsx); `Fighter` roster type + `getFighters` (fighters.ts); `MatchResult` (machine.ts).
- Produces:
  - default export `StageRound`:
    `function StageRound({ fighterIndex, cinematic, onDone }: { fighterIndex: number; cinematic: boolean; onDone: (r: MatchResult) => void }): JSX.Element`
  - named export `ArcadeHud` from `arcade-hud.tsx`:
    `function ArcadeHud({ playerName, oppName, getState }: { playerName: string; oppName: string; getState: () => { playerHealth: number; oppHealth: number; timer: number } }): JSX.Element`

- [ ] **Step 1: Implement the HUD**

Create `src/components/arcade/arcade-hud.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import { FIGHT } from "@/lib/arcade/fight-engine";

export function ArcadeHud({
	playerName,
	oppName,
	getState,
}: {
	playerName: string;
	oppName: string;
	getState: () => { playerHealth: number; oppHealth: number; timer: number };
}) {
	const pBar = useRef<HTMLDivElement>(null);
	const oBar = useRef<HTMLDivElement>(null);
	const clock = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let raf = 0;
		const tick = () => {
			const { playerHealth, oppHealth, timer } = getState();
			if (pBar.current) pBar.current.style.width = `${(playerHealth / FIGHT.MAX_HEALTH) * 100}%`;
			if (oBar.current) oBar.current.style.width = `${(oppHealth / FIGHT.MAX_HEALTH) * 100}%`;
			if (clock.current) clock.current.textContent = String(Math.ceil(timer)).padStart(2, "0");
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [getState]);

	return (
		<div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-6">
			<div className="flex-1">
				<div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">{playerName}</div>
				<div className="mt-1 h-3 w-full -skew-x-12 overflow-hidden border border-white/20 bg-black/40">
					<div ref={pBar} className="h-full bg-[hsl(222,96%,64%)]" style={{ width: "100%" }} />
				</div>
			</div>
			<div
				ref={clock}
				className="font-display text-3xl font-bold tabular-nums text-[#f5f3ef]"
			>
				60
			</div>
			<div className="flex-1">
				<div className="text-right font-mono text-[10px] uppercase tracking-[0.3em] text-white/60">{oppName}</div>
				<div className="mt-1 flex h-3 w-full -skew-x-12 justify-end overflow-hidden border border-white/20 bg-black/40">
					<div ref={oBar} className="h-full bg-[#ff5a3c]" style={{ width: "100%" }} />
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Implement the round stage**

Create `src/components/arcade/stage-round.tsx`:
```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { fightStore, liveKeys } from "@/lib/arcade/store";
import { keysToInput, gamepadToInput } from "@/lib/arcade/input";
import { decideAction, scriptedPlayerFrame } from "@/lib/arcade/ai";
import { stepFight, FIGHT, NEUTRAL_INPUT, type MoveKind } from "@/lib/arcade/fight-engine";
import { getFighters } from "@/lib/arcade/fighters";
import type { MatchResult } from "@/lib/arcade/machine";
import Fighter from "./fighter";
import { ArcadeHud } from "./arcade-hud";

const ACCENT = "#2f6bff";
const HOT = "#ff5a3c";

function Loop({ cinematic, onDone }: { cinematic: boolean; onDone: (r: MatchResult) => void }) {
	const acc = useRef(0);
	const tick = useRef(0);
	const finished = useRef(false);

	useFrame(({ camera }, dt) => {
		acc.current += Math.min(dt, 0.05); // clamp huge frames
		const s = fightStore.state;

		while (acc.current >= FIGHT.DT) {
			acc.current -= FIGHT.DT;
			tick.current += 1;

			const pInput = cinematic
				? scriptedPlayerFrame(s.player, s.opponent, tick.current)
				: fightStore.mode === "gamepad"
				? gamepadToInput(navigator.getGamepads?.()[0] ?? null)
				: keysToInput(liveKeys);

			const oInput = decideAction(s.opponent, s.player);
			stepFight(s, pInput, oInput);
		}

		// camera shake on hit
		const shake = s.hitFlash * 0.12;
		camera.position.x = (Math.random() - 0.5) * shake;
		camera.position.y = 1 + (Math.random() - 0.5) * shake;

		if (s.over && !finished.current) {
			finished.current = true;
			onDone({
				winner: s.winner ?? "player",
				playerHealth: s.player.health,
				opponentHealth: s.opponent.health,
				timedOut: s.timer <= 0,
			});
		}
	});

	return null;
}

export default function StageRound({
	fighterIndex,
	cinematic,
	onDone,
}: {
	fighterIndex: number;
	cinematic: boolean;
	onDone: (r: MatchResult) => void;
}) {
	const fighters = useMemo(() => getFighters(), []);
	const opp = fighters[fighterIndex] ?? fighters[0];
	const [announce, setAnnounce] = useState("FIGHT!");

	useEffect(() => {
		fightStore.reset();
		fightStore.cinematic = cinematic;
		const t = setTimeout(() => setAnnounce(""), 1200);
		return () => clearTimeout(t);
	}, [cinematic, fighterIndex]);

	const getHud = useMemo(
		() => () => ({
			playerHealth: fightStore.state.player.health,
			oppHealth: fightStore.state.opponent.health,
			timer: fightStore.state.timer,
		}),
		[]
	);

	return (
		<div className="fixed inset-0 z-40 bg-[#070809]">
			<ArcadeHud playerName="MARNEL" oppName={opp.name} getState={getHud} />
			{announce && (
				<div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
					<span className="font-display text-7xl font-bold tracking-tight text-[#f5f3ef] drop-shadow-[0_0_20px_rgba(47,107,255,0.6)]">
						{announce}
					</span>
				</div>
			)}
			<Canvas
				dpr={[1, 1.6]}
				gl={{ antialias: true, powerPreference: "high-performance" }}
				camera={{ position: [0, 1, 6], fov: 45 }}
			>
				<color attach="background" args={["#070809"]} />
				<fog attach="fog" args={["#070809", 7, 18]} />
				<ambientLight intensity={0.5} />
				<pointLight position={[4, 5, 5]} intensity={120} color={ACCENT} />
				<pointLight position={[-5, 3, 4]} intensity={90} color={HOT} />
				{/* floor */}
				<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
					<planeGeometry args={[30, 30]} />
					<meshStandardMaterial color="#0c0e12" metalness={0.6} roughness={0.4} />
				</mesh>
				<gridHelper args={[30, 30, ACCENT, "#1a1d24"]} position={[0, 0.01, 0]} />
				<Fighter state={fightStore.state.player} color={ACCENT} />
				<Fighter state={fightStore.state.opponent} color={HOT} />
				<Loop cinematic={cinematic} onDone={onDone} />
			</Canvas>
		</div>
	);
}
```

- [ ] **Step 3: Manual verification (temporary harness)**

Temporarily add to `src/app/page.tsx` (top of returned `<main>`, will be removed in Task 13) a mount of `StageRound` with a console.log on done. Run:
```bash
npm run dev
```
Open `http://localhost:3000`. Expected: two neon figures on a gridded stage, "FIGHT!" flashes, opponent approaches and trades hits, health bars drain, timer counts down, and after a KO/timeout the `onDone` result logs to console. Press A/D to move, J/K to attack, Space to block (desktop). Remove the temporary mount before committing.

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/arcade/arcade-hud.tsx src/components/arcade/stage-round.tsx
git commit -m "feat(arcade): add round stage, game loop, and HUD

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 9: Boot stage

**Files:**
- Create: `src/components/arcade/stage-boot.tsx`

**Interfaces:**
- Produces: default export `StageBoot`:
  `function StageBoot({ onStart }: { onStart: () => void }): JSX.Element` — listens for any key/pointer/gamepad press and calls `onStart` once.

- [ ] **Step 1: Implement boot stage**

Create `src/components/arcade/stage-boot.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";
import { DATA } from "@/data/resume";

export default function StageBoot({ onStart }: { onStart: () => void }) {
	const fired = useRef(false);

	useEffect(() => {
		const go = () => {
			if (fired.current) return;
			fired.current = true;
			onStart();
		};
		window.addEventListener("keydown", go);
		window.addEventListener("pointerdown", go);
		return () => {
			window.removeEventListener("keydown", go);
			window.removeEventListener("pointerdown", go);
		};
	}, [onStart]);

	return (
		<div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#070809] text-center">
			<div className="boot-flicker font-display text-[14vw] font-bold leading-[0.8] tracking-tight text-[#f5f3ef] sm:text-[9vw]">
				PORTFOLIO
				<br />
				<span className="text-[hsl(222,96%,64%)]">FIGHTER</span>
			</div>
			<div className="mt-8 font-mono text-[11px] uppercase tracking-[0.35em] text-white/50">
				{DATA.name} · Web Developer
			</div>
			<div className="mt-16 animate-pulse font-mono text-sm uppercase tracking-[0.3em] text-[hsl(222,96%,64%)]">
				Insert Coin · Press Start
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Add the boot flicker keyframe**

In `src/app/globals.css`, append:
```css
@keyframes boot-flicker {
	0%, 19%, 21%, 23%, 80%, 100% { opacity: 1; }
	20%, 22%, 81% { opacity: 0.35; }
}
.boot-flicker { animation: boot-flicker 2.2s steps(1) 1; }
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/arcade/stage-boot.tsx src/app/globals.css
git commit -m "feat(arcade): add boot stage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 10: Character select stage

**Files:**
- Create: `src/components/arcade/stage-select.tsx`

**Interfaces:**
- Consumes: `getFighters` + `Fighter` type (fighters.ts).
- Produces: default export `StageSelect`:
  `function StageSelect({ onPick }: { onPick: (index: number) => void }): JSX.Element`

- [ ] **Step 1: Implement select stage**

Create `src/components/arcade/stage-select.tsx`:
```tsx
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { getFighters } from "@/lib/arcade/fighters";

export default function StageSelect({ onPick }: { onPick: (index: number) => void }) {
	const fighters = useMemo(() => getFighters(), []);
	const [active, setActive] = useState(0);
	const f = fighters[active];

	return (
		<div className="fixed inset-0 z-40 flex flex-col bg-[#070809] p-6 sm:p-10">
			<div className="mb-6 flex items-center gap-4">
				<span className="font-mono text-[11px] tracking-[0.3em] text-[hsl(222,96%,64%)]">SELECT</span>
				<span className="h-px w-10 bg-white/20" />
				<h2 className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/60">Choose your fighter</h2>
			</div>

			<div className="grid flex-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
				{/* roster grid */}
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{fighters.map((fighter) => (
						<button
							key={fighter.index}
							onMouseEnter={() => setActive(fighter.index)}
							onFocus={() => setActive(fighter.index)}
							onClick={() => onPick(fighter.index)}
							className={`group relative aspect-[3/4] overflow-hidden border bg-white/[0.02] text-left transition ${
								active === fighter.index
									? "border-[hsl(222,96%,64%)] shadow-[0_0_30px_-8px_hsl(222,96%,64%)]"
									: "border-white/10 hover:border-white/30"
							}`}
						>
							{fighter.image && (
								<Image
									src={fighter.image}
									alt={fighter.name}
									fill
									className="object-cover opacity-50 transition group-hover:opacity-80"
									sizes="200px"
								/>
							)}
							<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
								<span className="font-display text-sm font-semibold text-[#f5f3ef]">{fighter.name}</span>
							</div>
						</button>
					))}
				</div>

				{/* fighter card */}
				<div className="flex flex-col justify-end border border-white/10 bg-white/[0.02] p-6">
					<div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[hsl(222,96%,64%)]">{f.stage}</div>
					<h3 className="mt-2 font-display text-4xl font-bold tracking-tight text-[#f5f3ef]">{f.name}</h3>
					<p className="mt-3 text-sm leading-relaxed text-white/55">{f.description}</p>
					<div className="mt-6 space-y-2">
						{f.stats.map((s) => (
							<div key={s.label}>
								<div className="flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">
									<span>{s.label}</span>
									<span>{s.value}</span>
								</div>
								<div className="mt-1 h-1.5 w-full overflow-hidden bg-white/10">
									<div className="h-full bg-[hsl(222,96%,64%)]" style={{ width: `${s.value}%` }} />
								</div>
							</div>
						))}
					</div>
					<button
						onClick={() => onPick(f.index)}
						className="mt-8 w-full -skew-x-6 bg-[hsl(222,96%,64%)] py-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#070809] transition hover:brightness-110"
					>
						Fight →
					</button>
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/arcade/stage-select.tsx
git commit -m "feat(arcade): add character select stage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 11: Versus intro stage

**Files:**
- Create: `src/components/arcade/stage-versus.tsx`

**Interfaces:**
- Consumes: `getFighters` (fighters.ts), `DATA` (resume), `gsap`.
- Produces: default export `StageVersus`:
  `function StageVersus({ fighterIndex, onDone }: { fighterIndex: number; onDone: () => void }): JSX.Element` — runs a ~2.8s GSAP slam-in then calls `onDone`.

- [ ] **Step 1: Implement versus stage**

Create `src/components/arcade/stage-versus.tsx`:
```tsx
"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import Image from "next/image";
import { getFighters } from "@/lib/arcade/fighters";
import { DATA } from "@/data/resume";

export default function StageVersus({
	fighterIndex,
	onDone,
}: {
	fighterIndex: number;
	onDone: () => void;
}) {
	const fighters = useMemo(() => getFighters(), []);
	const opp = fighters[fighterIndex] ?? fighters[0];
	const scope = useRef<HTMLDivElement>(null);

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			const tl = gsap.timeline({ onComplete: onDone });
			tl.from(".vs-left", { xPercent: -120, duration: 0.6, ease: "power4.out" })
				.from(".vs-right", { xPercent: 120, duration: 0.6, ease: "power4.out" }, "<")
				.from(".vs-badge", { scale: 0, rotate: -30, duration: 0.5, ease: "back.out(2)" }, "-=0.2")
				.from(".vs-stage", { opacity: 0, y: 20, duration: 0.4 }, "-=0.1")
				.to({}, { duration: 1.4 }); // hold
		}, scope);
		return () => ctx.revert();
	}, [fighterIndex, onDone]);

	return (
		<div ref={scope} className="fixed inset-0 z-40 flex items-stretch overflow-hidden bg-[#070809]">
			<div className="vs-left relative flex-1 bg-gradient-to-br from-[hsl(222,96%,64%)]/20 to-transparent">
				<Image src={DATA.avatarUrl} alt={DATA.name} fill className="object-cover object-top opacity-60" sizes="50vw" />
				<div className="absolute bottom-10 left-8 font-display text-5xl font-bold text-[#f5f3ef] sm:text-7xl">MARNEL</div>
			</div>
			<div className="vs-right relative flex-1 bg-gradient-to-bl from-[#ff5a3c]/20 to-transparent">
				{opp.image && (
					<Image src={opp.image} alt={opp.name} fill className="object-cover opacity-60" sizes="50vw" />
				)}
				<div className="absolute bottom-10 right-8 text-right font-display text-5xl font-bold text-[#f5f3ef] sm:text-7xl">{opp.name}</div>
			</div>
			<div className="vs-badge absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-8xl font-black italic text-[#f5f3ef] drop-shadow-[0_0_30px_rgba(255,90,60,0.7)]">
				VS
			</div>
			<div className="vs-stage absolute inset-x-0 bottom-4 text-center font-mono text-[11px] uppercase tracking-[0.35em] text-white/60">
				Stage · {opp.stage}
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/arcade/stage-versus.tsx
git commit -m "feat(arcade): add versus intro stage

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 12: Results stage

**Files:**
- Create: `src/components/arcade/stage-results.tsx`

**Interfaces:**
- Consumes: `getFighters` (fighters.ts), `MatchResult` (machine.ts).
- Produces: default export `StageResults`:
  `function StageResults({ fighterIndex, result, onNext, onContact }: { fighterIndex: number; result: MatchResult; onNext: () => void; onContact: () => void }): JSX.Element`

- [ ] **Step 1: Implement results stage**

Create `src/components/arcade/stage-results.tsx`:
```tsx
"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getFighters } from "@/lib/arcade/fighters";
import type { MatchResult } from "@/lib/arcade/machine";

export default function StageResults({
	fighterIndex,
	result,
	onNext,
	onContact,
}: {
	fighterIndex: number;
	result: MatchResult;
	onNext: () => void;
	onContact: () => void;
}) {
	const fighters = useMemo(() => getFighters(), []);
	const f = fighters[fighterIndex] ?? fighters[0];
	const won = result.winner === "player";

	return (
		<div className="fixed inset-0 z-40 flex flex-col justify-center bg-[#070809] p-6 sm:p-12">
			<div className="mx-auto w-full max-w-3xl">
				<div className="font-display text-7xl font-black italic text-[#f5f3ef] drop-shadow-[0_0_24px_rgba(47,107,255,0.6)] sm:text-8xl">
					{won ? "YOU WIN" : "K.O."}
				</div>
				<div className="mt-2 font-mono text-[11px] uppercase tracking-[0.35em] text-[hsl(222,96%,64%)]">
					{result.timedOut ? "Time Over" : "Finish"} · {f.name}
				</div>

				<p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">{f.description}</p>

				<div className="mt-6 flex flex-wrap gap-2">
					{f.technologies.map((t) => (
						<span key={t} className="border border-white/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/55">
							{t}
						</span>
					))}
				</div>

				<div className="mt-10 flex flex-wrap gap-4">
					{f.demoUrl && (
						<Link href={f.demoUrl} target="_blank" className="-skew-x-6 bg-[hsl(222,96%,64%)] px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-[#070809] hover:brightness-110">
							Live Demo →
						</Link>
					)}
					{f.repoUrl && (
						<Link href={f.repoUrl} target="_blank" className="-skew-x-6 border border-white/20 px-6 py-3 font-mono text-xs font-bold uppercase tracking-[0.3em] text-white/80 hover:border-white/50">
							Source
						</Link>
					)}
				</div>

				<div className="mt-12 flex flex-wrap gap-6 border-t border-white/10 pt-6">
					<button onClick={onNext} className="font-mono text-xs uppercase tracking-[0.3em] text-white/70 hover:text-[hsl(222,96%,64%)]">
						↻ Next Fighter
					</button>
					<button onClick={onContact} className="font-mono text-xs uppercase tracking-[0.3em] text-white/70 hover:text-[hsl(222,96%,64%)]">
						Enter the Dojo → Contact
					</button>
				</div>
			</div>
		</div>
	);
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/arcade/stage-results.tsx
git commit -m "feat(arcade): add results stage with project payload

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 13: Arcade root + integration

**Files:**
- Create: `src/components/arcade/arcade-root.tsx`
- Modify: `src/app/layout.tsx` (mount arcade root, gate background/scroll)
- Modify: `src/app/page.tsx` (only to remove any temporary harness from Task 8 — otherwise unchanged; it is the classic view)

**Interfaces:**
- Consumes: all stage components, `arcadeReducer`, `initialArcadeState`, `liveKeys`, `fightStore`, `detectMode`.
- Produces: default export `ArcadeRoot`:
  `function ArcadeRoot({ children }: { children: React.ReactNode }): JSX.Element` — renders the active stage as a fixed overlay; renders `children` (the classic site) only when `stage === "classic"`; hosts the persistent SKIP button on every non-classic stage; wires the keyboard listener into `liveKeys` and gamepad-mode detection.

- [ ] **Step 1: Implement arcade root**

Create `src/components/arcade/arcade-root.tsx`:
```tsx
"use client";

import { useEffect, useReducer } from "react";
import {
	arcadeReducer,
	initialArcadeState,
	type MatchResult,
} from "@/lib/arcade/machine";
import { fightStore, liveKeys } from "@/lib/arcade/store";
import { detectMode } from "@/lib/arcade/input";
import StageBoot from "./stage-boot";
import StageSelect from "./stage-select";
import StageVersus from "./stage-versus";
import StageRound from "./stage-round";
import StageResults from "./stage-results";

export default function ArcadeRoot({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(arcadeReducer, undefined, () => {
		if (typeof window === "undefined") return initialArcadeState("boot");
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		return initialArcadeState(reduced ? "classic" : "boot");
	});

	// detect touch + reduced motion for cinematic mode
	const cinematic =
		typeof window !== "undefined" &&
		(("ontouchstart" in window) ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches);

	useEffect(() => {
		const hasTouch = "ontouchstart" in window;
		fightStore.mode = detectMode(hasTouch);

		const down = (e: KeyboardEvent) => {
			liveKeys.add(e.code);
			if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code))
				e.preventDefault();
		};
		const up = (e: KeyboardEvent) => liveKeys.delete(e.code);
		const pad = () => {
			fightStore.mode = "gamepad";
		};
		window.addEventListener("keydown", down);
		window.addEventListener("keyup", up);
		window.addEventListener("gamepadconnected", pad);
		return () => {
			window.removeEventListener("keydown", down);
			window.removeEventListener("keyup", up);
			window.removeEventListener("gamepadconnected", pad);
		};
	}, []);

	// lock body scroll while in the arcade
	useEffect(() => {
		document.body.style.overflow = state.stage === "classic" ? "" : "hidden";
	}, [state.stage]);

	if (state.stage === "classic") return <>{children}</>;

	return (
		<>
			{state.stage === "boot" && <StageBoot onStart={() => dispatch({ type: "START" })} />}
			{state.stage === "select" && (
				<StageSelect onPick={(index) => dispatch({ type: "SELECT_FIGHTER", index })} />
			)}
			{state.stage === "versus" && state.fighterIndex !== null && (
				<StageVersus
					fighterIndex={state.fighterIndex}
					onDone={() => dispatch({ type: "VERSUS_DONE" })}
				/>
			)}
			{state.stage === "round" && state.fighterIndex !== null && (
				<StageRound
					fighterIndex={state.fighterIndex}
					cinematic={cinematic}
					onDone={(result: MatchResult) => dispatch({ type: "ROUND_DONE", result })}
				/>
			)}
			{state.stage === "results" && state.fighterIndex !== null && state.result && (
				<StageResults
					fighterIndex={state.fighterIndex}
					result={state.result}
					onNext={() => dispatch({ type: "NEXT_FIGHTER" })}
					onContact={() => dispatch({ type: "EXIT_TO_CLASSIC" })}
				/>
			)}

			{/* persistent escape hatch */}
			<button
				onClick={() => dispatch({ type: "EXIT_TO_CLASSIC" })}
				className="fixed bottom-5 right-5 z-50 border border-white/20 bg-black/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-white/60 backdrop-blur transition hover:border-white/50 hover:text-white"
			>
				Skip → Résumé
			</button>
		</>
	);
}
```

- [ ] **Step 2: Mount arcade root in layout**

In `src/app/layout.tsx`, add the import near the other component imports:
```tsx
import ArcadeRoot from "@/components/arcade/arcade-root";
```
Then wrap the children with `ArcadeRoot`. Change:
```tsx
				<SmoothScroll>{children}</SmoothScroll>
```
to:
```tsx
				<ArcadeRoot>
					<SmoothScroll>{children}</SmoothScroll>
				</ArcadeRoot>
```
(`Background`, `Hud`, `Cursor`, `Preloader` stay as-is — they sit behind the arcade overlay and become the backdrop again in classic view.)

- [ ] **Step 3: Remove any temporary Task 8 harness**

Confirm `src/app/page.tsx` contains no leftover `StageRound` test mount. Run:
```bash
grep -n "StageRound" src/app/page.tsx || echo "clean"
```
Expected: `clean`. If it prints a line, remove that mount.

- [ ] **Step 4: Full manual run-through**

Run: `npm run dev`, open `http://localhost:3000`.
Expected flow:
1. Boot screen with flicker + "PRESS START"; any key/click → select.
2. Select grid shows each project; hover updates the fighter card; "FIGHT →" or clicking a tile → versus.
3. Versus "MARNEL vs [PROJECT]" slam-in (~2.8s) → round.
4. Round: playable fight (A/D/J/K/Space or gamepad), health/timer HUD, KO/timeout → results.
5. Results shows project description + demo/source links; "Next Fighter" → select; "Enter the Dojo" → classic site.
6. "Skip → Résumé" button on every stage drops straight to the scrollable portfolio.
7. Simulate mobile (DevTools touch emulation) or set reduced-motion → fight auto-plays (cinematic), still reaches results.

- [ ] **Step 5: Full test + typecheck + build**

Run:
```bash
npm run test
npx tsc --noEmit
npm run build
```
Expected: all tests pass, no type errors, production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/arcade/arcade-root.tsx src/app/layout.tsx src/app/page.tsx
git commit -m "feat(arcade): wire arcade root into layout with classic-view escape

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Self-Review notes

- **Spec coverage:** Boot/Select/Versus/Round/Results (Tasks 9–12, 8), state machine (2), fight engine (3), AI + cinematic (4), input keyboard+gamepad (5), mutable store (6), procedural neon fighters (7), projects-as-fighters roster + optional data fallbacks (1), classic-view escape + touch/reduced-motion cinematic + scroll/perf gating (13), Vitest tests (1–5). All spec sections map to a task.
- **Type consistency:** `InputFrame`/`NEUTRAL_INPUT`/`FIGHT`/`FighterState`/`FightState` defined in Task 3 and consumed unchanged in 4–8; `MatchResult`/`ArcadeStage`/`InputMode` defined in Task 2 and consumed in 8/12/13; `Fighter`/`getFighters` defined in Task 1 and consumed in 8/10/11/12.
