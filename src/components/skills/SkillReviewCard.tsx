import { useState } from "react";
import {
	ChevronDown,
	Lightbulb,
	Eye,
	CheckCircle,
	ExternalLink,
	FileText,
	Newspaper,
	PlayCircle,
	Code,
	FlaskConical,
} from "lucide-react";
import { markSkillScenarioViewed } from "../../lib/progress";
import { useProgress } from "../../lib/hooks/use-progress";
import { DOMAINS } from "../../lib/constants";
import type { ExamSkill, SkillScenario } from "../../lib/types";

interface SkillReviewCardProps {
	skill: ExamSkill;
	compact?: boolean;
}

const difficultyStyles: Record<string, string> = {
	beginner: "bg-surface-2 text-accent-aqua",
	intermediate: "bg-surface-2 text-accent-yellow",
	advanced: "bg-surface-2 text-accent-red",
};

const resourceIcons: Record<string, typeof FileText> = {
	docs: FileText,
	blog: Newspaper,
	video: PlayCircle,
	github: Code,
	workshop: FlaskConical,
};

export default function SkillReviewCard({ skill, compact }: SkillReviewCardProps) {
	const { skillScenariosViewed } = useProgress();
	const viewed = skillScenariosViewed?.[skill.id] ?? [];
	const totalScenarios = skill.scenarios?.length ?? 0;
	const allViewed = totalScenarios > 0 && viewed.length >= totalScenarios;

	const [isOpen, setIsOpen] = useState(false);

	const domain = DOMAINS.find((d) => d.id === skill.domain);

	return (
		<div
			className={`rounded-card border transition-all overflow-hidden ${
				allViewed
					? "border-accent-aqua bg-surface-2"
					: isOpen
						? "border-accent-blue bg-surface-0"
						: "border-surface-3 bg-surface-0"
			}`}
			style={{ borderLeftWidth: "3px", borderLeftColor: domain?.color ?? "#ccc" }}
		>
			{/* Header */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
			>
				{allViewed && <CheckCircle className="w-5 h-5 text-accent-aqua flex-shrink-0" />}
				<span className={`badge-domain-${skill.domain} flex-shrink-0`}>{skill.id}</span>
				<span className={`body-sm flex-1 ${allViewed ? "text-ink-muted" : "text-ink"} ${!isOpen ? "line-clamp-1" : ""}`}>
					{skill.description}
				</span>
				{totalScenarios > 0 && (
					<span className="caption whitespace-nowrap flex-shrink-0">
						{viewed.length}/{totalScenarios}
					</span>
				)}
				<ChevronDown className={`w-4 h-4 text-ink-muted flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
			</button>

			{/* Expanded */}
			{isOpen && (
				<div className="overflow-hidden">
					<div className="px-5 pb-6 space-y-4">
						<p className="caption">Task {skill.taskId}: {skill.taskTitle}</p>
						<p className="body-sm">{skill.description}</p>

						{/* Scenarios */}
						{skill.scenarios?.length > 0 ? (
							<div className="space-y-4">
								{skill.scenarios.map((scenario, idx) => (
									<ScenarioMini
										key={`${skill.id}-s${idx}`}
										skillId={skill.id}
										scenario={scenario}
										index={idx}
										isViewed={viewed.includes(idx)}
									/>
								))}
							</div>
						) : (
							<p className="caption italic">No scenarios available for this skill yet.</p>
						)}

						{/* Resources */}
						{skill.resources?.length > 0 && (
							<div className="pt-2 border-t border-surface-3">
								<p className="caption font-semibold mb-2">Resources</p>
								<div className="flex flex-wrap gap-2">
									{skill.resources.map((res, i) => {
										const Icon = resourceIcons[res.type] ?? FileText;
										return (
											<a
												key={`${skill.id}-r${i}`}
												href={res.url}
												target="_blank"
												rel="noopener noreferrer"
												className="inline-flex items-center gap-1.5 px-3 py-2 rounded-button bg-surface-1 hover:bg-surface-2 caption-sm text-ink-secondary hover:text-accent-blue transition-colors"
											>
												<Icon className="w-3.5 h-3.5" />
												{res.title}
												<ExternalLink className="w-3 h-3" />
											</a>
										);
									})}
								</div>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// Mini scenario component with think-first reveal
function ScenarioMini({
	skillId,
	scenario,
	index,
	isViewed,
}: {
	skillId: string;
	scenario: SkillScenario;
	index: number;
	isViewed: boolean;
}) {
	const [revealed, setRevealed] = useState(isViewed);

	function handleReveal() {
		setRevealed(true);
		markSkillScenarioViewed(skillId, index);
	}

	return (
		<div className={`rounded-card border p-5 ${revealed ? "border-accent-aqua bg-surface-2" : "border-surface-3 bg-surface-1"}`}>
			{/* Header */}
			<div className="flex items-center gap-2 mb-3">
				<span className={`badge ${difficultyStyles[scenario.difficulty] ?? "bg-surface-2 text-ink-muted"}`}>
					{scenario.difficulty}
				</span>
				{revealed && <CheckCircle className="w-4 h-4 text-accent-aqua" />}
			</div>

			{/* Question */}
			<p className="body-sm text-ink font-medium mb-3">{scenario.question}</p>

			{!revealed ? (
				<>
					{/* Think prompts */}
					{scenario.thinkPrompts?.length > 0 && (
						<div className="bg-surface-2 border border-accent-blue rounded-button p-3 mb-3">
							<div className="flex items-center gap-1.5 mb-1.5">
								<Lightbulb className="w-3.5 h-3.5 text-accent-blue" />
								<span className="caption-sm font-semibold text-accent-blue">Think about</span>
							</div>
							<ul className="space-y-1">
								{scenario.thinkPrompts.map((p, i) => (
									<li key={i} className="caption-sm text-accent-blue flex items-start gap-1.5">
										<span className="text-accent-blue/50">&bull;</span>
										{p}
									</li>
								))}
							</ul>
						</div>
					)}

					<button type="button" onClick={handleReveal} className="btn-primary text-sm w-full justify-center">
						<Eye className="w-4 h-4" /> Reveal Answer
					</button>
				</>
			) : (
				<div className="bg-surface-2 border border-accent-aqua rounded-button p-3">
					<p className="caption-sm font-semibold text-accent-aqua mb-1.5">Answer</p>
					<p className="body-sm whitespace-pre-line">{scenario.answer}</p>
				</div>
			)}
		</div>
	);
}
