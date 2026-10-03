import { LensPill } from "@/components/lens/lens-pill";
import { Dock, DockIcon } from "@/components/magicui/dock";
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

const iconLink = cn(
	buttonVariants({ variant: "ghost", size: "icon" }),
	"size-10 rounded-full"
);

export default function Navbar() {
	return (
		<div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 mx-auto mb-5 flex origin-bottom h-full max-h-14">
			{/* fade behind the dock */}
			<div className="fixed bottom-0 inset-x-0 h-24 w-full pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent" />

			<Dock className="z-50 pointer-events-auto relative mx-auto flex min-h-full h-full items-center px-1.5 gap-0.5 bg-dock/90 backdrop-blur-md border border-border rounded-full [box-shadow:0_12px_32px_-14px_rgba(0,0,0,.35)] transition-colors duration-500">
				{DATA.navbar.map((item) => (
					<DockIcon key={item.href}>
						<Tooltip>
							<TooltipTrigger asChild>
								<Link href={item.href} aria-label={item.label} className={iconLink}>
									<item.icon className="size-4" />
								</Link>
							</TooltipTrigger>
							<TooltipContent>
								<p className="text-xs">{item.label}</p>
							</TooltipContent>
						</Tooltip>
					</DockIcon>
				))}
				<LensPill />
				<Separator orientation="vertical" className="h-5 mx-1" />
				{Object.entries(DATA.contact.social)
					.filter(([_, social]) => social.navbar)
					.map(([name, social], i, all) => (
						// the last icon drops out below 360px so the dock fits the screen
						<DockIcon
							key={name}
							className={i === all.length - 1 ? "max-[359px]:hidden" : undefined}
						>
							<Tooltip>
								<TooltipTrigger asChild>
									<Link href={social.url} aria-label={name} className={iconLink}>
										<social.icon className="size-4" />
									</Link>
								</TooltipTrigger>
								<TooltipContent>
									<p className="text-xs">{name}</p>
								</TooltipContent>
							</Tooltip>
						</DockIcon>
					))}
			</Dock>
		</div>
	);
}
