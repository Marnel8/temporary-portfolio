import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SmoothScroll from "@/components/experience/smooth-scroll";
import ArcadeRoot from "@/components/arcade/arcade-root";
import Preloader from "@/components/experience/preloader";
import Cursor from "@/components/experience/cursor";
import Hud from "@/components/experience/hud";
import Background from "@/components/three/background";
import "./globals.css";

/* "Signal / Perimeter" type stack:
   Sora → headings · Inter → body · JetBrains Mono → data/labels/timestamps.
   Variable names are kept from the previous design so every component
   (blog, arcade, magicui) picks the new fonts up without edits. */
const display = Sora({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-display",
	display: "swap",
});

const body = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
	display: "swap",
});

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	metadataBase: new URL(DATA.url),
	title: {
		default: DATA.name,
		template: `%s | ${DATA.name}`,
	},
	description: DATA.description,
	openGraph: {
		title: `${DATA.name}`,
		description: DATA.description,
		url: DATA.url,
		siteName: `${DATA.name}`,
		locale: "en_US",
		type: "website",
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	twitter: {
		title: `${DATA.name}`,
		card: "summary_large_image",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn("dark", body.variable, mono.variable, display.variable)}
		>
			<body
				className={cn(
					"grain relative min-h-screen overflow-x-hidden bg-[#0A0E14] font-sans text-[#E4E7EB] antialiased",
					body.className
				)}
			>
				<Preloader />
				<Background />
				<Hud />
				<Cursor />
				<ArcadeRoot>
					<SmoothScroll>{children}</SmoothScroll>
				</ArcadeRoot>
				<Analytics />
			</body>
		</html>
	);
}
