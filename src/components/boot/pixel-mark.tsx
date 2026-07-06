/* Blocky pixel-grid "MV" logomark, drawn as SVG squares.
   Used small in the HUD top-left and larger in the footer.
   `size` = height in px; width follows from the 11×5 glyph grid. */

// 1 = lit pixel. Two 5×5 glyphs — M (cols 0–4), gutter (col 5), V (cols 6–10).
const GRID = [
	"10001" + "0" + "10001",
	"11011" + "0" + "10001",
	"10101" + "0" + "10001",
	"10001" + "0" + "01010",
	"10001" + "0" + "00100",
];

const COLS = GRID[0].length;
const ROWS = GRID.length;

export default function PixelMark({
	size = 20,
	className,
}: {
	size?: number;
	className?: string;
}) {
	const cell = size / ROWS;
	return (
		<svg
			width={cell * COLS}
			height={size}
			viewBox={`0 0 ${COLS} ${ROWS}`}
			className={className}
			aria-label="MV"
			role="img"
			shapeRendering="crispEdges"
		>
			{GRID.flatMap((row, y) =>
				row.split("").map((bit, x) =>
					bit === "1" ? (
						<rect
							key={`${x}-${y}`}
							x={x}
							y={y}
							width={0.86}
							height={0.86}
							fill="currentColor"
						/>
					) : null
				)
			)}
		</svg>
	);
}
