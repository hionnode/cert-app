import { useState } from "react";
import {
	CheckCircle,
	Eye,
	Lightbulb,
	ExternalLink,
	FileText,
	Newspaper,
	PlayCircle,
	Code,
	FlaskConical,
	BookOpen,
	ArrowRight,
} from "lucide-react";
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
						{/* Skill header */}
						<div className="flex items-center gap-2 mb-2">
							<span className={`badge-domain-${skill.domain}`}>
								{skill.id}
							</span>
							<span className="caption">
								Task {skill.taskId}: {skill.taskTitle}
							</span>
							{isSkillDone(skill) && (
								<CheckCircle className="w-5 h-5 text-accent-aqua ml-auto" />
							)}
						</div>

						{/* Skill description — the core "what you need to know" */}
						<p className="body-text mb-6">{skill.description}</p>

						{/* Scenarios — the deep dive */}
						{skill.scenarios?.length > 0 && (
							<div className="space-y-4 mb-6">
								<div className="flex items-center gap-2">
									<BookOpen className="w-4 h-4 text-accent-blue" />
									<p className="caption font-semibold">
										Deep Dive — {viewed.length}/
										{skill.scenarios.length} explored
									</p>
								</div>
								{skill.scenarios.map((scenario, idx) => (
									<SkillScenarioCard
										key={`${skill.id}-s${idx}`}
										skillId={skill.id}
										skill={skill}
										scenario={scenario}
										index={idx}
										isViewed={viewed.includes(idx)}
									/>
								))}
							</div>
						)}

						{/* Resources — curated learning links */}
						{skill.resources?.length > 0 && (
							<div className="border-t border-surface-3 pt-4">
								<div className="flex items-center gap-2 mb-3">
									<ExternalLink className="w-4 h-4 text-accent-blue" />
									<p className="caption font-semibold">
										Go Deeper
									</p>
								</div>
								<div className="space-y-2">
									{skill.resources.map((res, i) => {
										const Icon =
											resourceIcons[res.type] ?? FileText;
										return (
											<a
												key={`${skill.id}-r${i}`}
												href={res.url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-3 p-3 rounded-card bg-surface-0 border border-surface-3 hover:border-accent-blue hover:bg-surface-1 transition-colors group"
											>
												<div className="w-8 h-8 rounded-sm bg-surface-2 flex items-center justify-center shrink-0 group-hover:bg-accent-blue/10 transition-colors">
													<Icon className="w-4 h-4 text-ink-secondary group-hover:text-accent-blue transition-colors" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="body-sm font-semibold group-hover:text-accent-aqua transition-colors">
														{res.title}
													</p>
													<p className="caption-sm">
														{res.type === "docs"
															? "AWS Documentation"
															: res.type === "blog"
																? "AWS Blog Post"
																: res.type ===
																	  "video"
																	? "Video Tutorial"
																	: res.type ===
																		  "github"
																		? "GitHub Repository"
																		: "Workshop"}
													</p>
												</div>
												<ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-accent-blue shrink-0 transition-colors" />
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
						{viewed.length}/{total} explored
					</span>
				);
			}}
		/>
	);
}

function SkillScenarioCard({
	skillId,
	skill,
	scenario,
	index,
	isViewed,
}: {
	skillId: string;
	skill: ExamSkill;
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
		<div
			className={`rounded-card border overflow-hidden ${revealed ? "border-accent-aqua" : "border-surface-3"}`}
		>
			{/* Question section */}
			<div
				className={`p-5 ${revealed ? "bg-surface-1" : "bg-surface-1"}`}
			>
				<div className="flex items-center gap-2 mb-3">
					<span
						className={`badge ${difficultyStyles[scenario.difficulty] ?? "bg-surface-2 text-ink-muted"}`}
					>
						{scenario.difficulty}
					</span>
					{revealed && (
						<CheckCircle className="w-4 h-4 text-accent-aqua" />
					)}
				</div>
				<p className="body-sm text-ink font-medium">
					{scenario.question}
				</p>
			</div>

			{!revealed ? (
				<div className="p-5 pt-0 bg-surface-1">
					{/* Think prompts */}
					{scenario.thinkPrompts?.length > 0 && (
						<div className="bg-surface-2 border border-accent-blue rounded-card p-4 mb-4 mt-4">
							<div className="flex items-center gap-1.5 mb-2">
								<Lightbulb className="w-4 h-4 text-accent-blue" />
								<span className="caption font-semibold text-accent-blue">
									Think about
								</span>
							</div>
							<ul className="space-y-1.5">
								{scenario.thinkPrompts.map((p, i) => (
									<li
										key={i}
										className="caption-sm text-accent-blue flex items-start gap-1.5"
									>
										<span className="text-accent-blue/50">
											&bull;
										</span>
										{p}
									</li>
								))}
							</ul>
						</div>
					)}

					<button
						type="button"
						onClick={handleReveal}
						className="btn-primary text-sm w-full justify-center"
					>
						<Eye className="w-4 h-4" /> Reveal Answer
					</button>
				</div>
			) : (
				/* Revealed: rich answer with context */
				<div className="bg-surface-0">
					{/* Answer */}
					<div className="p-5 border-t border-accent-aqua/30">
						<div className="flex items-center gap-2 mb-3">
							<CheckCircle className="w-4 h-4 text-accent-aqua" />
							<span className="caption font-semibold text-accent-aqua">
								Answer
							</span>
						</div>
						<p className="body-text whitespace-pre-line leading-relaxed">
							{scenario.answer}
						</p>
					</div>

					{/* Why this matters — contextual insight */}
					<div className="px-5 pb-5">
						<div className="bg-accent-aqua/5 border border-accent-aqua/20 rounded-card p-4">
							<div className="flex items-center gap-2 mb-2">
								<Lightbulb className="w-4 h-4 text-accent-aqua" />
								<span className="caption font-semibold text-accent-aqua">
									Exam Insight
								</span>
							</div>
							<p className="caption-sm text-ink-secondary">
								This skill maps to{" "}
								<span className="text-accent-aqua font-semibold">
									{skill.id}
								</span>{" "}
								in the exam guide. Look for keywords like "
								{scenario.thinkPrompts?.[0]
									?.toLowerCase()
									.replace("?", "") ?? skill.taskTitle.toLowerCase()}
								" in exam questions — they signal this pattern.
							</p>
						</div>

						{/* Inline resources for this specific topic */}
						{skill.resources?.length > 0 && (
							<div className="mt-4 flex flex-wrap gap-2">
								{skill.resources.slice(0, 3).map((res, i) => {
									const Icon =
										resourceIcons[res.type] ?? FileText;
									return (
										<a
											key={`inline-${skillId}-r${i}`}
											href={res.url}
											target="_blank"
											rel="noopener noreferrer"
											className="inline-flex items-center gap-1.5 px-3 py-2 rounded-button bg-surface-1 border border-surface-3 hover:border-accent-blue hover:bg-surface-2 caption-sm text-ink-secondary hover:text-accent-blue transition-colors"
										>
											<Icon className="w-3.5 h-3.5" />
											{res.title}
											<ArrowRight className="w-3 h-3" />
										</a>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
