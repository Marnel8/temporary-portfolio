import { HackathonCard } from "@/components/hackathon-card";
import BlurFade from "@/components/magicui/blur-fade";
import BlurFadeText from "@/components/magicui/blur-fade-text";
import { ProjectCard } from "@/components/project-card";
import { ResumeCard } from "@/components/resume-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DATA } from "@/data/resume";
import Link from "next/link";
import Markdown from "react-markdown";

const BLUR_FADE_DELAY = 0.05;

const SectionHeader = ({
	index,
	title,
	caption,
}: {
	index: string;
	title: string;
	caption?: string;
}) => (
	<div className="flex items-baseline gap-4 mb-5">
		<span className="eyebrow tabular shrink-0">
			{index} <span className="opacity-40">—</span>
		</span>
		<h2 className="text-lg font-semibold tracking-tight">{title}</h2>
		<div className="flex-1 h-px bg-border translate-y-[-2px]" />
		{caption && (
			<span className="eyebrow tabular hidden sm:inline shrink-0">
				{caption}
			</span>
		)}
	</div>
);

export default function Page() {
	const firstName = DATA.name.split(" ")[0];
	const projectsCount = String(DATA.projects.length).padStart(2, "0");
	const workCount = String(DATA.work.length).padStart(2, "0");
	const skillsCount = String(DATA.skills.length).padStart(2, "0");

	return (
		<main className="flex flex-col min-h-[100dvh] space-y-16 sm:space-y-20">
			{/* ───── hero ─────────────────────────────────────────────── */}
			<section id="hero" className="pt-2">
				<div className="mx-auto w-full max-w-2xl">
					<BlurFade delay={BLUR_FADE_DELAY}>
						<div className="eyebrow mb-6 flex items-center gap-3 overflow-hidden">
							<span className="inline-block size-1.5 shrink-0 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
							<span className="truncate">
								Available for select projects
								<span className="hidden sm:inline"> · {DATA.location}</span>
							</span>
						</div>
					</BlurFade>

					<div className="flex items-start justify-between gap-6">
						<div className="flex-col flex flex-1 space-y-3">
							<h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.04em] leading-[0.95]">
								<span className="reveal-wipe inline-block">Hi, I&apos;m</span>{" "}
								<span
									className="reveal-wipe inline-block text-[hsl(var(--accent))]"
									style={{ animationDelay: "0.18s" }}
								>
									{firstName}
								</span>
								<span
									className="reveal-wipe inline-block"
									style={{ animationDelay: "0.32s" }}
								>
									.
								</span>
								<span className="caret align-baseline" aria-hidden />
							</h1>

							<BlurFadeText
								className="max-w-[520px] text-base sm:text-lg text-muted-foreground leading-relaxed pt-2"
								delay={BLUR_FADE_DELAY * 5}
								text={DATA.description}
							/>
						</div>

						<BlurFade delay={BLUR_FADE_DELAY * 2}>
							<div className="relative shrink-0">
								<Avatar className="size-20 sm:size-24 rounded-full ring-1 ring-border ring-offset-2 ring-offset-background">
									<AvatarImage
										alt={DATA.name}
										src={DATA.avatarUrl}
										className="object-cover"
									/>
									<AvatarFallback>{DATA.initials}</AvatarFallback>
								</Avatar>
								<span className="absolute -bottom-1 -right-1 size-3 rounded-full bg-emerald-500 ring-2 ring-background" />
							</div>
						</BlurFade>
					</div>

					{/* meta row */}
					<BlurFade delay={BLUR_FADE_DELAY * 6}>
						<div className="mt-10 grid grid-cols-3 gap-6 border-y border-border py-4">
							<div>
								<div className="eyebrow mb-1">Role</div>
								<div className="text-sm font-medium">Web Developer</div>
							</div>
							<div>
								<div className="eyebrow mb-1">Based in</div>
								<div className="text-sm font-medium">Mindoro, PH</div>
							</div>
							<div>
								<div className="eyebrow mb-1">Years</div>
								<div className="text-sm font-medium tabular">2023 — Now</div>
							</div>
						</div>
					</BlurFade>
				</div>
			</section>

			{/* ───── about ────────────────────────────────────────────── */}
			<section id="about">
				<BlurFade delay={BLUR_FADE_DELAY * 7}>
					<SectionHeader index="01" title="About" />
				</BlurFade>
				<BlurFade delay={BLUR_FADE_DELAY * 8}>
					<Markdown className="prose max-w-full text-pretty font-sans text-[15px] leading-relaxed text-foreground/80 dark:prose-invert">
						{DATA.summary}
					</Markdown>
				</BlurFade>
			</section>

			{/* ───── work ─────────────────────────────────────────────── */}
			<section id="work">
				<div className="flex min-h-0 flex-col">
					<BlurFade delay={BLUR_FADE_DELAY * 9}>
						<SectionHeader index="02" title="Experience" caption={`${workCount} positions`} />
					</BlurFade>
					<div className="flex flex-col gap-y-2">
						{DATA.work.map((work, id) => (
							<BlurFade
								key={work.company}
								delay={BLUR_FADE_DELAY * 10 + id * 0.05}
							>
								<ResumeCard
									key={work.company}
									logoUrl={work.logoUrl}
									altText={work.company}
									title={work.company}
									subtitle={work.title}
									href={work.href}
									badges={work.badges}
									period={`${work.start} — ${work.end ?? "Present"}`}
									description={work.description}
								/>
							</BlurFade>
						))}
					</div>
				</div>
			</section>

			{/* ───── education ────────────────────────────────────────── */}
			<section id="education">
				<div className="flex min-h-0 flex-col">
					<BlurFade delay={BLUR_FADE_DELAY * 11}>
						<SectionHeader index="03" title="Education" />
					</BlurFade>
					<div className="flex flex-col gap-y-2">
						{DATA.education.map((education, id) => (
							<BlurFade
								key={education.school}
								delay={BLUR_FADE_DELAY * 12 + id * 0.05}
							>
								<ResumeCard
									key={education.school}
									href={education.href}
									logoUrl={education.logoUrl}
									altText={education.school}
									title={education.school}
									subtitle={education.degree}
									period={`${education.start} — ${education.end}`}
								/>
							</BlurFade>
						))}
					</div>
				</div>
			</section>

			{/* ───── skills ───────────────────────────────────────────── */}
			<section id="skills">
				<div className="flex min-h-0 flex-col">
					<BlurFade delay={BLUR_FADE_DELAY * 13}>
						<SectionHeader index="04" title="Stack" caption={`${skillsCount} tools`} />
					</BlurFade>
					<BlurFade delay={BLUR_FADE_DELAY * 14}>
						<p className="text-[15px] leading-loose text-foreground/85 flex flex-wrap gap-y-0">
							{DATA.skills.map((skill, i) => (
								<span key={skill} className="whitespace-nowrap">
									<span className="hover:text-[hsl(var(--accent))] transition-colors duration-200">
										{skill}
									</span>
									{i < DATA.skills.length - 1 && (
										<span className="text-muted-foreground/60 px-1.5">+</span>
									)}
								</span>
							))}
						</p>
					</BlurFade>
				</div>
			</section>

			{/* ───── projects ─────────────────────────────────────────── */}
			<section id="projects">
				<BlurFade delay={BLUR_FADE_DELAY * 15}>
					<SectionHeader
						index="05"
						title="Selected Work"
						caption={`${projectsCount} projects`}
					/>
				</BlurFade>
				<BlurFade delay={BLUR_FADE_DELAY * 16}>
					<p className="text-[15px] leading-relaxed text-foreground/70 max-w-[560px] mb-8">
						A handful of things I&apos;ve shipped — full-stack web apps,
						platforms, and a couple experiments. Click any card to learn more.
					</p>
				</BlurFade>
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{DATA.projects.map((project, id) => (
						<BlurFade
							key={project.title}
							delay={BLUR_FADE_DELAY * 17 + id * 0.04}
						>
							<ProjectCard
								index={String(id + 1).padStart(2, "0")}
								href={project.href}
								key={project.title}
								title={project.title}
								description={project.description}
								dates={project.dates}
								tags={project.technologies}
								image={project.image}
								video={project.video}
								links={project.links}
							/>
						</BlurFade>
					))}
				</div>
			</section>

			{/* ───── trainings ────────────────────────────────────────── */}
			<section id="hackathons">
				<BlurFade delay={BLUR_FADE_DELAY * 18}>
					<SectionHeader index="06" title="Trainings & Certifications" />
				</BlurFade>
				<BlurFade delay={BLUR_FADE_DELAY * 19}>
					<p className="text-[15px] leading-relaxed text-foreground/70 max-w-[560px] mb-8">
						After graduating, I joined training programs to deepen my software
						engineering and cloud computing fundamentals.
					</p>
				</BlurFade>
				<BlurFade delay={BLUR_FADE_DELAY * 20}>
					<ul className="ml-1.5 border-l border-border">
						{DATA.trainings.map((project, id) => (
							<BlurFade
								key={project.title + project.dates}
								delay={BLUR_FADE_DELAY * 21 + id * 0.05}
							>
								<HackathonCard
									title={project.title}
									description={project.description}
									location={project.location}
									dates={project.dates}
									image={project.image}
									links={project.links}
								/>
							</BlurFade>
						))}
					</ul>
				</BlurFade>
			</section>

			{/* ───── contact ──────────────────────────────────────────── */}
			<section id="contact">
				<BlurFade delay={BLUR_FADE_DELAY * 22}>
					<SectionHeader index="07" title="Contact" />
				</BlurFade>
				<BlurFade delay={BLUR_FADE_DELAY * 23}>
					<div className="grid sm:grid-cols-5 gap-6 items-start">
						<div className="sm:col-span-3 space-y-3">
							<h3 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] leading-tight">
								Have an idea? <br />
								<span className="text-[hsl(var(--accent))]">Let&apos;s build it.</span>
							</h3>
							<p className="text-[15px] leading-relaxed text-foreground/70 max-w-[420px]">
								Want to chat? Shoot me a DM{" "}
								<Link
									href={DATA.contact.social.X.url}
									className="link-underline text-foreground font-medium"
								>
									on Twitter
								</Link>{" "}
								or send an email. I&apos;ll respond whenever I can — I ignore
								all soliciting.
							</p>
						</div>
						<div className="sm:col-span-2 space-y-3 sm:border-l sm:border-border sm:pl-6">
							<div>
								<div className="eyebrow mb-1">Email</div>
								<Link
									href={`mailto:${DATA.contact.email}`}
									className="link-underline text-sm font-medium break-all"
								>
									{DATA.contact.email}
								</Link>
							</div>
							<div>
								<div className="eyebrow mb-1">Phone</div>
								<div className="text-sm font-medium tabular">
									{DATA.contact.phone}
								</div>
							</div>
							<div>
								<div className="eyebrow mb-1">Elsewhere</div>
								<div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
									{Object.entries(DATA.contact.social)
										.filter(([_, s]) => s.navbar)
										.map(([name, social]) => (
											<Link
												key={name}
												href={social.url}
												className="link-underline font-medium"
											>
												{name}
											</Link>
										))}
								</div>
							</div>
						</div>
					</div>
				</BlurFade>
			</section>

			{/* ───── colophon ─────────────────────────────────────────── */}
			<BlurFade delay={BLUR_FADE_DELAY * 24}>
				<footer className="pt-8 border-t border-border flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
					<span>© {new Date().getFullYear()} Marnel Valentin</span>
					<span className="hidden sm:inline">
						Set in Geist · Built with Next.js
					</span>
					<span>End of document</span>
				</footer>
			</BlurFade>
		</main>
	);
}
