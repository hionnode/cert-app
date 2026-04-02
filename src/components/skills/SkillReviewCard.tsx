import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
	beginner: "bg-primary-100 text-primary-700",
	intermediate: "bg-accent-gold/15 text-amber-700",
	advanced: "bg-red-100 text-red-700",
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
					? "border-primary-200 bg-primary-50/30"
					: isOpen
						? "border-secondary-300 bg-surface-0 shadow-sm"
						: "border-surface-3 bg-surface-0 hover:shadow-sm"
			}`}
			style={{ borderLeftWidth: "3px", borderLeftColor: domain?.color ?? "#ccc" }}
		>
			{/* Header */}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="w-full flex items-center gap-3 p-4 text-left cursor-pointer"
			>
				{allViewed && <CheckCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />}
				<span className={`badge-domain-${skill.domain} flex-shrink-0`}>{skill.id}</span>
				<span className={`text-sm flex-1 ${allViewed ? "text-ink-muted" : "text-ink"} ${!isOpen ? "line-clamp-1" : ""}`}>
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
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="px-4 pb-5 space-y-4">
							<p className="caption">Task {skill.taskId}: {skill.taskTitle}</p>
							<p className="body-text text-sm">{skill.description}</p>

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
													className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-button bg-surface-1 hover:bg-surface-2 text-xs text-ink-secondary hover:text-secondary-600 transition-colors"
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
					</motion.div>
				)}
			</AnimatePresence>
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
		<div className={`rounded-card border p-4 ${revealed ? "border-primary-200 bg-primary-50/20" : "border-surface-3 bg-surface-1"}`}>
			{/* Header */}
			<div className="flex items-center gap-2 mb-3">
				<span className={`badge text-[10px] ${difficultyStyles[scenario.difficulty] ?? "bg-surface-2 text-ink-muted"}`}>
					{scenario.difficulty}
				</span>
				{revealed && <CheckCircle className="w-4 h-4 text-primary-500" />}
			</div>

			{/* Question */}
			<p className="text-sm text-ink font-medium mb-3">{scenario.question}</p>

			{!revealed ? (
				<>
					{/* Think prompts */}
					{scenario.thinkPrompts?.length > 0 && (
						<div className="bg-secondary-50 border border-secondary-200 rounded-button p-3 mb-3">
							<div className="flex items-center gap-1.5 mb-1.5">
								<Lightbulb className="w-3.5 h-3.5 text-secondary-500" />
								<span className="text-xs font-semibold text-secondary-700">Think about</span>
							</div>
							<ul className="space-y-1">
								{scenario.thinkPrompts.map((p, i) => (
									<li key={i} className="text-xs text-secondary-700 flex items-start gap-1.5">
										<span className="text-secondary-400">&bull;</span>
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
				<motion.div
					initial={{ opacity: 0, y: 8 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-primary-50 border border-primary-200 rounded-button p-3"
				>
					<p className="text-xs font-semibold text-primary-700 mb-1.5">Answer</p>
					<p className="text-sm text-ink-secondary whitespace-pre-line">{scenario.answer}</p>
				</motion.div>
			)}
		</div>
	);
}
