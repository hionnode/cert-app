import { useProgress } from "../../lib/hooks/use-progress";
import type { StudyDay } from "../../lib/types";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";

interface TodayPlanProps {
	days: StudyDay[];
}

export default function TodayPlan({ days }: TodayPlanProps) {
	const { tasksCompleted, lastVisitedDay } = useProgress();
	const day = days.find((d) => d.number === lastVisitedDay) ?? days[0];
	if (!day) return null;

	const doneTasks = day.tasks.filter((t) => tasksCompleted[t.id]).length;
	const allDone = doneTasks === day.tasks.length && day.tasks.length > 0;

	return (
		<div className="card-padded">
			<div className="flex items-start justify-between gap-3 mb-4">
				<div>
					<p className="caption uppercase tracking-wide">
						Day {day.number} &middot; {day.weekday}
					</p>
					<h2 className="heading-3 mt-1">{day.title}</h2>
				</div>
				<div
					className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
						allDone ? "bg-primary-100 text-primary-700" : "bg-surface-2 text-ink-secondary"
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
								<CheckCircle className="w-4 h-4 text-primary-500 shrink-0" />
							) : (
								<Circle className="w-4 h-4 text-ink-muted shrink-0" />
							)}
							<span
								className={`text-sm leading-snug ${
									done ? "line-through text-ink-muted" : "text-ink-secondary"
								}`}
							>
								{task.title}
							</span>
						</li>
					);
				})}
				{day.tasks.length > 4 && (
					<li className="text-xs text-ink-muted pl-7">+{day.tasks.length - 4} more tasks</li>
				)}
			</ul>

			<a href={`/day/${day.number}`} className="btn-primary w-full justify-center">
				{allDone ? "Review Day" : "Continue Studying"}
				<ArrowRight className="w-4 h-4" />
			</a>
		</div>
	);
}
