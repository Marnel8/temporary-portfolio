"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

/* ═══════════════════════════════════════════════════════════════════════
   FX CONTEXT — single switch for every "CRT" effect on the site
   (scanlines, flicker, matrix-rain transitions).

   - Persisted in localStorage under "boot.fx" so the choice survives
     reloads.
   - Defaults to ON, unless the visitor's OS asks for reduced motion,
     in which case it defaults to OFF (they can still opt back in).
   - Mirrors the state onto <html data-fx="on|off"> so plain CSS can
     switch the overlays without React re-renders.
   ═══════════════════════════════════════════════════════════════════ */

const STORAGE_KEY = "boot.fx";

type FxContextValue = {
	fx: boolean;
	toggleFx: () => void;
};

const FxContext = createContext<FxContextValue>({
	fx: true,
	toggleFx: () => {},
});

export function useFx() {
	return useContext(FxContext);
}

export default function FxProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	// Start "on" for SSR; the effect below reconciles with the real
	// preference right after hydration.
	const [fx, setFx] = useState(true);

	useEffect(() => {
		const stored = window.localStorage.getItem(STORAGE_KEY);
		if (stored === "on" || stored === "off") {
			setFx(stored === "on");
		} else if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			setFx(false);
		}
	}, []);

	// Keep the DOM attribute in sync — CSS overlays key off this.
	useEffect(() => {
		document.documentElement.dataset.fx = fx ? "on" : "off";
	}, [fx]);

	const toggleFx = useCallback(() => {
		setFx((prev) => {
			const next = !prev;
			window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
			return next;
		});
	}, []);

	return (
		<FxContext.Provider value={{ fx, toggleFx }}>
			{children}
		</FxContext.Provider>
	);
}
