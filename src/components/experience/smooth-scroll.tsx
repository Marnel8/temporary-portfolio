"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scroll-store";

export default function SmoothScroll({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		gsap.registerPlugin(ScrollTrigger);

		const lenis = new Lenis({
			lerp: 0.09,
			smoothWheel: true,
			wheelMultiplier: 1,
		});

		lenis.on("scroll", (e: any) => {
			scrollState.y = e.scroll;
			scrollState.progress = e.progress;
			scrollState.velocity = e.velocity;
			ScrollTrigger.update();
		});

		const raf = (time: number) => lenis.raf(time * 1000);
		gsap.ticker.add(raf);
		gsap.ticker.lagSmoothing(0);

		// Make ScrollTrigger drive scrolling through Lenis.
		ScrollTrigger.refresh();

		return () => {
			gsap.ticker.remove(raf);
			lenis.destroy();
		};
	}, []);

	return <>{children}</>;
}
