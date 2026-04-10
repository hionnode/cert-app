import {
	BookOpen,
	GraduationCap,
	Newspaper,
	Wrench,
	PlayCircle,
	RefreshCw,
	FileCheck,
	ExternalLink,
	Clock,
	Check,
	CheckCircle,
	ChevronLeft,
	ChevronRight,
	ArrowRight,
} from "lucide-react";
import { TASK_TYPE_LABELS } from "../../lib/constants";
import type { Task } from "../../lib/types";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
	read: BookOpen,
	study: GraduationCap,
	blog: Newspaper,
	"hands-on": Wrench,
	watch: PlayCircle,
	review: RefreshCw,
	"practice-exam": FileCheck,
};

const typeBadgeClasses: Record<string, string> = {
	read: "bg-surface-2 text-accent-blue",
	study: "bg-surface-2 text-accent-aqua",
	blog: "border border-accent-orange text-accent-orange",
	"hands-on": "border border-accent-purple text-accent-purple",
	watch: "bg-surface-2 text-accent-red",
	review: "bg-surface-2 text-accent-aqua",
	"practice-exam": "bg-surface-2 text-accent-yellow",
};

interface TaskStepperProps {
	tasks: Task[];
	completed: Record<string, boolean>;
	currentIndex: number;
	onNavigate: (index: number) => void;
	onComplete: (taskId: string) => void;
	onToggle: (taskId: string) => void;
	stepNumber: number;
	totalDone: number;
}

export default function TaskStepper({
	tasks,
	completed,
	currentIndex,
	onNavigate,
	onComplete,
	onToggle,
	stepNumber,
	totalDone,
}: TaskStepperProps) {
	const allDone = totalDone === tasks.length && tasks.length > 0;
	const task = tasks[currentIndex];

	if (!task) return null;

	const done = completed[task.id];
	const Icon = typeIcons[task.type] ?? BookOpen;
	const nextStep = stepNumber < 28 ? stepNumber + 1 : null;

	// All complete state
	if (allDone) {
		return (
			<div className="card p-6 text-center">
				<CheckCircle className="w-12 h-12 text-accent-aqua mx-auto mb-4" />
				<h3 className="heading-3 mb-2">All {tasks.length} tasks complete</h3>
				<p className="body-text mb-6">Great work on this step!</p>
				<div className="flex items-center justify-center gap-3">
					<button
						type="button"
						onClick={() => onNavigate(0)}
						className="btn-ghost"
					>
						Review Tasks
					</button>
					{nextStep && (
						<a href={`/step/${nextStep}`} className="btn-primary">
							Next Step <ArrowRight className="w-4 h-4" />
						</a>
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			{/* Inline minimap — horizontal dots */}
			<div className="flex items-center justify-center gap-1.5 mb-5">
				{tasks.map((t, i) => {
					const isDone = completed[t.id];
					const isActive = i === currentIndex;

					let dotClass = "bg-surface-3 hover:bg-surface-4";
					if (isDone) dotClass = "bg-accent-aqua";
					if (isActive)
						dotClass =
							"bg-accent-yellow ring-1 ring-accent-yellow ring-offset-1 ring-offset-surface-0";

					return (
						<button
							key={t.id}
							type="button"
							onClick={() => onNavigate(i)}
							className={`${isActive ? "w-8 h-2.5" : "w-6 h-2"} rounded-full cursor-pointer transition-all duration-200 ${dotClass}`}
							title={`${i + 1}. ${t.title}`}
							aria-label={`Go to task ${i + 1}: ${t.title}`}
						/>
					);
				})}
			</div>

			{/* Progress text */}
			<div className="flex items-center justify-between mb-4">
				<span className="caption">
					Task {currentIndex + 1} of {tasks.length}
				</span>
				<span className="caption">
					{totalDone}/{tasks.length} completed
				</span>
			</div>

			{/* Task card */}
			<div
				key={task.id}
				className={`card p-6 transition-opacity duration-200 ${done ? "border-accent-aqua" : ""}`}
			>
				{/* Badge row */}
				<div className="flex items-center gap-3 mb-4">
					<span
						className={`badge gap-1 ${typeBadgeClasses[task.type] ?? "bg-surface-2 text-ink-secondary"}`}
					>
						<Icon className="w-4 h-4" />
						{TASK_TYPE_LABELS[task.type] ?? task.type}
					</span>
					<span className="flex items-center gap-1 caption-sm">
						<Clock className="w-4 h-4" />
						{task.estimatedMinutes}m
					</span>
					{done && (
						<CheckCircle className="w-5 h-5 text-accent-aqua ml-auto" />
					)}
				</div>

				{/* Title */}
				<h3 className={`heading-3 mb-3 ${done ? "text-ink-muted" : ""}`}>
					{task.title}
				</h3>

				{/* Description */}
				{task.description && (
					<p className="body-text mb-4">{task.description}</p>
				)}

				{/* External link */}
				{task.url && (
					<a
						href={task.url}
						target="_blank"
						rel="noopener noreferrer"
						className="btn-secondary w-full justify-center mb-4"
					>
						<ExternalLink className="w-4 h-4" />
						Open Resource
					</a>
				)}

				{/* Action bar */}
				<div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-3">
					<button
						type="button"
						onClick={() => onNavigate(currentIndex - 1)}
						disabled={currentIndex === 0}
						className={`btn-ghost text-sm ${currentIndex === 0 ? "opacity-30 pointer-events-none" : ""}`}
					>
						<ChevronLeft className="w-4 h-4" /> Back
					</button>

					{done ? (
						<button
							type="button"
							onClick={() => onToggle(task.id)}
							className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface-2 text-accent-aqua rounded-button font-semibold transition-colors cursor-pointer hover:bg-surface-3"
						>
							<CheckCircle className="w-4 h-4" /> Completed
						</button>
					) : (
						<button
							type="button"
							onClick={() => onComplete(task.id)}
							className="btn-primary"
						>
							<Check className="w-4 h-4" /> Mark Complete
						</button>
					)}

					<button
						type="button"
						onClick={() => onNavigate(currentIndex + 1)}
						disabled={currentIndex === tasks.length - 1}
						className={`btn-ghost text-sm ${currentIndex === tasks.length - 1 ? "opacity-30 pointer-events-none" : ""}`}
					>
						Next <ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
