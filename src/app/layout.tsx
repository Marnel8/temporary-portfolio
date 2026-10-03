import Navbar from "@/components/navbar";
import { LENS_INIT_SCRIPT, LensProvider } from "@/components/lens/lens-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import "./globals.css";

// Heading face for the data science & AI lens (software uses Geist).
const newsreader = Newsreader({
	subsets: ["latin"],
	variable: "--font-serif",
	display: "swap",
	adjustFontFallback: false,
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
	verification: {
		google: "",
		yandex: "",
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
			data-lens="swe"
			className={cn(GeistSans.variable, GeistMono.variable, newsreader.variable)}
			style={
				{
					"--font-sans": GeistSans.style.fontFamily,
					"--font-mono": GeistMono.style.fontFamily,
				} as React.CSSProperties
			}
		>
			<head>
				{/* sets data-lens before first paint (from ?view= or the saved choice) */}
				<script dangerouslySetInnerHTML={{ __html: LENS_INIT_SCRIPT }} />
			</head>
			<body
				className={cn(
					"min-h-screen bg-background font-sans antialiased relative",
					GeistSans.className
				)}
			>
				<LensProvider>
					<TooltipProvider delayDuration={0}>
						<div className="max-w-2xl mx-auto py-16 sm:py-24 px-6 relative z-10">
							{children}
						</div>

						<Navbar />
						<SmoothCursor />
						<Analytics />
					</TooltipProvider>
				</LensProvider>
			</body>
		</html>
	);
}
