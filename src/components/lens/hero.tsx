"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { Lens, useLens } from "./lens-provider";

const TITLE_CLASS =
	"lens-display block text-left text-[clamp(2.75rem,10vw,5.25rem)] sm:text-[3.5rem] leading-[1.05] transition-opacity duration-500 hover:opacity-100 rounded-md";

/**
 * Hero: the two titles are the lens switch. The active one is full strength,
 * the other is faded; clicking one changes the whole page.
 */
export function Hero() {
	const { lens, setLens } = useLens();
	const v = DATA.lenses[lens];

	const title = (id: Lens) => (
		<button
			type="button"
			onClick={(e) => setLens(id, e.currentTarget)}
			aria-pressed={lens === id}
			className={cn(TITLE_CLASS, lens === id ? "opacity-100" : "opacity-50")}
			style={{ letterSpacing: "var(--lens-title-track)" }}
		>
			{DATA.lenses[id].title}
		</button>
	);

	return (
		<section className="flex flex-col gap-11">
			<div className="flex flex-wrap items-center gap-3.5">
				<Avatar className="size-16 rounded-none">
					<AvatarImage alt={DATA.name} src={DATA.avatarUrl} className="object-cover" />
					<AvatarFallback className="rounded-none">{DATA.initials}</AvatarFallback>
				</Avatar>
				<div className="flex min-w-[11rem] flex-1 flex-col">
					<span className="text-base font-semibold">{DATA.name}</span>
					<span className="text-sm text-muted-foreground">{DATA.location}</span>
				</div>
				<a
					href="/resume.pdf"
					className="rounded-lg border border-border px-4 py-3 text-sm font-medium transition-[border-color,border-radius] duration-500 hover:bg-secondary"
				>
					Download CV
				</a>
			</div>

			<div role="group" aria-label="Choose what to show" className="flex flex-col items-start gap-1">
				<h1 className="contents">
					{title("swe")}
					{title("ai")}
				</h1>
				<span className="mt-3.5 text-sm text-muted-foreground">
					Pick a title to change what the page shows.
				</span>
			</div>

			<div aria-live="polite" className="flex flex-col gap-6">
				<p className="max-w-[580px] text-pretty text-[19px] leading-[1.55] text-body">{v.intro}</p>
				<div className="flex flex-wrap gap-3">
					<a
						href="#projects"
						className="rounded-lg bg-accent px-5 py-3 text-[15px] font-semibold text-accent-foreground transition-colors duration-500 hover:opacity-90"
					>
						{v.cta}
					</a>
					<a
						href={`mailto:${DATA.contact.email}`}
						className="rounded-lg border border-border px-5 py-3 text-[15px] font-medium transition-colors hover:bg-secondary"
					>
						Email me
					</a>
				</div>
				<div className="flex flex-col border-t border-border">
					{v.now.map((n) => (
						<div
							key={n.what}
							className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-b border-border py-3.5"
						>
							<span className="text-[15px] font-medium">{n.what}</span>
							<span className="text-sm text-muted-foreground">{n.where}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
