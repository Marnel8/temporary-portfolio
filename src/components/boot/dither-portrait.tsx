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

			for (let y = 0; y < rows; y++) {
				for (let x = 0; x < cols; x++) {
					const i = (y * cols + x) * 4;
					const a = data[i + 3] / 255;
					if (a < 0.4) continue; // keep transparent cutout background empty
					// Rec.601 luminance
					const lum =
						(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
					if (lum > BAYER[y % 4][x % 4]) {
						// gap between dots sells the "bitmap" look
						ctx.fillRect(x * dot, y * dot, dot - 1.5, dot - 1.5);
					}
				}
			}
		}).catch(() => {
			/* image failed to load — leave the canvas empty */
		});
	}, [src, cols, dot, color]);

	return (
		<canvas
			ref={canvasRef}
			className={className}
			style={{ opacity }}
			role={alt ? "img" : undefined}
			aria-label={alt || undefined}
		/>
	);
}
