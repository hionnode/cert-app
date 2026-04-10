import type { Task } from "../../lib/types";

interface TaskMinimapProps {
	tasks: Task[];
	completed: Record<string, boolean>;
	currentIndex: number;
	onNavigate: (index: number) => void;
}

export default function TaskMinimap({
	tasks,
	completed,
	currentIndex,
	onNavigate,
}: TaskMinimapProps) {
	return (
		<div className="sticky top-20 flex flex-col items-center gap-1.5 py-4 w-10">
			{tasks.map((task, i) => {
				const isDone = completed[task.id];
				const isActive = i === currentIndex;

				let dotClass = "bg-surface-3 hover:bg-surface-4";
				if (isDone) dotClass = "bg-accent-aqua";
				if (isActive) dotClass = "bg-accent-yellow ring-1 ring-accent-yellow ring-offset-1 ring-offset-surface-0";

				return (
					<button
						key={task.id}
						type="button"
						onClick={() => onNavigate(i)}
						className={`${isActive ? "w-7 h-3.5" : "w-6 h-3"} rounded-sm cursor-pointer transition-all duration-200 ${dotClass}`}
						title={task.title}
						aria-label={`Go to task ${i + 1}: ${task.title}`}
					/>
				);
			})}
		</div>
	);
}
