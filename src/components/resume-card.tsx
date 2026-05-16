"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

interface ResumeCardProps {
	logoUrl: string;
	altText: string;
	title: string;
	subtitle?: string;
	href?: string;
	badges?: readonly string[];
	period: string;
	description?: string;
}

export const ResumeCard = ({
	logoUrl,
	altText,
	title,
	subtitle,
	href,
	badges,
	period,
	description,
}: ResumeCardProps) => {
	const [isExpanded, setIsExpanded] = React.useState(false);

	const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
		if (description) {
			e.preventDefault();
			setIsExpanded(!isExpanded);
		}
	};

	return (
		<Link
			href={href || "#"}
			className="group block cursor-pointer border-b border-border last:border-b-0 py-4 first:pt-0 transition-colors hover:bg-muted/30 -mx-2 px-2"
			onClick={handleClick}
		>
			<div className="flex items-start gap-4">
				<div className="flex-none pt-0.5">
					<Avatar className="size-10 ring-1 ring-border bg-background">
						<AvatarImage
							src={logoUrl}
							alt={altText}
							className="object-contain p-1"
						/>
						<AvatarFallback>{altText[0]}</AvatarFallback>
					</Avatar>
				</div>
				<div className="flex-grow min-w-0">
					<div className="flex items-baseline justify-between gap-x-3">
						<h3 className="font-semibold tracking-tight text-sm sm:text-[15px] truncate flex items-center gap-1.5">
							{title}
							{badges && badges.length > 0 && (
								<span className="inline-flex gap-x-1">
									{badges.map((badge, index) => (
										<Badge
											variant="secondary"
											className="align-middle text-[10px] font-mono uppercase tracking-wider rounded-sm"
											key={index}
										>
											{badge}
										</Badge>
									))}
								</span>
							)}
						</h3>
						<div className="font-mono text-[10px] uppercase tracking-[0.12em] tabular text-muted-foreground text-right shrink-0">
							{period}
						</div>
					</div>
					{subtitle && (
						<div className="font-sans text-[13px] text-muted-foreground mt-0.5">
							{subtitle}
						</div>
					)}
					{description && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{
								opacity: isExpanded ? 1 : 0,
								height: isExpanded ? "auto" : 0,
							}}
							transition={{
								duration: 0.55,
								ease: [0.16, 1, 0.3, 1],
							}}
							className="overflow-hidden text-[13px] leading-relaxed text-foreground/80"
						>
							<div className="pt-2 pl-3 border-l-2 border-[hsl(var(--accent))] mt-2">
								{description}
							</div>
						</motion.div>
					)}
				</div>
				{description && (
					<div className="shrink-0 pt-1">
						<Plus
							className={cn(
								"size-3.5 text-muted-foreground transition-transform duration-300 ease-out",
								isExpanded && "rotate-45"
							)}
						/>
					</div>
				)}
			</div>
		</Link>
	);
};
