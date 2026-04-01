import { WEEKS } from "../../lib/constants";
import { useProgress } from "../../lib/hooks/use-progress";
import type { StudyDay } from "../../lib/types";

interface WeekOverviewProps {
	days: StudyDay[];
}

export default function WeekOverview({ days }: WeekOverviewProps) {
	const { tasksCompleted } = useProgress();

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{WEEKS.map((week) => {
				const weekDays = days.filter((d) => d.week === week.number);
				const totalTasks = weekDays.reduce((sum, d) => sum + d.tasks.length, 0);
				const completedTasks = weekDays.reduce(
					(sum, d) => sum + d.tasks.filter((t) => tasksCompleted[t.id]).length,
					0,
				);
				const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
				const dayRange = `Day ${week.days[0]}\u2013${week.days[week.days.length - 1]}`;

				return (
					<a
						key={week.number}
						href="/plan"
						className="card p-4 hover:border-primary-400 transition-colors"
					>
						<p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-1">
							Week {week.number}
						</p>
						<p className="text-sm font-semibold text-ink leading-tight mb-1">{week.title}</p>
						<p className="text-xs text-ink-muted mb-3">{dayRange}</p>
						<div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
							<div
								className="h-full rounded-full bg-primary-500 transition-all duration-500"
								style={{ width: `${pct}%` }}
							/>
						</div>
						<p className="text-xs text-ink-muted mt-1.5">
							{completedTasks}/{totalTasks} tasks - {pct}%
						</p>
					</a>
				);
			})}
		</div>
	);
}
