"use client";

import Clock from "./clock";
import PixelMark from "./pixel-mark";
import { useFx } from "./fx-context";

/* ═══════════════════════════════════════════════════════════════════════
   HUD FRAME — persistent viewport chrome, present on every route.

   Three layers, all fixed:
   1. Frame lines   — thin edge rules with angled cut corners (SVG),
                      like a sci-fi interface panel, not a plain rect.
   2. Utility bar   — MV pixel logomark (top-left, links home), live
                      clock (top-center), CRT-FX toggle (top-right, the
                      one interactive element), and quiet status text in
                      the bottom corners.
   3. CRT overlays  — scanlines + slow flicker, plain CSS driven by
                      html[data-fx] so the toggle switches them without
                      re-rendering the page.
   ═══════════════════════════════════════════════════════════════════ */

const EDGE = 14; // inset of the frame from the viewport edge, px
const CUT = 26; // length of each 45° corner cut, px

export default function HudFrame() {
	const { fx, toggleFx } = useFx();

	// The octagonal frame is four <span> edge lines + four 45° corner
	// segments — divs are simpler than SVG for a resize-proof frame.
	const line = "pointer-events-none absolute bg-phos/30";
	const corner = "pointer-events-none absolute h-px w-[37px] bg-phos/40";

	return (
		<div className="pointer-events-none fixed inset-0 z-[80] font-mono">
			{/* ── 1 · frame lines (edges stop short of the corner cuts) ── */}
			<span
				className={line}
				style={{ top: EDGE, left: EDGE + CUT, right: EDGE + CUT, height: 1 }}
			/>
			<span
				className={line}
				style={{ bottom: EDGE, left: EDGE + CUT, right: EDGE + CUT, height: 1 }}
			/>
			<span
				className={line}
				style={{ left: EDGE, top: EDGE + CUT, bottom: EDGE + CUT, width: 1 }}
			/>
			<span
				className={line}
				style={{ right: EDGE, top: EDGE + CUT, bottom: EDGE + CUT, width: 1 }}
			/>
			{/* 45° corner cuts — rotated hairlines bridging the edge gaps */}
			<span
				className={corner}
				style={{ top: EDGE + CUT / 2, left: EDGE - 5, transform: "rotate(-45deg)" }}
			/>
			<span
				className={corner}
				style={{ top: EDGE + CUT / 2, right: EDGE - 5, transform: "rotate(45deg)" }}
			/>
			<span
				className={corner}
				style={{ bottom: EDGE + CUT / 2, left: EDGE - 5, transform: "rotate(45deg)" }}
			/>
			<span
				className={corner}
				style={{ bottom: EDGE + CUT / 2, right: EDGE - 5, transform: "rotate(-45deg)" }}
			/>

			{/* ── 2 · utility bar ─────────────────────────────────────── */}
			{/* top-left: logomark → home */}
			<a
				href="/"
				className="pointer-events-auto absolute left-8 top-7 text-phos transition-opacity hover:opacity-70"
				aria-label="Home"
			>
				<PixelMark size={16} />
			</a>

			{/* top-center: live clock */}
			<div className="absolute left-1/2 top-7 -translate-x-1/2 text-[10px] tracking-[0.3em] text-phos/70">
				<Clock />
			</div>

			{/* top-right: CRT FX toggle — the frame's one real control */}
			<button
				type="button"
				onClick={toggleFx}
				className="pointer-events-auto absolute right-8 top-6 border border-phos/30 px-2.5 py-1 text-[10px] tracking-[0.25em] text-phos/80 transition-colors hover:border-phos/70 hover:text-phos"
				aria-pressed={fx}
				title="Toggle scanlines / flicker / rain transitions"
			>
				FX·{fx ? "ON" : "OFF"}
			</button>

			{/* bottom corners: quiet status text
			    (left one yields its spot to the slide-deck counter) */}
			<div className="absolute bottom-6 left-8 hidden text-[9px] tracking-[0.3em] text-phos/40 sm:block [html[data-deck='on']_&]:!hidden">
				SYS.READY
			</div>
			<div className="absolute bottom-6 right-8 hidden text-[9px] tracking-[0.3em] text-phos/40 sm:block">
				13.2°N&nbsp;120.6°E
			</div>

			{/* ── 3 · CRT overlays (CSS keyed to html[data-fx]) ───────── */}
			<div aria-hidden className="crt-scanlines" />
			<div aria-hidden className="crt-vignette" />
		</div>
	);
}
