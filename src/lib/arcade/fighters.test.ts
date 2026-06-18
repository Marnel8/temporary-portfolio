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
