import { DATA } from "@/data/resume";

export interface FighterStat {
	label: string;
	value: number;
}

export interface Fighter {
	index: number;
	name: string;
	title: string;
	description: string;
	technologies: string[];
	stats: FighterStat[];
	stage: string;
	demoUrl: string | null;
	repoUrl: string | null;
	image: string | null;
}

const STAGES = ["NEON DOJO", "DATA TEMPLE", "THE STACK", "SHIP YARD", "EDGE ARENA"];

// Deterministic 40-100 "power" from a string so stats are stable per build.
function powerFor(seed: string): number {
	let h = 0;
	for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
	return 40 + (Math.abs(h) % 61);
}

export function getFighters(): Fighter[] {
	return DATA.projects.map((p, index) => {
		const technologies = p.technologies ?? [];
		const stats = technologies.slice(0, 4).map((t) => ({
			label: t.toUpperCase(),
			value: powerFor(t + p.title),
		}));
		const repo = p.links?.find((l) => /source|github/i.test(l.type))?.href || null;
		const demo =
			p.links?.find((l) => /web|site|live|demo/i.test(l.type))?.href ||
			(p.href ? p.href : null);
		return {
			index,
			name: p.title.toUpperCase(),
			title: p.title,
			description: p.description ?? "",
			technologies,
			stats: stats.length ? stats : [{ label: "FULL STACK", value: 70 }],
			stage: STAGES[index % STAGES.length],
			demoUrl: demo,
			repoUrl: repo,
			image: p.image || null,
		};
	});
}
