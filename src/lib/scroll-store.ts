// Lightweight shared state bridge between Lenis smooth-scroll, GSAP and the
// WebGL scene. Mutated in place every frame to avoid React re-renders.

export const scrollState = {
	y: 0,
	progress: 0,
	velocity: 0,
};

export const pointer = {
	// smoothed (read by the 3D scene)
	x: 0,
	y: 0,
	// raw target from the last pointer event
	tx: 0,
	ty: 0,
};

if (typeof window !== "undefined") {
	window.addEventListener(
		"pointermove",
		(e) => {
			pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
			pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
		},
		{ passive: true }
	);
}
