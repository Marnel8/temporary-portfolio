"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and
   the scroll position always agree. Wraps the whole app. */

export default function SmoothScroll({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
		lenis.on("scroll", ScrollTrigger.update);

		// The slide deck owns the wheel when active — Lenis must let go,
		// otherwise both fight over wheel events. The deck dispatches
		// "deckmode" on activate/deactivate.
		const onDeckMode = (e: Event) => {
			const on = (e as CustomEvent<{ on: boolean }>).detail.on;
			if (on) lenis.stop();
			else lenis.start();
		};
		window.addEventListener("deckmode", onDeckMode);

		const raf = (time: number) => lenis.raf(time * 1000);
		gsap.ticker.add(raf);
		gsap.ticker.lagSmoothing(0);

		return () => {
			window.removeEventListener("deckmode", onDeckMode);
			gsap.ticker.remove(raf);
			lenis.destroy();
		};
	}, []);

	return <>{children}</>;
}
