import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

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
	const year = new Date().getFullYear();
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={cn(GeistSans.variable, GeistMono.variable)}
			style={
				{
					"--font-sans": GeistSans.style.fontFamily,
					"--font-mono": GeistMono.style.fontFamily,
				} as React.CSSProperties
			}
		>
			<body
				className={cn(
					"grain min-h-screen bg-background font-sans antialiased relative",
					GeistSans.className
				)}
			>
				<ThemeProvider attribute="class" defaultTheme="light">
					<TooltipProvider delayDuration={0}>
						{/* fixed wordmark · top-left */}
						<div className="pointer-events-none fixed top-5 left-5 z-40 hidden sm:flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
							<span className="inline-block size-1.5 rounded-full bg-[hsl(var(--accent))]" />
							<span>MV</span>
							<span aria-hidden>/</span>
							<span className="tabular">{year}</span>
						</div>

						{/* fixed page label · top-right */}
						<div className="pointer-events-none fixed top-5 right-5 z-40 hidden sm:block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
							<span aria-hidden>/ </span>portfolio
						</div>

						<div className="max-w-2xl mx-auto py-16 sm:py-24 px-6 relative z-10">
							{children}
						</div>

						<Navbar />
						<SmoothCursor />
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
