import { useEffect } from "react";
import { AlertTriangle, Clock, Target } from "lucide-react";
import { markSummaryViewed } from "../../lib/progress";
import type { StepSummary, StepSummaryConcept } from "../../lib/types";

interface SummarySectionProps {
	summary: StepSummary;
	stepNumber: number;
	domain: number;
}

const accentDot: Record<NonNullable<StepSummaryConcept["accent"]>, string> = {
	aqua: "bg-accent-aqua",
	yellow: "bg-accent-yellow",
	orange: "bg-accent-orange",
	blue: "bg-accent-blue",
	purple: "bg-accent-purple",
};

export default function SummarySection({
	summary,
	stepNumber,
	domain,
}: SummarySectionProps) {
	useEffect(() => {
		markSummaryViewed(stepNumber);
	}, [stepNumber]);

	const paragraphs = summary.howItWorks
		.split(/\n\n+/)
		.map((p) => p.trim())
		.filter(Boolean);

	return (
		<article className="max-w-[820px]">
			{/* TL;DR lede */}
			<div className="flex items-baseline gap-3 mb-2 flex-wrap">
				<span className="badge bg-surface-2 text-accent-aqua uppercase tracking-wider shrink-0">
					TL;DR
				</span>
				<p className="body-text text-ink flex-1 min-w-0">{summary.tldr}</p>
			</div>

			{/* Meta row */}
			<div className="flex items-center gap-4 caption mb-8">
				<span className="inline-flex items-center gap-1.5">
					<Clock className="w-3.5 h-3.5" /> {summary.readMinutes} min read
				</span>
			</div>

			{/* Key concepts */}
			{summary.keyConcepts.length > 0 && (
				<div className="card p-5 mb-8">
					<h3 className="caption uppercase tracking-wider text-ink-muted mb-4">
						Key concepts
					</h3>
					<ul className="space-y-3">
						{summary.keyConcepts.map((c) => {
							const dotClass = c.accent
								? accentDot[c.accent]
								: `bg-domain-${domain}`;
							return (
								<li key={c.term} className="flex items-baseline gap-3">
									<span
										className={`w-1.5 h-1.5 rounded-full ${dotClass} mt-2 shrink-0`}
										aria-hidden
									/>
									<div className="flex-1 min-w-0">
										<span className="body-text text-ink font-semibold">
											{c.term}
										</span>
										<span className="body-text text-ink-secondary">
											{" "}
											— {c.definition}
										</span>
									</div>
								</li>
							);
						})}
					</ul>
				</div>
			)}

			{/* Narrative */}
			{paragraphs.length > 0 && (
				<div className="space-y-5 mb-8">
					<h3 className="heading-3">How it works</h3>
					{paragraphs.map((p, i) => (
						<p key={i} className="body-text">
							{p}
						</p>
					))}
				</div>
			)}

			{/* Diagrams */}
			{summary.diagrams.length > 0 && (
				<div className="space-y-6 mb-8">
					{summary.diagrams.map((d) => (
						<figure key={d.id}>
							<figcaption className="caption uppercase tracking-wider text-ink-muted mb-2">
								{d.title}
							</figcaption>
							<pre
								className="ascii-diagram"
								role="img"
								aria-label={d.alt}
							>
								{d.ascii}
							</pre>
							{d.caption && (
								<p className="caption italic text-ink-muted mt-2">
									{d.caption}
								</p>
							)}
						</figure>
					))}
				</div>
			)}

			{/* Gotchas */}
			{summary.gotchas.length > 0 && (
				<div
					role="note"
					aria-label="Gotchas"
					className="border-l-2 border-accent-orange bg-surface-1 pl-4 pr-5 py-4 rounded-r-card mb-4"
				>
					<div className="flex items-center gap-2 mb-3">
						<AlertTriangle className="w-4 h-4 text-accent-orange" />
						<span className="caption uppercase tracking-wider text-accent-orange">
							Gotchas
						</span>
					</div>
					<ul className="space-y-3">
						{summary.gotchas.map((g, i) => (
							<li key={i} className="body-text">
								<span className="text-ink font-medium">{g.trap}</span>{" "}
								<span className="text-ink-secondary">
									{g.correction}
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			{/* Exam hooks */}
			{summary.examHooks.length > 0 && (
				<div
					role="note"
					aria-label="Exam hooks"
					className="border-l-2 border-accent-purple bg-surface-1 pl-4 pr-5 py-4 rounded-r-card"
				>
					<div className="flex items-center gap-2 mb-3">
						<Target className="w-4 h-4 text-accent-purple" />
						<span className="caption uppercase tracking-wider text-accent-purple">
							Exam hooks
						</span>
					</div>
					<ul className="space-y-2">
						{summary.examHooks.map((h, i) => (
							<li
								key={i}
								className="body-text grid grid-cols-[1fr_auto_1fr] gap-3 items-baseline"
							>
								<span className="text-ink-secondary italic">
									{h.trigger}
								</span>
								<span
									className="text-accent-purple caption"
									aria-hidden
								>
									→
								</span>
								<span className="text-ink font-medium">{h.pointsTo}</span>
							</li>
						))}
					</ul>
				</div>
			)}
		</article>
	);
}
