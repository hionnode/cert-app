import { useProgress } from "../../lib/hooks/use-progress";
import { getDueReviews } from "../../lib/progress";
import type { StudyDay } from "../../lib/types";
import { CheckCircle, Circle, ArrowRight, Clock } from "lucide-react";

interface TodayPlanProps {
	days: StudyDay[];
}

export default function TodayPlan({ days }: TodayPlanProps) {
	const progress = useProgress();
	const { tasksCompleted, lastVisitedDay } = progress;
	const day = days.find((d) => d.number === lastVisitedDay) ?? days[0];
	const dueReviews = getDueReviews(progress);
	if (!day || !days.length) {
		return (
			<div className="card-padded animate-pulse">
				<div className="h-4 bg-surface-2 rounded w-1/3 mb-3" />
				<div className="h-6 bg-surface-2 rounded w-2/3 mb-4" />
				<div className="space-y-2">
					<div className="h-4 bg-surface-2 rounded w-full" />
					<div className="h-4 bg-surface-2 rounded w-5/6" />
				</div>
			</div>
		);
	}

	const doneTasks = day.tasks.filter((t) => tasksCompleted[t.id]).length;
	const allDone = doneTasks === day.tasks.length && day.tasks.length > 0;

	return (
		<div className="card-padded">
			{dueReviews.length > 0 && (
				<div className="flex items-center gap-2 mb-4 pb-3 border-b border-surface-3">
					<Clock className="w-4 h-4 text-accent-yellow shrink-0" />
					<p className="caption">
						<span className="text-accent-yellow font-semibold">
							{dueReviews.length} scenario
							{dueReviews.length === 1 ? "" : "s"}
						</span>{" "}
						due for review today
					</p>
				</div>
			)}
			<div className="flex items-start justify-between gap-3 mb-4">
				<div>
					<p className="caption uppercase tracking-wide">
						Step {day.number} of 28
					</p>
					<h2 className="heading-3 mt-1">{day.title}</h2>
				</div>
				<div
					className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-semibold ${
						allDone ? "bg-surface-2 text-accent-aqua" : "bg-surface-2 text-ink-secondary"
					}`}
				>
					{allDone ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
					{doneTasks}/{day.tasks.length}
				</div>
			</div>

			<ul className="space-y-2 mb-5">
				{day.tasks.slice(0, 4).map((task) => {
					const done = tasksCompleted[task.id];
					return (
						<li key={task.id} className="flex items-center gap-2.5">
							{done ? (
								<CheckCircle className="w-4 h-4 text-accent-aqua shrink-0" />
							) : (
								<Circle className="w-4 h-4 text-ink-muted shrink-0" />
							)}
							<span
								className={`body-text leading-snug ${
									done ? "line-through text-ink-muted" : "text-ink-secondary"
								}`}
							>
								{task.title}
							</span>
						</li>
					);
				})}
				{day.tasks.length > 4 && (
					<li className="caption pl-7">+{day.tasks.length - 4} more tasks</li>
				)}
			</ul>

			<a href={`/step/${day.number}`} className="btn-primary w-full justify-center">
				{allDone ? "Review Step" : "Continue"}
				<ArrowRight className="w-4 h-4" />
			</a>
		</div>
	);
}
