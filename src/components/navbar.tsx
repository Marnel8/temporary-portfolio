import { Dock, DockIcon } from "@/components/magicui/dock";
import { ModeToggle } from "@/components/mode-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Navbar() {
	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-5 flex origin-bottom h-full max-h-14">
			{/* gradient fade behind dock */}
			<div className="fixed bottom-0 inset-x-0 h-24 w-full pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent" />

			<Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1.5 gap-0.5 bg-background/90 backdrop-blur-md border border-border rounded-full [box-shadow:0_1px_2px_rgba(0,0,0,.04),0_8px_24px_rgba(0,0,0,.06)] dark:[box-shadow:0_1px_0_rgba(255,255,255,.04)_inset,0_8px_24px_rgba(0,0,0,.4)]">
				{DATA.navbar.map((item) => (
					<DockIcon key={item.href}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link
									href={item.href}
									className={cn(
										buttonVariants({ variant: "ghost", size: "icon" }),
										"size-10 rounded-full group hover:[&_svg]:brightness-0 hover:[&_svg]:invert"
									)}
								>
									<item.icon className="size-4" />
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p className="font-mono text-[10px] uppercase tracking-[0.12em]">
									{item.label}
								</p>
							</TooltipContent>
						</Tooltip>
					</DockIcon>
				))}
				<Separator orientation="vertical" className="h-5 mx-1" />
				{Object.entries(DATA.contact.social)
					.filter(([_, social]) => social.navbar)
					.map(([name, social]) => (
						<DockIcon key={name}>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link
										href={social.url}
										className={cn(
											buttonVariants({ variant: "ghost", size: "icon" }),
											"size-10 rounded-full group hover:[&_svg]:brightness-0 hover:[&_svg]:invert"
										)}
									>
										<social.icon className="size-4" />
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									<p className="font-mono text-[10px] uppercase tracking-[0.12em]">
										{name}
									</p>
								</TooltipContent>
							</Tooltip>
						</DockIcon>
					))}
				<Separator orientation="vertical" className="h-5 mx-1" />
				<DockIcon>
					<Tooltip>
						<TooltipTrigger asChild>
							<ModeToggle />
						</TooltipTrigger>
						<TooltipContent>
							<p className="font-mono text-[10px] uppercase tracking-[0.12em]">
								Theme
							</p>
						</TooltipContent>
					</Tooltip>
				</DockIcon>
			</Dock>
		</div>
	);
}
