import { useState } from "react";
import { CheckCircle, Eye, Lightbulb, ExternalLink, FileText, Newspaper, PlayCircle, Code, FlaskConical } from "lucide-react";
import ItemStepper from "../shared/ItemStepper";
import { markSkillScenarioViewed } from "../../lib/progress";
import { useProgress } from "../../lib/hooks/use-progress";
import { DOMAINS } from "../../lib/constants";
import type { ExamSkill, SkillScenario } from "../../lib/types";

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

interface SkillStepperProps {
	skills: ExamSkill[];
}

export default function SkillStepper({ skills }: SkillStepperProps) {
	const { skillScenariosViewed } = useProgress();

	const isSkillDone = (skill: ExamSkill) => {
		const viewed = skillScenariosViewed?.[skill.id] ?? [];
		const total = skill.scenarios?.length ?? 0;
		return total === 0 || viewed.length >= total;
	};

	const [currentIndex, setCurrentIndex] = useState(() => {
		const first = skills.findIndex((s) => !isSkillDone(s));
		return first >= 0 ? first : 0;
	});

	const totalDone = skills.filter(isSkillDone).length;

	return (
		<ItemStepper
			items={skills}
			getKey={(s) => s.id}
			isDone={isSkillDone}
			currentIndex={currentIndex}
			onNavigate={setCurrentIndex}
			itemLabel="Skill"
			totalDone={totalDone}
			renderItem={(skill) => {
				const domain = DOMAINS.find((d) => d.id === skill.domain);
				const viewed = skillScenariosViewed?.[skill.id] ?? [];

				return (
					<>
						<div className="flex items-center gap-2 mb-3">
							<span className={`badge-domain-${skill.domain}`}>{skill.id}</span>
							{isSkillDone(skill) && <CheckCircle className="w-5 h-5 text-accent-aqua" />}
						</div>
						<p className="caption mb-2">Task {skill.taskId}: {skill.taskTitle}</p>
						<p className="body-text mb-4">{skill.description}</p>

						{/* Scenarios within this skill */}
						{skill.scenarios?.length > 0 && (
							<div className="space-y-3 mb-4">
								<p className="caption font-semibold">{viewed.length}/{skill.scenarios.length} scenarios viewed</p>
								{skill.scenarios.map((scenario, idx) => (
									<SkillScenarioCard
										key={`${skill.id}-s${idx}`}
										skillId={skill.id}
										scenario={scenario}
										index={idx}
										isViewed={viewed.includes(idx)}
									/>
								))}
							</div>
						)}

						{/* Resources */}
						{skill.resources?.length > 0 && (
							<div className="pt-3 border-t border-surface-3">
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
												<Icon className="w-4 h-4" />
												{res.title}
												<ExternalLink className="w-3 h-3" />
											</a>
										);
									})}
								</div>
							</div>
						)}
					</>
				);
			}}
			renderActions={(skill) => {
				const viewed = skillScenariosViewed?.[skill.id] ?? [];
				const total = skill.scenarios?.length ?? 0;
				if (total === 0) return null;
				return (
					<span className="caption">
						{viewed.length}/{total} scenarios
					</span>
				);
			}}
		/>
	);
}

function SkillScenarioCard({
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
		<div className={`rounded-card border p-4 ${revealed ? "border-accent-aqua bg-surface-2" : "border-surface-3 bg-surface-1"}`}>
			<div className="flex items-center gap-2 mb-3">
				<span className={`badge ${difficultyStyles[scenario.difficulty] ?? "bg-surface-2 text-ink-muted"}`}>
					{scenario.difficulty}
				</span>
				{revealed && <CheckCircle className="w-4 h-4 text-accent-aqua" />}
			</div>
			<p className="body-sm text-ink font-medium mb-3">{scenario.question}</p>

			{!revealed ? (
				<>
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
