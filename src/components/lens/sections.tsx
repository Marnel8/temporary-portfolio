"use client";

import { DATA } from "@/data/resume";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useLens } from "./lens-provider";

const H2 = "lens-display text-[26px] tracking-[-0.02em]";

// Widened on purpose: DATA is `as const`, so the literal types would otherwise
// make a project with no video (or no image) look impossible.
type Project = {
	title: string;
	dates: string;
	description: string;
	technologies: readonly string[];
	links: readonly { type: string; href: string }[];
	image: string;
	video: string;
};

const projectByTitle = (title: string): Project | undefined =>
	DATA.projects.find((p) => p.title === title);

// only real, absolute links are shown
const isUrl = (href: string) => /^https?:\/\//.test(href);

function ProjectLinks({ project }: { project: Project }) {
	const links = project.links.filter((l) => isUrl(l.href));
	if (!links.length) return null;
	return (
		<div className="flex gap-4 text-sm font-medium">
			{links.map((l) => (
				<a
					key={l.type}
					href={l.href}
					target="_blank"
					rel="noreferrer"
					className="link-underline text-accent-text"
				>
					{l.type}
				</a>
			))}
		</div>
	);
}

/**
 * A project's own media: its screen recording when there is one (with the
 * screenshot as poster), otherwise the screenshot. The video only plays while
 * the row is open, and never when the visitor prefers reduced motion.
 */
function ProjectMedia({
	project,
	open,
	priority,
}: {
	project: Project;
	open: boolean;
	priority?: boolean;
}) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (open && !reduce) video.play().catch(() => {});
		else video.pause();
	}, [open]);

	if (project.video) {
		return (
			<video
				ref={videoRef}
				src={encodeURI(project.video)}
				poster={project.image ? encodeURI(project.image) : undefined}
				muted
				loop
				playsInline
				preload="metadata"
				aria-label={`${project.title} screen recording`}
				className="h-full w-full object-cover object-top"
			/>
		);
	}
	if (project.image) {
		return (
			<Image
				src={encodeURI(project.image)}
				alt={`${project.title} screenshot`}
				fill
				priority={priority}
				sizes="(min-width: 672px) 624px, 100vw"
				className="object-cover object-top"
			/>
		);
	}
	return null;
}

/** One project: click the header to show or hide its screenshot / recording. */
function ProjectRow({
	project,
	open,
	onToggle,
	priority,
}: {
	project: Project;
	open: boolean;
	onToggle: () => void;
	priority: boolean;
}) {
	const hasMedia = Boolean(project.video || project.image);
	// mount the media on first open and keep it, so closing doesn't blank the collapse
	const [seen, setSeen] = useState(open);
	const panelId = useId();
	const headRef = useRef<HTMLButtonElement>(null);

	// a row above may have collapsed and pulled this one up: once the motion has
	// settled, make sure the header we just opened is still on screen
	useEffect(() => {
		if (!open) return;
		setSeen(true);
		const id = setTimeout(
			() => headRef.current?.scrollIntoView({ block: "nearest" }),
			520
		);
		return () => clearTimeout(id);
	}, [open]);

	const head = (
		<>
			<span className="flex flex-wrap items-baseline justify-between gap-x-3">
				<span className="text-lg font-semibold tracking-tight">{project.title}</span>
				<span className="flex items-center gap-2">
					<span className="tabular text-sm text-muted-foreground">{project.dates}</span>
					{hasMedia && (
						<ChevronDown
							aria-hidden
							className={`size-4 shrink-0 text-muted-foreground transition-transform duration-500 ${
								open ? "rotate-180" : ""
							}`}
						/>
					)}
				</span>
			</span>
			<span className="block max-w-[600px] text-[15px] leading-[1.55] text-body">
				{project.description}
			</span>
			<span className="block text-[13.5px] font-medium text-accent-text">
				{project.technologies.join(", ")}
			</span>
		</>
	);

	return (
		<article className="border-b border-border py-[18px]">
			{hasMedia ? (
				<button
					ref={headRef}
					type="button"
					aria-expanded={open}
					aria-controls={panelId}
					onClick={onToggle}
					className="flex w-full flex-col gap-1.5 rounded-md text-left"
				>
					{head}
				</button>
			) : (
				<div className="flex flex-col gap-1.5">{head}</div>
			)}

			{hasMedia && (
				<div
					id={panelId}
					aria-hidden={!open}
					className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
						open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
					}`}
				>
					<div className="overflow-hidden">
						<div className="relative mt-4 aspect-video overflow-hidden border border-border">
							{seen && <ProjectMedia project={project} open={open} priority={priority} />}
						</div>
					</div>
				</div>
			)}

			<div className="mt-2 empty:hidden">
				<ProjectLinks project={project} />
			</div>
		</article>
	);
}

export function ToolsSection() {
	const { lens } = useLens();
	const v = DATA.lenses[lens];
	return (
		<section className="flex flex-col gap-3.5">
			<h2 className={H2}>{v.toolsTitle}</h2>
			<p className="text-base leading-8 text-body">{v.tools.join(", ")}</p>
			<p className="text-sm leading-7 text-muted-foreground">
				Also: {DATA.lenses.otherTools.join(", ")}
			</p>
		</section>
	);
}

export function ProjectsSection() {
	const { lens } = useLens();
	const v = DATA.lenses[lens];

	return (
		<section id="projects" className="flex scroll-mt-8 flex-col gap-6">
			<h2 className={H2}>{v.projectsTitle}</h2>
			<p className="-mt-3 text-sm text-muted-foreground">
				Select a project to see its screenshot or recording.
			</p>
			{/* keyed by lens so each view starts fresh, with its featured project open */}
			<ProjectList key={lens} lens={lens} />
		</section>
	);
}

/** Accordion: one project open at a time. */
function ProjectList({ lens }: { lens: "swe" | "ai" }) {
	const v = DATA.lenses[lens];
	const featured = projectByTitle(v.featured);
	const rest = v.projects
		.map(projectByTitle)
		.filter((p): p is Project => Boolean(p));
	// the lens's featured project comes first and starts open
	const ordered = featured ? [featured, ...rest] : rest;
	const [openTitle, setOpenTitle] = useState<string | null>(featured?.title ?? null);

	return (
		<div className="flex flex-col border-t border-border">
			{ordered.map((p) => (
				<ProjectRow
					key={p.title}
					project={p}
					open={openTitle === p.title}
					priority={p === featured}
					onToggle={() => setOpenTitle((cur) => (cur === p.title ? null : p.title))}
				/>
			))}
		</div>
	);
}

type Lensed = "swe" | "ai" | "both" | "none";

type TimelineEntry = { title: string; org: string; dates: string };

/** Entries keep the order listed in DATA.lenses.timeline; unlisted ones go last. */
function byTimelineOrder(entries: TimelineEntry[]) {
	const order = Object.keys(DATA.lenses.timeline);
	const rank = (title: string) => {
		const i = order.indexOf(title);
		return i < 0 ? order.length : i;
	};
	return [...entries].sort((a, b) => rank(a.title) - rank(b.title));
}

function TimelineSection({ title, entries }: { title: string; entries: TimelineEntry[] }) {
	const { lens } = useLens();
	const tags: Record<string, Lensed> = DATA.lenses.timeline;

	return (
		<section className="flex flex-col gap-1.5">
			<h2 className={`${H2} mb-2.5`}>{title}</h2>
			<p className="mb-3 text-sm text-muted-foreground">
				Everything stays listed. Entries outside this view are dimmed.
			</p>
			{byTimelineOrder(entries).map((e) => {
				const tag = tags[e.title] ?? "both";
				const on = tag === "both" || tag === lens;
				return (
					<div
						key={`${e.title}-${e.org}`}
						className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border py-3.5 transition-opacity duration-500"
						style={{ opacity: on ? 1 : 0.45 }}
					>
						<div className="flex flex-col gap-0.5">
							<span className="text-[15.5px] font-medium">{e.title}</span>
							<span className="text-sm text-muted-foreground">{e.org}</span>
						</div>
						<span className="tabular text-sm text-muted-foreground">{e.dates}</span>
					</div>
				);
			})}
		</section>
	);
}

export function ExperienceSection() {
	return (
		<TimelineSection
			title="Experience"
			entries={DATA.work.map((w) => ({
				title: w.title,
				org: w.company,
				dates: `${w.start} — ${w.end}`,
			}))}
		/>
	);
}

export function EducationSection() {
	return (
		<TimelineSection
			title="Education"
			entries={DATA.education.map((e) => ({
				title: e.degree,
				org: e.school,
				dates: `${e.start} — ${e.end}`,
			}))}
		/>
	);
}

export function TrainingSection() {
	return (
		<section className="flex flex-col gap-1.5">
			<h2 className={`${H2} mb-2.5`}>Training and certifications</h2>
			<p className="mb-3 text-[15px] leading-[1.55] text-body">{DATA.trainingsIntro}</p>
			<div className="border-b border-border">
				{DATA.trainings.map((t) => {
					const cert = t.links.find((l) => isUrl(l.href));
					return (
						<div
							key={t.title}
							className="flex flex-wrap justify-between gap-x-4 gap-y-1 border-t border-border py-3.5"
						>
							<div className="flex flex-col gap-0.5">
								<span className="text-[15.5px] font-medium">{t.title}</span>
								<span className="text-sm text-muted-foreground">
									{t.location} · {t.dates}
								</span>
							</div>
							{cert && (
								<a
									href={cert.href}
									target="_blank"
									rel="noreferrer"
									className="link-underline self-center text-sm font-medium text-accent-text"
								>
									View certificate
								</a>
							)}
						</div>
					);
				})}
			</div>
		</section>
	);
}

export function AboutSection() {
	return (
		<section className="flex flex-col gap-3.5">
			<h2 className={H2}>About</h2>
			<p className="text-[16.5px] leading-[1.7] text-body">{DATA.summary}</p>
		</section>
	);
}

export function ContactSection() {
	const socials = Object.entries(DATA.contact.social).filter(([, s]) => s.navbar);
	return (
		<section className="flex flex-col gap-3 pb-24">
			<h2 className={H2}>Get in touch</h2>
			<a
				href={`mailto:${DATA.contact.email}`}
				className="[overflow-wrap:anywhere] text-[clamp(1rem,5.6vw,1.875rem)] font-medium tracking-[-0.02em] underline decoration-accent decoration-1 underline-offset-[6px]"
			>
				{DATA.contact.email}
			</a>
			<p className="text-[15px] text-muted-foreground">
				Or call <span className="tabular">{DATA.contact.phone}</span>. Want to chat? Shoot me a
				DM{" "}
				<Link href={DATA.contact.social.X.url} className="link-underline font-medium text-foreground">
					on Twitter
				</Link>{" "}
				or send an email. I&apos;ll respond whenever I can — I ignore all soliciting.
			</p>
			<p className="flex flex-wrap gap-x-4 gap-y-1 text-[15px]">
				{socials.map(([name, s]) => (
					<Link key={name} href={s.url} className="link-underline font-medium">
						{name}
					</Link>
				))}
			</p>
		</section>
	);
}
