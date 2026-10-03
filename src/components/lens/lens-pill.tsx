"use client";

import { DATA } from "@/data/resume";
import { useLens } from "./lens-provider";

/**
 * Dock button that shows the active lens and flips to the other one.
 * <Dock> clones its children with mouse-tracking props meant for <DockIcon>;
 * this pill ignores them rather than leaking them onto the DOM.
 */
export function LensPill(_dockProps: {
	mousex?: unknown;
	magnification?: number;
	distance?: number;
}) {
	const { lens, setLens } = useLens();
	const other = lens === "swe" ? "ai" : "swe";

	return (
		<button
			type="button"
			onClick={(e) => setLens(other, e.currentTarget)}
			aria-label={`Switch to ${DATA.lenses[other].label}`}
			className="h-10 min-w-[5.5rem] shrink-0 rounded-full bg-accent px-3 text-[13.5px] sm:min-w-[6.5rem] sm:px-4 font-semibold text-accent-foreground transition-colors duration-500"
		>
			{DATA.lenses[lens].dockLabel}
		</button>
	);
}
