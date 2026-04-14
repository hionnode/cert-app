import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import TaskView from "./TaskView";
import HandsOnStepper from "./HandsOnStepper";
import ScenarioStepper from "../scenarios/ScenarioStepper";
import SkillStepper from "../skills/SkillStepper";
import DayPractice from "../practice/DayPractice";
import { useProgress } from "../../lib/hooks/use-progress";
import { getStepProgress } from "../../lib/progress";
import type {
	StudyDay,
	Scenario,
	ExamSkill,
	PracticeQuestion,
	FurtherReadingItem,
} from "../../lib/types";

interface Section {
	id: string;
	label: string;
	body: ReactNode;
	isDone: () => boolean;
}

interface StepFocusProps {
	day: StudyDay;
	domainName: string;
	scenarios: Scenario[];
	skills: ExamSkill[];
	practice: PracticeQuestion[];
	prevStep: number | null;
	nextStep: number | null;
	isLast: boolean;
}

const FURTHER_READING_ICONS: Record<string, string> = {
	blog: "i-lucide-newspaper",
	video: "i-lucide-play-circle",
	docs: "i-lucide-file-text",
	github: "i-lucide-code",
	workshop: "i-lucide-flask-conical",
};

export default function StepFocus({
	day,
	domainName,
	scenarios,
	skills,
	practice,
	prevStep,
	nextStep,
	isLast,
}: StepFocusProps) {
	const progress = useProgress();
	const stepProgress = useMemo(
		() => getStepProgress(day, progress, scenarios, skills),
		[day, progress, scenarios, skills],
	);

	const sections = useMemo<Section[]>(() => {
		const out: Section[] = [];
		if (day.learningObjectives?.length > 0) {
			out.push({
				id: "objectives",
				label: "What you'll learn",
				isDone: () => true,
				body: (
					<ul className="space-y-3">
						{day.learningObjectives.map((obj) => (
							<li
								key={obj}
								className="flex items-start gap-3 body-text text-ink-secondary"
							>
								<span className="text-accent-aqua mt-1">—</span>
								<span>{obj}</span>
							</li>
						))}
					</ul>
				),
			});
		}

		out.push({
			id: "tasks",
			label: "Tasks",
			isDone: () =>
				stepProgress.tasks.total > 0 &&
				stepProgress.tasks.done >= stepProgress.tasks.total,
			body: <TaskView tasks={day.tasks} stepNumber={day.number} />,
		});

		if (scenarios.length > 0) {
			out.push({
				id: "scenarios",
				label: "Scenarios",
				isDone: () =>
					stepProgress.scenarios.total > 0 &&
					stepProgress.scenarios.done >= stepProgress.scenarios.total,
				body: <ScenarioStepper scenarios={scenarios} />,
			});
		}

		if (day.handsOn && day.handsOn.length > 0) {
			out.push({
				id: "handson",
				label: "Hands-On Lab",
				isDone: () =>
					stepProgress.handsOn.total > 0 &&
					stepProgress.handsOn.done >= stepProgress.handsOn.total,
				body: <HandsOnStepper activities={day.handsOn} />,
			});
		}

		if (practice.length > 0) {
			out.push({
				id: "practice",
				label: "Practice Questions",
				isDone: () => false,
				body: <DayPractice questions={practice} dayNumber={day.number} />,
			});
		}

		if (skills.length > 0) {
			out.push({
				id: "skills",
				label: "Exam Skills Deep Dive",
				isDone: () =>
					stepProgress.skills.total > 0 &&
					stepProgress.skills.done >= stepProgress.skills.total,
				body: (
					<>
						<p className="caption mb-4">
							Each skill maps directly to the exam guide.
						</p>
						<SkillStepper skills={skills} />
					</>
				),
			});
		}

		if (day.spacedRepetitionReview && day.spacedRepetitionReview.length > 0) {
			out.push({
				id: "review",
				label: "Spaced Repetition",
				isDone: () => true,
				body: (
					<ul className="space-y-3">
						{day.spacedRepetitionReview.map((topic) => (
							<li
								key={topic}
								className="flex items-start gap-3 body-text"
							>
								<span className="text-accent-yellow mt-1">—</span>
								<span>{topic}</span>
							</li>
						))}
					</ul>
				),
			});
		}

		if (day.furtherReading && day.furtherReading.length > 0) {
			out.push({
				id: "reading",
				label: "Further Reading",
				isDone: () => true,
				body: <FurtherReadingGrid items={day.furtherReading} />,
			});
		}

		return out;
	}, [day, scenarios, skills, practice, stepProgress]);

	const storageKey = `focus-section-${day.number}`;
	// Init to 0 deterministically so SSR and first client render match.
	// We hydrate the real position from localStorage after mount.
	const [currentIndex, setCurrentIndex] = useState(0);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const saved = localStorage.getItem(storageKey);
		if (saved !== null) {
			const parsed = Number(saved);
			if (!Number.isNaN(parsed) && parsed >= 0 && parsed < sections.length) {
				setCurrentIndex(parsed);
				setHydrated(true);
				return;
			}
		}
		const firstUndone = sections.findIndex((s) => !s.isDone());
		if (firstUndone > 0) setCurrentIndex(firstUndone);
		setHydrated(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [storageKey]);

	useEffect(() => {
		if (!hydrated || typeof window === "undefined") return;
		localStorage.setItem(storageKey, String(currentIndex));
	}, [currentIndex, storageKey, hydrated]);

	// Clamp if section count changes
	useEffect(() => {
		if (currentIndex >= sections.length) {
			setCurrentIndex(Math.max(0, sections.length - 1));
		}
	}, [sections.length, currentIndex]);

	const atFirst = currentIndex === 0;
	const atLast = currentIndex === sections.length - 1;

	function goPrev() {
		if (!atFirst) {
			setCurrentIndex((i) => i - 1);
			return;
		}
		if (prevStep) window.location.href = `/step/${prevStep}`;
	}

	function goNext() {
		if (!atLast) {
			setCurrentIndex((i) => i + 1);
			return;
		}
		if (nextStep) window.location.href = `/step/${nextStep}`;
		else if (isLast) window.location.href = "/practice";
	}

	// Keyboard:
	//   Inner (items within section):  ArrowLeft/Right, H/L
	//   Outer (section-to-section):    J/K, Shift+ArrowLeft/Right
	// Inner navigation is forwarded to whichever stepper is mounted via a
	// window custom event. Text-input targets are ignored.
	useEffect(() => {
		function onKey(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}
			if (e.metaKey || e.ctrlKey || e.altKey) return;

			const key = e.key;
			const shift = e.shiftKey;

			// ── Outer section nav ────────────────────────────────────
			if (shift && key === "ArrowRight") {
				e.preventDefault();
				goNext();
				return;
			}
			if (shift && key === "ArrowLeft") {
				e.preventDefault();
				goPrev();
				return;
			}
			if (key === "j" || key === "J") {
				e.preventDefault();
				goNext();
				return;
			}
			if (key === "k" || key === "K") {
				e.preventDefault();
				goPrev();
				return;
			}

			// ── Inner item nav (dispatched to the mounted stepper) ──
			if (key === "ArrowRight" || key === "l" || key === "L") {
				e.preventDefault();
				window.dispatchEvent(
					new CustomEvent("focus-nav-inner", {
						detail: { direction: "next" },
					}),
				);
				return;
			}
			if (key === "ArrowLeft" || key === "h" || key === "H") {
				e.preventDefault();
				window.dispatchEvent(
					new CustomEvent("focus-nav-inner", {
						detail: { direction: "prev" },
					}),
				);
				return;
			}
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [atFirst, atLast, prevStep, nextStep, isLast]);

	const section = sections[currentIndex];
	if (!section) return null;

	const overallPct = Math.round(stepProgress.overall * 100);
	const sectionDoneCount = sections.filter((s) => s.isDone()).length;

	return (
		<div className="min-h-[calc(100vh-80px)] flex flex-col">
			{/* Step header */}
			<div className="flex items-center gap-3 mb-3">
				<span className={`badge-domain-${day.domain}`}>
					{domainName}
				</span>
				<span className="caption">
					Step {day.number} of 28 · {overallPct}% complete
				</span>
			</div>
			<h1 className="heading-1 mb-6">{day.title}</h1>

			{/* Progress bar with section ticks */}
			<div className="mb-8">
				<div className="flex items-center gap-1.5 mb-2">
					{sections.map((s, i) => {
						const isActive = i === currentIndex;
						const isDone = s.isDone();
						let cls = "bg-surface-3 hover:bg-surface-4";
						if (isDone) cls = "bg-accent-aqua";
						if (isActive)
							cls =
								"bg-accent-yellow ring-1 ring-accent-yellow ring-offset-2 ring-offset-surface-0";
						return (
							<button
								key={s.id}
								type="button"
								onClick={() => setCurrentIndex(i)}
								title={s.label}
								className={`flex-1 h-2 rounded-full transition-all cursor-pointer ${cls}`}
								aria-label={`Go to ${s.label}`}
							/>
						);
					})}
				</div>
				<div className="flex items-center justify-between caption">
					<span>
						{currentIndex + 1} of {sections.length} · {section.label}
					</span>
					<span>{sectionDoneCount} done</span>
				</div>
			</div>

			{/* Section body — flex-1 absorbs slack; justify-center lets
			    short content sit visually balanced instead of hugging the top. */}
			<section className="flex-1 flex flex-col justify-center mb-10">
				<h2 className="heading-2 mb-6">{section.label}</h2>
				{section.body}
			</section>

			{/* Action bar — mt-auto pins it to bottom of viewport via flex */}
			<div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-surface-3">
				<button
					type="button"
					onClick={goPrev}
					disabled={atFirst && !prevStep}
					className={`btn-ghost ${atFirst && !prevStep ? "opacity-30 pointer-events-none" : ""}`}
				>
					<ChevronLeft className="w-4 h-4" />
					<span>
						{atFirst ? (prevStep ? `Step ${prevStep}` : "Back") : "Previous"}
					</span>
				</button>

				<span className="caption hidden sm:inline text-center leading-tight">
					<kbd className="text-ink">← →</kbd> items ·{" "}
					<kbd className="text-ink">J/K</kbd> sections
				</span>

				<button
					type="button"
					onClick={goNext}
					disabled={atLast && !nextStep && !isLast}
					className={`${atLast ? "btn-primary" : "btn-ghost"} ${atLast && !nextStep && !isLast ? "opacity-30 pointer-events-none" : ""}`}
				>
					<span>
						{atLast
							? nextStep
								? `Step ${nextStep}`
								: isLast
									? "Practice Exams"
									: "Next"
							: "Next"}
					</span>
					<ChevronRight className="w-4 h-4" />
				</button>
			</div>
		</div>
	);
}

function FurtherReadingGrid({ items }: { items: FurtherReadingItem[] }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			{items.map((item) => (
				<a
					key={item.url}
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					className="card p-4 hover:bg-surface-2 transition-colors group flex gap-3"
				>
					<div
						className={`${FURTHER_READING_ICONS[item.type] ?? "i-lucide-link"} w-4 h-4 text-accent-blue flex-shrink-0 mt-0.5`}
					/>
					<div className="flex-1 min-w-0">
						<h4 className="body-text font-semibold group-hover:text-accent-aqua transition-colors line-clamp-2">
							{item.title}
						</h4>
						<p className="caption mt-0.5 line-clamp-2">{item.description}</p>
						{item.estimatedMinutes && (
							<span className="caption mt-1 block">
								{item.estimatedMinutes} min
							</span>
						)}
					</div>
				</a>
			))}
		</div>
	);
}
