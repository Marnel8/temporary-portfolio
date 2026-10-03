"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

export type Lens = "swe" | "ai";

const STORAGE_KEY = "lens";
const WIPE_MS = 720;

/*
 * The active lens lives on <html data-lens>. The inline script in layout.tsx
 * sets it before first paint (from ?view= or localStorage); everything else
 * reads it through useSyncExternalStore so server HTML is always "swe" and the
 * client corrects itself without a flash of the wrong palette.
 */
const listeners = new Set<() => void>();

const subscribe = (cb: () => void) => {
	listeners.add(cb);
	return () => {
		listeners.delete(cb);
	};
};

const getSnapshot = (): Lens =>
	document.documentElement.dataset.lens === "ai" ? "ai" : "swe";

const getServerSnapshot = (): Lens => "swe";

/** Write the lens to <html>, remember it, and put it in the URL. */
function commitLens(next: Lens) {
	const root = document.documentElement;
	root.dataset.lens = next;
	// shadcn / blog `dark:` styles follow the AI lens
	root.classList.toggle("dark", next === "ai");
	try {
		localStorage.setItem(STORAGE_KEY, next);
	} catch {}
	try {
		const url = new URL(window.location.href);
		url.searchParams.set("view", next);
		window.history.replaceState(window.history.state, "", url);
	} catch {}
	listeners.forEach((l) => l());
}

type LensContextValue = {
	lens: Lens;
	/** `origin` is the control that was clicked; the new view grows out of it. */
	setLens: (next: Lens, origin?: Element | null) => void;
};

const LensContext = createContext<LensContextValue | null>(null);

export function LensProvider({ children }: { children: React.ReactNode }) {
	const lens = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

	const setLens = useCallback((next: Lens, origin?: Element | null) => {
		if (next === getSnapshot()) return;

		const reduceMotion = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		if (reduceMotion || !document.startViewTransition) {
			commitLens(next);
			return;
		}

		// Circle origin: centre of the clicked control (page centre as fallback).
		const rect = origin?.getBoundingClientRect();
		const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
		const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
		const reach = Math.hypot(
			Math.max(x, window.innerWidth - x),
			Math.max(y, window.innerHeight - y)
		);

		const transition = document.startViewTransition(() => {
			flushSync(() => commitLens(next));
		});
		transition.ready
			.then(() => {
				document.documentElement.animate(
					{
						clipPath: [
							`circle(0px at ${x}px ${y}px)`,
							`circle(${reach}px at ${x}px ${y}px)`,
						],
					},
					{
						duration: WIPE_MS,
						easing: "cubic-bezier(0.65, 0, 0.35, 1)",
						pseudoElement: "::view-transition-new(root)",
					}
				);
			})
			.catch(() => {});
	}, []);

	return (
		<LensContext.Provider value={{ lens, setLens }}>
			{children}
		</LensContext.Provider>
	);
}

export function useLens() {
	const ctx = useContext(LensContext);
	if (!ctx) throw new Error("useLens must be used inside <LensProvider>");
	return ctx;
}

/** Runs before first paint so the page never flashes the wrong lens. */
export const LENS_INIT_SCRIPT = `(function(){try{var p=new URLSearchParams(location.search).get("view");var s=localStorage.getItem("${STORAGE_KEY}");var l=(p==="ai"||p==="swe")?p:(s==="ai"?"ai":"swe");var r=document.documentElement;r.dataset.lens=l;if(l==="ai")r.classList.add("dark");}catch(e){}})();`;
