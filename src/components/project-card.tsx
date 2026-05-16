import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";

interface Props {
	title: string;
	href?: string;
	description: string;
	dates: string;
	tags: readonly string[];
	link?: string;
	image?: string;
	video?: string;
	index?: string;
	links?: readonly {
		icon: React.ReactNode;
		type: string;
		href: string;
	}[];
	className?: string;
}

export function ProjectCard({
	title,
	href,
	description,
	dates,
	tags,
	link,
	image,
	video,
	links,
	index,
	className,
}: Props) {
	const hasMedia = Boolean(video || image);
	return (
		<div
			className={cn(
				"group relative flex flex-col h-full border border-border bg-card overflow-hidden transition-all duration-300 ease-out hover:border-foreground/30",
				className
			)}
		>
			{/* index marker */}
			{index && (
				<span className="absolute top-2 left-2 z-10 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground bg-background/80 backdrop-blur px-1.5 py-0.5">
					{index}
				</span>
			)}

			{/* hover arrow */}
			<span className="absolute top-2 right-2 z-10 size-7 grid place-items-center bg-background/80 backdrop-blur translate-x-1 -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300 text-[hsl(var(--accent))]">
				<ArrowUpRight className="size-4" />
			</span>

			<Link href={href || "#"} className={cn("block cursor-pointer overflow-hidden", className)}>
				{hasMedia ? (
					<>
						{video && (
							<video
								src={video}
								autoPlay
								loop
								muted
								playsInline
								className="pointer-events-none mx-auto h-44 w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
							/>
						)}
						{image && (
							<Image
								src={image}
								alt={title}
								width={500}
								height={300}
								className="h-44 w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
							/>
						)}
					</>
				) : (
					<div className="h-44 w-full bg-muted/40 grid place-items-center">
						<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
							— no preview —
						</span>
					</div>
				)}
			</Link>

			<div className="flex flex-col gap-2 p-4 flex-1">
				<div className="flex items-baseline justify-between gap-2">
					<h3 className="font-semibold tracking-tight text-[15px] leading-snug">
						{title}
					</h3>
					<time className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground shrink-0 tabular">
						{dates}
					</time>
				</div>

				<Markdown className="prose max-w-full text-pretty font-sans text-[13px] leading-relaxed text-muted-foreground dark:prose-invert">
					{description}
				</Markdown>

				{tags && tags.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-x-2 gap-y-0.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground/90">
						{tags.map((tag, i) => (
							<span key={tag}>
								{tag}
								{i < tags.length - 1 && (
									<span className="ml-2 text-muted-foreground/40">·</span>
								)}
							</span>
						))}
					</div>
				)}

				{links && links.length > 0 && (
					<div className="mt-3 flex flex-row flex-wrap items-center gap-3 pt-3 border-t border-border">
						{links.map((l, idx) => (
							<Link
								href={l.href}
								key={idx}
								target="_blank"
								className="group/link inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70 hover:text-[hsl(var(--accent))] transition-colors duration-200"
							>
								{l.icon}
								<span className="link-underline">{l.type}</span>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
