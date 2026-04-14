import { useState } from "react";
import {
	CheckCircle,
	FileText,
	Newspaper,
	PlayCircle,
	Code,
	FlaskConical,
	ChevronRight,
} from "lucide-react";
import ItemStepper from "../shared/ItemStepper";
import { markSkillScenarioViewed } from "../../lib/progress";
import { useProgress } from "../../lib/hooks/use-progress";
import type { ExamSkill, SkillScenario, ExamSkillResource } from "../../lib/types";

const difficultyColor: Record<string, string> = {
	beginner: "text-accent-aqua",
	intermediate: "text-accent-yellow",
	advanced: "text-accent-red",
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
				const viewed = skillScenariosViewed?.[skill.id] ?? [];
				const done = isSkillDone(skill);

				return (
					<>
						{/* Header — single line */}
						<div className="flex items-baseline gap-3 mb-2">
							<span className={`badge-domain-${skill.domain}`}>
								{skill.id}
							</span>
							<span className="caption-sm flex-1 min-w-0 truncate">
								Task {skill.taskId} · {skill.taskTitle}
							</span>
							{done && (
								<CheckCircle className="w-4 h-4 text-accent-aqua shrink-0 self-center" />
							)}
						</div>

						{/* Description */}
						<p className="body-text mb-4">{skill.description}</p>

						{/* Inline references */}
						{skill.resources?.length > 0 && (
							<ReferenceRow resources={skill.resources} />
						)}

						{/* Scenarios — flat, divider-separated */}
						{skill.scenarios?.length > 0 && (
							<div className="mt-6">
								{skill.scenarios.map((scenario, idx) => (
									<SkillScenarioBlock
										key={`${skill.id}-s${idx}`}
										skillId={skill.id}
										scenario={scenario}
										index={idx}
										initiallyOpen={viewed.includes(idx)}
									/>
								))}
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
						{viewed.length}/{total} explored
					</span>
				);
			}}
		/>
	);
}

function ReferenceRow({ resources }: { resources: ExamSkillResource[] }) {
	return (
		<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 caption-sm">
			<span className="text-ink-muted">References</span>
			{resources.map((res, i) => {
				const Icon = resourceIcons[res.type] ?? FileText;
				return (
					<a
						key={`ref-${i}`}
						href={res.url}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-accent-blue transition-colors"
					>
						<Icon className="w-3.5 h-3.5 shrink-0" />
						<span className="underline-offset-2 group-hover:underline">
							{res.title}
						</span>
					</a>
				);
			})}
		</div>
	);
}

function SkillScenarioBlock({
	skillId,
	scenario,
	index,
	initiallyOpen,
}: {
	skillId: string;
	scenario: SkillScenario;
	index: number;
	initiallyOpen: boolean;
}) {
	const [viewed, setViewed] = useState(initiallyOpen);

	function handleToggle(e: React.SyntheticEvent<HTMLDetailsElement>) {
		if (e.currentTarget.open && !viewed) {
			setViewed(true);
			markSkillScenarioViewed(skillId, index);
		}
	}

	const prompts = scenario.thinkPrompts ?? [];
	const difficulty = scenario.difficulty;

	return (
		<div className="border-t border-surface-3 py-5 first:border-t-0 first:pt-0">
			{/* Question */}
			<div className="flex items-baseline gap-3 mb-2">
				<span
					className={`caption-sm uppercase tracking-wider ${difficultyColor[difficulty] ?? "text-ink-muted"}`}
				>
					{difficulty}
				</span>
				{viewed && (
					<CheckCircle className="w-3.5 h-3.5 text-accent-aqua self-center" />
				)}
			</div>
			<p className="body-text text-ink font-medium mb-2">
				{scenario.question}
			</p>

			{/* Think prompts — single inline line */}
			{prompts.length > 0 && (
				<p className="caption-sm text-ink-muted italic mb-3">
					Consider: {prompts.join(" · ")}
				</p>
			)}

			{/* Disclosure */}
			<details
				open={initiallyOpen}
				onToggle={handleToggle}
				className="group mt-2"
			>
				<summary className="caption inline-flex items-center gap-1 text-accent-blue hover:text-accent-aqua transition-colors cursor-pointer list-none select-none [&::-webkit-details-marker]:hidden">
					<ChevronRight className="w-3.5 h-3.5 transition-transform group-open:rotate-90" />
					<span className="group-open:hidden">Show answer</span>
					<span className="hidden group-open:inline">Hide answer</span>
				</summary>
				<div className="mt-3 pl-4 border-l border-surface-3">
					<p className="body-text text-ink whitespace-pre-line leading-relaxed">
						{scenario.answer}
					</p>
				</div>
			</details>
		</div>
	);
}
