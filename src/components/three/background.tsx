"use client";

import dynamic from "next/dynamic";

const CoreScene = dynamic(() => import("./core-scene"), { ssr: false });

export default function Background() {
	return (
		<div className="pointer-events-none fixed inset-0 z-0">
			<CoreScene />
			{/* radial vignette to seat the content over the scene */}
			<div
				className="absolute inset-0"
				style={{
					background:
						"radial-gradient(120% 90% at 50% 40%, transparent 30%, rgba(10,14,20,0.55) 70%, rgba(10,14,20,0.92) 100%)",
				}}
			/>
		</div>
	);
}
