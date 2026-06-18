import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Unbounded } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SmoothScroll from "@/components/experience/smooth-scroll";
import Preloader from "@/components/experience/preloader";
import Cursor from "@/components/experience/cursor";
import Hud from "@/components/experience/hud";
import Background from "@/components/three/background";
import "./globals.css";

const display = Unbounded({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
	variable: "--font-display",
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
			className={cn("dark", GeistSans.variable, GeistMono.variable, display.variable)}
			style={
				{
					"--font-sans": GeistSans.style.fontFamily,
					"--font-mono": GeistMono.style.fontFamily,
				} as React.CSSProperties
			}
		>
			<body
				className={cn(
					"grain relative min-h-screen overflow-x-hidden bg-[#070809] font-sans text-[#f5f3ef] antialiased",
					GeistSans.className
				)}
			>
				<Preloader />
				<Background />
				<Hud />
				<Cursor />
				<SmoothScroll>{children}</SmoothScroll>
				<Analytics />
			</body>
		</html>
	);
}
