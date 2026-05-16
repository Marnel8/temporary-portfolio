import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface Props {
	title: string;
	description: string;
	dates: string;
	location: string;
	image?: string;
	links?: readonly {
		icon: React.ReactNode;
		title: string;
		href: string;
	}[];
}

export function HackathonCard({
	title,
	description,
	dates,
	location,
	image,
	links,
}: Props) {
	return (
		<li className="relative ml-10 py-5">
			{/* logo */}
			<div className="absolute -left-16 top-4 flex items-center justify-center">
				<Avatar className="size-12 ring-1 ring-border bg-background">
					<AvatarImage src={image} alt={title} className="object-contain p-1.5" />
					<AvatarFallback>{title[0]}</AvatarFallback>
				</Avatar>
			</div>

			<div className="flex flex-1 flex-col justify-start gap-1">
				{dates && (
					<time className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground tabular">
						{dates}
					</time>
				)}
				<h2 className="font-semibold tracking-tight text-[15px] leading-snug">
					{title}
				</h2>
				{location && (
					<p className="text-[13px] text-muted-foreground">{location}</p>
				)}
				{description && (
					<span className="prose dark:prose-invert text-[13px] leading-relaxed text-foreground/75 mt-1">
						{description}
					</span>
				)}
			</div>

			{links && links.length > 0 && (
				<div className="mt-3 flex flex-row flex-wrap items-center gap-3">
					{links.map((link, idx) => (
						<Link
							href={link.href}
							key={idx}
							className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70 hover:text-[hsl(var(--accent))] transition-colors duration-200"
						>
							{link.icon}
							<span className="link-underline">{link.title}</span>
						</Link>
					))}
				</div>
			)}
		</li>
	);
}
