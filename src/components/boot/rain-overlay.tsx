"use client";

import { useEffect, useRef } from "react";
import { useFx } from "./fx-context";

/* ═══════════════════════════════════════════════════════════════════════
   RAIN OVERLAY — full-screen "digital rain" burst used as a transition
   between major sections.

   One fixed canvas lives above the page (pointer-events: none). Anywhere
   in the app can call `triggerRain()` (the page does it from
   ScrollTrigger section boundaries); the canvas plays a ~0.9s burst of
   falling glyph columns with a fade-in/out envelope, then goes idle.

   Bursts are rate-limited so fast scrolling doesn't strobe, and the
   whole thing is inert when CRT FX are toggled off.
   ═══════════════════════════════════════════════════════════════════ */

type Listener = (force?: boolean) => void;
const listeners = new Set<Listener>();

/** Request a rain burst. `force` bypasses the rate limit (used by the
    slide deck so every transition gets its burst). No-op on server. */
export function triggerRain(force = false) {
	listeners.forEach((fn) => fn(force));
}

const GLYPHS =
	"アカサタナハマヤラワ0123456789ABCDEFXZ<>/\\|+=*#$%";
const BURST_MS = 950;
const MIN_GAP_MS = 3000; // rate limit between bursts

export default function RainOverlay() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const { fx } = useFx();
	const fxRef = useRef(fx);
	fxRef.current = fx;

	useEffect(() => {
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext("2d")!;
		let raf = 0;
		let burstStart = 0;
		let lastBurst = -Infinity;
		let cols: { x: number; y: number; speed: number }[] = [];

		const resize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};
		resize();
		window.addEventListener("resize", resize);

		const CELL = 18;

		const frame = (now: number) => {
			const t = (now - burstStart) / BURST_MS;
			if (t >= 1) {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				canvas.style.opacity = "0";
				return; // burst over — stop the loop
			}
			// envelope: quick fade in, longer fade out
			const env = t < 0.25 ? t / 0.25 : 1 - (t - 0.25) / 0.75;
			canvas.style.opacity = String(0.9 * env);

			// translucent black smear leaves the classic trails
			ctx.fillStyle = "rgba(1, 6, 3, 0.22)";
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.font = `${CELL - 3}px monospace`;

			for (const col of cols) {
				const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
				// head glyph bright, trail handled by the smear above
				ctx.fillStyle = "rgba(190, 255, 214, 0.9)";
				ctx.fillText(ch, col.x, col.y);
				ctx.fillStyle = "rgba(0, 255, 106, 0.65)";
				ctx.fillText(
					GLYPHS[(Math.random() * GLYPHS.length) | 0],
					col.x,
					col.y - CELL
				);
				col.y += col.speed;
				if (col.y > canvas.height + CELL) col.y = -CELL * Math.random() * 10;
			}
			raf = requestAnimationFrame(frame);
		};

		const start = (force = false) => {
			if (!fxRef.current) return;
			const now = performance.now();
			if (!force && now - lastBurst < MIN_GAP_MS) return;
			lastBurst = now;
			burstStart = now;

			// fresh set of columns each burst, staggered above the viewport
			const n = Math.floor(canvas.width / CELL);
			cols = Array.from({ length: n }, (_, i) => ({
				x: i * CELL,
				y: -Math.random() * canvas.height,
				speed: CELL * (0.9 + Math.random() * 1.4),
			}));
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(frame);
		};

		listeners.add(start);
		return () => {
			listeners.delete(start);
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<canvas
			ref={canvasRef}
			aria-hidden
			className="pointer-events-none fixed inset-0 z-[70]"
			style={{ opacity: 0 }}
		/>
	);
}
