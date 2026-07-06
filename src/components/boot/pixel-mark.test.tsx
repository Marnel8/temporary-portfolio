import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PixelMark from "./pixel-mark";

/* PixelMark is pure SVG-from-data, so static markup is enough to verify
   the glyph grid renders and stays accessible. */
describe("PixelMark", () => {
	it("renders lit pixels as rects with an MV label", () => {
		const html = renderToStaticMarkup(<PixelMark size={20} />);
		const rects = html.match(/<rect/g) ?? [];
		expect(rects.length).toBeGreaterThan(0);
		expect(html).toContain('aria-label="MV"');
		expect(html).toContain('role="img"');
	});

	it("scales width from the size prop and the 11-column grid", () => {
		const html = renderToStaticMarkup(<PixelMark size={55} />);
		// 55px tall / 5 rows = 11px cells × 11 cols = 121px wide
		expect(html).toContain('width="121"');
		expect(html).toContain('height="55"');
	});
});
