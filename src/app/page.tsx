import { Hero } from "@/components/lens/hero";
import {
	AboutSection,
	ContactSection,
	EducationSection,
	ExperienceSection,
	ProjectsSection,
	ToolsSection,
	TrainingSection,
} from "@/components/lens/sections";

// Layout only. All copy lives in src/data/resume.tsx (DATA); the lens sections
// swap their content when the visitor changes between software and data & AI.
export default function Page() {
	return (
		<main className="flex min-h-[100dvh] flex-col gap-16 sm:gap-[72px]">
			<Hero />
			<ToolsSection />
			<ProjectsSection />
			<ExperienceSection />
			<EducationSection />
			<TrainingSection />
			<AboutSection />
			<ContactSection />
		</main>
	);
}
