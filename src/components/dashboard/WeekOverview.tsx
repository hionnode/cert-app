import { PHASES } from "../../lib/constants";
import { useProgress } from "../../lib/hooks/use-progress";
import type { StudyDay } from "../../lib/types";

interface WeekOverviewProps {
	days: StudyDay[];
}

export default function WeekOverview({ days }: WeekOverviewProps) {
	const { tasksCompleted } = useProgress();

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{PHASES.map((phase) => {
				const phaseDays = days.filter((d) => d.week === phase.number);
				const totalTasks = phaseDays.reduce((sum, d) => sum + d.tasks.length, 0);
				const completedTasks = phaseDays.reduce(
					(sum, d) => sum + d.tasks.filter((t) => tasksCompleted[t.id]).length,
					0,
				);
				const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
				const stepRange = `Steps ${phase.steps[0]}\u2013${phase.steps[phase.steps.length - 1]}`;

				return (
					<a
						key={phase.number}
						href="/plan"
						className="card p-4 hover:border-accent-aqua transition-colors"
					>
						<p className="caption font-bold text-ink-muted uppercase tracking-wide mb-1">
							Phase {phase.number}
						</p>
						<p className="body-text font-semibold text-ink leading-tight mb-1">{phase.title}</p>
						<p className="caption mb-3">{stepRange}</p>
						<div className="w-full h-2 bg-surface-2 rounded-sm overflow-hidden">
							<div
								className="h-full rounded-sm bg-accent-aqua transition-all duration-500"
								style={{ width: `${pct}%` }}
							/>
						</div>
						<p className="caption mt-1.5">
							{completedTasks}/{totalTasks} tasks - {pct}%
						</p>
					</a>
				);
			})}
		</div>
	);
}
