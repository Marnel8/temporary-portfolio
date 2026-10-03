# AI Avatar Assistant — Design

**Date:** 2026-10-03
**Status:** Approved in conversation; pending written-spec review

## Goal

Visitors to the portfolio (mainly recruiters / hiring managers) can open a floating
widget and hold a live **voice + video** conversation with a realistic talking
avatar that answers questions about Marnel's background, grounded strictly in the
site's own content.

**Phase 1 (this spec):** a stock Synthesia avatar presented as *"Marnel's AI
assistant"*, using free vendor allowances.
**Phase 2 (not built now):** swap in a personal Synthesia avatar (digital twin) and,
optionally, a cloned voice. Phase 1 is structured so Phase 2 is a config/one-module
change (see *Twin upgrade path*).

### Success criteria

- A visitor clicks the launcher, presses Start, grants mic, and within ~20 s
  (cold start) sees the avatar greet them and can converse with natural turn-taking.
- Every factual answer is traceable to fields the home page renders; unknowns are
  deflected to Marnel's email.
- The phone number is never available to the agent.
- Spend is bounded by limits the visitor cannot bypass.
- The site stays fast: nothing related to the assistant loads until it is opened.

## Stack decisions

| Concern | Choice | Why |
|---|---|---|
| Realtime transport | LiveKit Cloud (Build plan, free: 5,000 WebRTC min + 1,000 agent min / month) | Hosts rooms *and* the agent; no server to run |
| Agent runtime | Python LiveKit Agents (`livekit-agents[openai,synthesia]` ~1.8), deployed via `lk agent deploy` | Official avatar plugin path |
| Voice / reasoning | OpenAI Realtime, `gpt-realtime-mini` (speech-to-speech) | Lowest latency, least code; user's own key |
| Avatar | Synthesia Interactive Avatar plugin (GA; $0.12/min PAYG; 500 free min launch offer) | Largest free allowance; same vendor for the future twin |
| Frontend | `livekit-client` + `@livekit/components-react`, lazy-loaded | Standard room/track hooks |

Known trade-off: on the Build plan the deployed agent sleeps when idle; first join
after idle can take 10–20 s. The UI covers this with a "waking up" state.

## Architecture

```
Browser (floating widget) ──POST──► /api/avatar/token  (Vercel; kill switch, mints token + agent dispatch)
        │
        └──WebRTC──► LiveKit Cloud room ◄── Python agent (OpenAI Realtime + persona)
                                         ◄── Synthesia avatar worker (lip-syncs agent audio, publishes video)
Agent ──GET──► /api/avatar/context  (Vercel; allowlisted facts from DATA as JSON)
```

OpenAI and Synthesia keys live only on the agent. The browser only ever holds a
short-lived, single-room LiveKit token.

### Files

```
agent/
  agent.py          entrypoint: fetch context, build session, start avatar, enforce limits
  persona.py        pure function: context JSON -> system instructions string
  voice.py          build_model() -> the OpenAI Realtime model (the swappable piece)
  test_persona.py   pytest
  pyproject.toml, livekit.toml, Dockerfile, .env.example, README.md
src/app/api/avatar/token/route.ts
src/app/api/avatar/context/route.ts
src/lib/avatar-context.ts            pure builder: DATA -> context JSON (unit-tested)
src/components/assistant/
  assistant-launcher.tsx   floating button + panel shell (always mounted, tiny)
  assistant-call.tsx       LiveKit room UI (dynamically imported on Start)
src/app/layout.tsx         mounts <AssistantLauncher/> beside <Navbar/>
```

## Components

### `/api/avatar/context` (GET)

Returns JSON built by `buildAvatarContext(DATA, posts)` in `src/lib/avatar-context.ts`.
**Allowlist only** — fields the home page actually renders:

- `name`, `location`, `description`, `summary`
- `work[]`: company, title, location, start, end, description
- `education[]`: school, degree, start, end
- `skills[]`
- `projects[]`: title, dates, description, technologies, link hrefs
- `trainings[]` (plain-text fields only)
- `contact`: `email` and social profile URLs
- `blog[]`: title, slug, summary, publishedAt (from `src/data/blog.ts`)

**Explicitly excluded:** `contact.phone`, `hackathons` (template leftovers not
rendered on the site), icons/JSX, image URLs. Response is cacheable
(`revalidate` 1 hour). Content changes flow automatically: edit `resume.tsx`, deploy.

### `/api/avatar/token` (POST)

1. If `AVATAR_ENABLED !== "true"` → `503 { error: "disabled" }`.
2. Create room name `assistant-<random>`; identity `visitor-<random>`.
3. Mint an `AccessToken` (TTL 10 min, grant: join that room only, publish mic,
   subscribe) with a `RoomConfiguration` agent dispatch for agent name
   `marnel-assistant`.
4. Return `{ serverUrl, token }`.

Env: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `AVATAR_ENABLED`.
Rate limiting is **not** in code — a Vercel Firewall rate-limit rule on this path
(~3 requests / IP / hour) returns 429.

### Agent (`agent/`)

- Registers as `marnel-assistant` (explicit dispatch only).
- On job start: GET `${SITE_URL}/api/avatar/context` (5 s timeout). On failure, the
  agent starts voice-only, says it can't load Marnel's details right now, gives the
  email address, and ends — it never answers ungrounded.
- `persona.build_instructions(context)` produces the system prompt:
  - Identity: "Marnel's AI assistant"; never claims to be Marnel; confirms being an AI when asked.
  - Answer only from the provided context; unknowns → "I don't have that — you can
    ask Marnel directly at <email>." Never invent employers, dates, salaries, opinions.
  - Off-topic / jailbreak attempts → brief polite redirect to Marnel's work.
  - Spoken style: 2–3 sentences, no markdown, no reading URLs character by character
    (say "it's linked on the site").
  - English by default; may reply in Filipino if the visitor speaks it.
  - Embeds the context JSON.
- `voice.build_model()` returns `openai.realtime.RealtimeModel(model="gpt-realtime-mini", voice=…)`.
- Avatar: `synthesia.AvatarSession(AvatarConfig(avatar_ids=[SYNTHESIA_AVATAR_ID]))`
  started on the room. On any avatar error (quota, feature not in plan, join
  timeout) log it and continue voice-only.
- Greets first ("Hi, I'm Marnel's AI assistant…").
- Limits: hard cap 180 s (spoken warning at 160 s, then goodbye + shutdown);
  idle timeout 45 s without user speech; shuts down when the visitor leaves.

Env: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `OPENAI_API_KEY`,
`SYNTHESIA_API_KEY`, `SYNTHESIA_AVATAR_ID`, `SITE_URL`.

### Widget (`src/components/assistant/`)

- **Launcher:** fixed bottom-right pill ("Talk to my assistant", accent dot,
  Geist Mono label), positioned not to collide with the bottom-center `Navbar` dock.
  Clicking opens the panel; nothing network-related happens yet.
- **Panel:** desktop = ~360px card bottom-right; mobile (<640px) = bottom sheet.
  Pre-call shows the disclosure: "AI assistant · uses your microphone · up to 3 minutes"
  and a **Start** button.
- **Start:** dynamically imports `assistant-call.tsx` (LiveKit bundle never loads
  before this), POSTs the token route, connects with mic enabled.
- **Call states:** connecting → "Waking up the assistant…" (spinner) → live
  (avatar video track; if no video track, an audio-level ring) → ended.
- **Controls:** mute mic, End. Live captions from agent transcription.
- Closing the panel or unmounting disconnects the room.
- Styling uses existing theme tokens (`--accent`, `bg-background`, muted foreground);
  respects light/dark via `next-themes`.

## Error handling

| Case | Visitor sees |
|---|---|
| 503 (disabled) or 429 (rate-limited) | "The assistant is resting right now — email Marnel instead" + mailto |
| Token route other failure | "Something went wrong. Try again in a minute." |
| Mic permission denied | Explanation of how to allow the mic + Retry |
| Agent not joined within 30 s | "Couldn't reach the assistant — try again in a minute"; disconnect |
| Avatar fails | Call continues voice-only with audio-level ring |
| Context fetch fails | Agent apologises, gives email, ends |
| Panel / tab closed | Room disconnects → agent shuts down → billing stops |

## Cost & abuse limits

1. UI: click-to-start, lazy bundle.
2. Token route: `AVATAR_ENABLED` kill switch; single-room, 10-min tokens.
3. Vercel Firewall rate-limit rule on `/api/avatar/token`.
4. Agent: 180 s cap, 45 s idle timeout, one avatar per room.
5. Vendors: OpenAI project with a monthly budget limit; Synthesia prepaid credits;
   LiveKit Build plan hard quotas.

## Testing

- **Vitest** (add as dev dependency; no tests currently exist on this branch):
  - `buildAvatarContext`: includes work/projects/email; **excludes phone and hackathons**; no functions/JSX in output.
  - token route: 503 when disabled; when enabled returns `serverUrl` + a JWT whose
    grants are scoped to one room with ~10 min expiry and agent dispatch `marnel-assistant`.
- **pytest** (`agent/test_persona.py`): instructions contain resume facts, the email,
  the AI-disclosure and refusal rules; do not contain the phone number.
- **Static:** `npx tsc --noEmit` (lint is broken on this branch).
- **Manual E2E:** run agent locally (`uv run agent.py dev`) + `pnpm dev`, full call;
  then `lk agent deploy` and a call on a Vercel preview.
- **Phase 2 pre-check:** confirm a *personal* Synthesia avatar ID works in an
  interactive session before Marnel records a twin.

## Twin upgrade path (Phase 2, not built now)

1. Create a personal avatar in Synthesia; set `SYNTHESIA_AVATAR_ID` to it.
2. Optional: replace `voice.build_model()` with an STT → LLM → TTS pipeline using a
   cloned voice. No other module changes.
3. Persona display name "Marnel's AI assistant" → "AI Marnel"; AI disclosure stays.

## Setup checklist (Marnel)

1. Synthesia: create API key; pick a gallery avatar ID; confirm Interactive Avatars on the plan.
2. LiveKit Cloud: create project (Build plan); note URL / API key / secret; install `lk` CLI.
3. OpenAI: create a dedicated project + key; set a monthly budget limit.
4. Vercel env: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `AVATAR_ENABLED=true`.
5. Agent secrets via `lk agent deploy` / `lk agent update-secrets`.
6. Vercel Firewall: rate-limit rule on `/api/avatar/token`.

## Out of scope

Text chat fallback, conversation logging/analytics, multiple avatars, auth,
persisting transcripts, Phase 2 itself.
