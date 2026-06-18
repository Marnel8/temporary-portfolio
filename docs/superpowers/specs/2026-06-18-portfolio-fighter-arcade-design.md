# PORTFOLIO FIGHTER — Tekken-style Arcade Experience

**Date:** 2026-06-18
**Status:** Approved design, pending spec review

## Goal

Turn the portfolio into a "real game experience" inspired by Tekken 8: a full
arcade flow (Boot → Character Select → Versus Intro → playable Round → Results)
where each **project becomes a fighter**. Recruiters who don't want to play can
escape to the classic scrollable portfolio at any time.

## Decisions (locked)

- **Scope:** Full arcade experience — boot, character select, versus intro,
  playable round, results.
- **Combat:** 2.5D fight rendered in React-Three-Fiber with simple, real
  mechanics (move, jump, light/heavy attack, block, health, round timer, KO).
  Not a full fighting engine (no combos/frame data/juggles).
- **Coexistence:** Game *wraps* content. Every stage surfaces real portfolio
  info; a persistent "SKIP → RÉSUMÉ" button always escapes to the existing
  scrollable site (CLASSIC_VIEW).
- **Roster:** `DATA.projects` — each project is a selectable fighter.
- **Fighter art:** Procedural neon low-poly figures (capsule torso + jointed
  limbs, rim-lit). No external sprite/model assets required.
- **Input:** Keyboard + Gamepad API on desktop. Touch/mobile devices and
  `prefers-reduced-motion` get a **cinematic auto-fight** (round plays itself).

## Architecture

A client-side arcade **state machine** layered over the existing R3F canvas and
`DATA`. The existing scrollable `page.tsx` becomes CLASSIC_VIEW.

```
BOOT → CHARACTER_SELECT → VERSUS_INTRO → ROUND → RESULTS → (NEXT FIGHTER → SELECT)
   └──────────────── "SKIP → RÉSUMÉ" ──────────────┴──→ CLASSIC_VIEW (always available)
```

### Modules

- `src/lib/arcade/machine.ts` — pure state-machine: states, transitions,
  selected fighter, match result, `inputMode` (`keyboard|gamepad|touch`).
  Exposed to React via a `useArcadeMachine` hook. Unit-tested.
- `src/lib/arcade/fight-engine.ts` — framework-free fight logic: fixed-timestep
  step function operating on a plain `FightState` (positions, velocities,
  health, facing, active move, hitstun/blockstun timers). Pure functions:
  `stepFight()`, `resolveHits()` (AABB hitbox vs hurtbox), `isRoundOver()`.
  Unit-tested.
- `src/lib/arcade/ai.ts` — opponent decision function `decideAction(state)`:
  approach → attack-in-range → occasional block/retreat. Tuned beatable in
  ~20–30s. Also drives the cinematic auto-fight (scripted combo → KO).
- `src/lib/arcade/input.ts` — keyboard + Gamepad API polling → normalized
  `InputFrame { moveX, jump, light, heavy, block }`. Auto-detects `inputMode`.
- `src/lib/arcade/store.ts` — mutable per-frame ref store (à la
  `scroll-store.ts`) so the game loop never triggers React re-renders.

### Components (`src/components/arcade/`)

- `arcade-root.tsx` — mounts the machine, renders the active stage, hosts the
  persistent SKIP button. Decides CLASSIC_VIEW default for touch-only/reduced-
  motion users (still allows opting into the arcade).
- `stage-boot.tsx` — cold open: flicker, "PORTFOLIO FIGHTER" logo, name/role
  subtitle, "INSERT COIN / PRESS START". First input sets `inputMode`.
- `stage-select.tsx` — grid of project fighters; focus/hover shows a fighter
  card (tech stack as "move list", bio, derived power bars). Confirm = pick.
- `stage-versus.tsx` — "YOU (MARNEL) vs [PROJECT]" slam-in splash (~3s GSAP),
  stage name, announcer text.
- `stage-round.tsx` — dedicated `<Canvas>` with the 2.5D fight + HUD overlay
  (health bars, round timer, announcer). Playable or cinematic per `inputMode`.
- `stage-results.tsx` — KO / "YOU WIN" → project payload: description, live
  demo + repo links (real CTAs), "NEXT FIGHTER" and "ENTER THE DOJO → contact".
- `fighter.tsx` — procedural neon figure (R3F) parameterized by color/pose.
- `arcade-hud.tsx` — health bars, timer, announcer text.

## Stage → content mapping

| Stage | Game framing | Real portfolio content |
|-------|--------------|------------------------|
| Boot | Insert coin | Name + role |
| Select | Pick a fighter | Each project (portrait, stack as moves, bio) |
| Versus | YOU vs PROJECT | Your bio/avatar + project name/stage |
| Round | The fight | (pure spectacle/interaction) |
| Results | YOU WIN | Project description + demo/repo links + contact CTA |

## Fight mechanics (ROUND)

- Two procedural fighters on a flat reflective platform; fixed side-on 2.5D
  camera with subtle parallax. Player = blue `#2f6bff`, opponent = hot `#ff5a3c`.
- Game loop in `useFrame` reading the mutable fight store; fixed-timestep
  accumulator for frame-rate-independent physics.
- Moves: left/right move, jump, light attack, heavy attack, block. Each attack
  spawns a hitbox active for N frames with damage + knockback; block negates
  with chip damage. AABB overlap for hit resolution.
- Best-of-1 round with a countdown timer; timeout → higher health wins; health
  to 0 → KO.
- Juice: hit-spark particles, screen shake on heavy hits, slow-mo finishing
  blow, announcer text ("FIGHT!", "K.O.!").
- Cinematic mode (touch/reduced-motion): player controller replaced by scripted
  AI performing a satisfying combo → KO.

## Visuals & data

- Reuse existing dark `#070809` + neon palette, `font-display`/`font-mono`, and
  HUD-label styling so the arcade feels native.
- Extend each project in `src/data/resume.tsx` with **optional** arcade fields
  with sensible fallbacks (nothing breaks if missing):
  - `fighterName?` (default: `title`)
  - `stats?` (default: derived from `technologies`)
  - `stage?` (default: rotating stage list)
  - `demoUrl?` (default: first `links` href / `href`)
- Perf: fight `<Canvas>` mounts only during VERSUS/ROUND/RESULTS; background
  `core-scene` pauses while active.

## Testing

- Vitest added to the project (no test runner currently present).
- Unit tests for the pure modules: `machine` transitions, `fight-engine`
  (hitbox overlap, damage, knockback, round-end), `ai.decideAction`,
  `input` normalization.
- Rendering/feel (animations, juice, responsiveness) verified manually in the
  browser.

## Out of scope (YAGNI)

- Combos, special moves, frame data, juggles, multiplayer.
- Real sprite/model assets, sound design beyond optional simple SFX.
- Touch-playable combat (touch gets cinematic auto-fight instead).
- Persisting scores / leaderboards.
