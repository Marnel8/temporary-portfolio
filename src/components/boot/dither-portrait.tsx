"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   DITHER PORTRAIT — turns a photo into a ghosted, ordered-dither bitmap
   in the phosphor green, rendered once to a <canvas>.

   How it works:
   1. Draw the image small (`cols` pixels wide) to sample it.
   2. Convert each sample to luminance.
   3. Compare against a 4×4 Bayer threshold matrix — classic ordered
      dithering — to decide whether that cell gets a lit "pixel".
   4. Paint lit cells as small squares with a gap, so the result reads
      as a halftone/CRT bitmap rather than a photo.

   The canvas is drawn at 1 cell = `dot` device pixels and scaled by CSS,
   so it stays cheap regardless of display size.
   ═══════════════════════════════════════════════════════════════════ */

// 4×4 Bayer matrix, normalized 0..1 thresholds.
const BAYER = [
	[0, 8, 2, 10],
	[12, 4, 14, 6],
	[3, 11, 1, 9],
	[15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

/* ── scatter registry ────────────────────────────────────────────────
   Each dither canvas remembers its lit dots and a per-dot flight vector
   so the slide deck can explode/reassemble the portrait. State lives in
   a WeakMap keyed by the canvas element, so it is discovered from the
   DOM (getDitherHandle) without prop drilling and is GC'd with the node. */

type DotState = {
	xs: Float32Array; // dot origin x, canvas pixels
	ys: Float32Array; // dot origin y, canvas pixels
	vx: Float32Array; // flight vector x (set by reseed)
	vy: Float32Array; // flight vector y
	size: number; // fillRect side, canvas pixels
	color: string;
	w: number; // backing-store width
	h: number; // backing-store height
};

const dotRegistry = new WeakMap<HTMLCanvasElement, DotState>();

export type DitherHandle = { reseed(): void; draw(progress: number): void };

/** Explode/reassemble handle for a dither canvas, or null if it has not
    painted its dots yet (image still decoding). progress 0 = intact,
    1 = fully dispersed + invisible. */
export function getDitherHandle(canvas: HTMLCanvasElement): DitherHandle | null {
	const s = dotRegistry.get(canvas);
	if (!s) return null;
	const reseed = () => {
		for (let i = 0; i < s.vx.length; i++) {
			s.vx[i] = (Math.random() * 2 - 1) * 0.6 * s.w;
			s.vy[i] = (Math.random() * 2 - 1) * 0.5 * s.h;
		}
	};
	const draw = (p: number) => {
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		ctx.clearRect(0, 0, s.w, s.h);
		ctx.fillStyle = s.color;
		ctx.globalAlpha = 1 - p;
		for (let i = 0; i < s.xs.length; i++) {
			ctx.fillRect(s.xs[i] + p * s.vx[i], s.ys[i] + p * s.vy[i], s.size, s.size);
		}
		ctx.globalAlpha = 1;
	};
	return { reseed, draw };
}

export default function DitherPortrait({
	src,
	cols = 110,
	dot = 6,
	color = "#00ff6a",
	opacity = 1,
	className,
	alt = "",
}: {
	src: string;
	cols?: number; // horizontal resolution in dither cells
	dot?: number; // device pixels per cell on the output canvas
	color?: string;
	opacity?: number;
	className?: string;
	alt?: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const img = new Image();
		img.src = src;
		img.decode().then(() => {
			const rows = Math.round(cols * (img.naturalHeight / img.naturalWidth));

			// sample pass — image drawn at cell resolution
			const sample = document.createElement("canvas");
			sample.width = cols;
			sample.height = rows;
			const sctx = sample.getContext("2d", { willReadFrequently: true })!;
			sctx.drawImage(img, 0, 0, cols, rows);
			const data = sctx.getImageData(0, 0, cols, rows).data;

			// output pass
			canvas.width = cols * dot;
			canvas.height = rows * dot;
			const ctx = canvas.getContext("2d")!;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = color;

			// collect lit dots so the deck can scatter them later
			const xs: number[] = [];
			const ys: number[] = [];
			const size = dot - 1.5; // gap between dots sells the "bitmap" look

			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					const i = (y * cols + x) * 4;
					const a = data[i + 3] / 255;
					if (a < 0.4) continue; // keep transparent cutout background empty
					// Rec.601 luminance
					const lum =
						(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
					if (lum > BAYER[y % 4][x % 4]) {
						const px = x * dot;
						const py = y * dot;
						ctx.fillRect(px, py, size, size);
						xs.push(px);
						ys.push(py);
					}
				}
			}

			// register for scatter; reseed once so a first transition works
			// even before the deck calls reseed itself
			const state: DotState = {
				xs: Float32Array.from(xs),
				ys: Float32Array.from(ys),
				vx: new Float32Array(xs.length),
				vy: new Float32Array(xs.length),
				size,
				color,
				w: canvas.width,
				h: canvas.height,
			};
			dotRegistry.set(canvas, state);
		}).catch(() => {
			/* image failed to load — leave the canvas empty */
		});
	}, [src, cols, dot, color]);

	return (
		<canvas
			ref={canvasRef}
			data-dither
			className={className}
			style={{ opacity }}
			role={alt ? "img" : undefined}
			aria-label={alt || undefined}
		/>
	);
}
