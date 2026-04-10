import { useState, useCallback } from "react";
import { toggleTask } from "../../lib/progress";
import TaskStepper from "./TaskStepper";
import TaskMinimap from "./TaskMinimap";
import type { Task } from "../../lib/types";

interface TaskViewProps {
	tasks: Task[];
	stepNumber: number;
}

export default function TaskView({ tasks, stepNumber }: TaskViewProps) {
	const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
		if (typeof window === "undefined") return {};
		try {
			const raw = localStorage.getItem("aip-c01-progress");
			if (!raw) return {};
			return JSON.parse(raw).tasksCompleted ?? {};
		} catch {
			return {};
		}
	});

	// Start at first incomplete task
	const [currentIndex, setCurrentIndex] = useState(() => {
		const firstIncomplete = tasks.findIndex((t) => !completed[t.id]);
		return firstIncomplete >= 0 ? firstIncomplete : 0;
	});

	const handleToggle = useCallback(
		(taskId: string) => {
			toggleTask(taskId);
			setCompleted((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
		},
		[],
	);

	const handleComplete = useCallback(
		(taskId: string) => {
			if (!completed[taskId]) {
				toggleTask(taskId);
				setCompleted((prev) => ({ ...prev, [taskId]: true }));
			}
			// Auto-advance after short delay
			setTimeout(() => {
				const nextIncomplete = tasks.findIndex(
					(t, i) => i > currentIndex && !completed[t.id] && t.id !== taskId,
				);
				if (nextIncomplete >= 0) {
					setCurrentIndex(nextIncomplete);
				} else if (currentIndex < tasks.length - 1) {
					setCurrentIndex(currentIndex + 1);
				}
			}, 300);
		},
		[completed, currentIndex, tasks],
	);

	const doneCount = tasks.filter((t) => completed[t.id]).length;

	return (
		<div className="flex gap-4">
			<div className="flex-1 min-w-0">
				<TaskStepper
					tasks={tasks}
					completed={completed}
					currentIndex={currentIndex}
					onNavigate={setCurrentIndex}
					onComplete={handleComplete}
					onToggle={handleToggle}
					stepNumber={stepNumber}
					totalDone={doneCount}
				/>
			</div>
			<div className="hidden md:block">
				<TaskMinimap
					tasks={tasks}
					completed={completed}
					currentIndex={currentIndex}
					onNavigate={setCurrentIndex}
				/>
			</div>
		</div>
	);
}
