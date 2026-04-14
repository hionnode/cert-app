import {
	ExternalLink,
	Clock,
	Check,
	CheckCircle,
	ArrowRight,
} from "lucide-react";
import ItemStepper from "../shared/ItemStepper";
import { TASK_TYPE_LABELS } from "../../lib/constants";
import type { Task } from "../../lib/types";

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
	const nextStep = stepNumber < 28 ? stepNumber + 1 : null;

	return (
		<ItemStepper
			items={tasks}
			getKey={(t) => t.id}
			isDone={(t) => !!completed[t.id]}
			currentIndex={currentIndex}
			onNavigate={onNavigate}
			itemLabel="Task"
			totalDone={totalDone}
			renderItem={(task) => {
				const done = completed[task.id];

				return (
					<>
						<div className="flex items-center gap-3 mb-4">
							<span
								className={`badge ${typeBadgeClasses[task.type] ?? "bg-surface-2 text-ink-secondary"}`}
							>
								{TASK_TYPE_LABELS[task.type] ?? task.type}
							</span>
							<span className="flex items-center gap-1 caption">
								<Clock className="w-4 h-4" />
								{task.estimatedMinutes}m
							</span>
							{done && (
								<CheckCircle className="w-5 h-5 text-accent-aqua ml-auto" />
							)}
						</div>
						<h3 className={`heading-3 mb-3 ${done ? "text-ink-muted" : ""}`}>
							{task.title}
						</h3>
						{task.description && (
							<p className="body-text mb-4">{task.description}</p>
						)}
						{task.url && (
							<a
								href={task.url}
								target="_blank"
								rel="noopener noreferrer"
								className="btn-secondary w-full justify-center"
							>
								<ExternalLink className="w-4 h-4" />
								Open Resource
							</a>
						)}
					</>
				);
			}}
			renderActions={(task) => {
				const done = completed[task.id];
				return done ? (
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
				);
			}}
			renderAllDone={() => (
				<div className="card p-6 text-center">
					<CheckCircle className="w-12 h-12 text-accent-aqua mx-auto mb-4" />
					<h3 className="heading-3 mb-2">
						All {tasks.length} tasks complete
					</h3>
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
			)}
		/>
	);
}
