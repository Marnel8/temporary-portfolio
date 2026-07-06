"use client";

import { useEffect, useState } from "react";

/* Live HH:MM:SS clock for the HUD utility bar.
   Renders a placeholder until mounted so the server and client markup
   never disagree (avoids a hydration mismatch on the seconds). */

function stamp(d: Date) {
	const p = (n: number) => String(n).padStart(2, "0");
	return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export default function Clock({ className }: { className?: string }) {
	const [time, setTime] = useState<string | null>(null);

	useEffect(() => {
		setTime(stamp(new Date()));
		const id = setInterval(() => setTime(stamp(new Date())), 1000);
		return () => clearInterval(id);
	}, []);

	return (
		<span className={className} suppressHydrationWarning>
			{/* fixed-width placeholder keeps the bar from jumping on mount */}
			{time ?? "--:--:--"}
		</span>
	);
}
