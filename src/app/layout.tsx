import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter, Archivo_Black, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import FxProvider from "@/components/boot/fx-context";
import HudFrame from "@/components/boot/hud-frame";
import RainOverlay from "@/components/boot/rain-overlay";
import SmoothScroll from "@/components/boot/smooth-scroll";
import "./globals.css";

/* "Boot Sequence" type stack:
   Archivo Black → the massive hero display face (solid fills only)
   JetBrains Mono → nearly everything else: labels, logs, UI, body
   Inter → long-form prose on the blog, where mono tires the eye
   Variable names are kept from the previous design so existing
   components pick the fonts up without edits. */
const display = Archivo_Black({
	subsets: ["latin"],
	weight: "400",
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
			<body className="relative min-h-screen overflow-x-hidden bg-boot font-mono text-pale antialiased">
				{/* FxProvider mirrors the CRT toggle onto <html data-fx>;
				    HudFrame + RainOverlay are fixed chrome on every route. */}
				<FxProvider>
					<HudFrame />
					<RainOverlay />
					<SmoothScroll>{children}</SmoothScroll>
				</FxProvider>
				<Analytics />
			</body>
		</html>
	);
}
