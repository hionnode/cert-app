import { DOMAINS } from "../../lib/constants";
import ProgressRing from "../shared/ProgressRing";
import { useProgress } from "../../lib/hooks/use-progress";
import { getCompletionByDomain } from "../../lib/progress";
import type { StudyDay } from "../../lib/types";

interface DomainProgressRingsProps {
	days: StudyDay[];
}

export default function DomainProgressRings({ days }: DomainProgressRingsProps) {
	const { tasksCompleted } = useProgress();
	const progress = getCompletionByDomain(tasksCompleted, days);

	return (
		<div className="card-padded">
			<div className="flex flex-wrap items-start justify-center gap-6 sm:gap-8">
				{DOMAINS.map((domain) => {
					const dp = progress[domain.id] ?? { completed: 0, total: 0 };
					return (
						<div key={domain.id} className="flex flex-col items-center gap-2">
							<ProgressRing
								value={dp.completed}
								max={dp.total}
								size={88}
								color={domain.color}
							/>
							<div className="text-center max-w-28">
								<p className="text-sm font-semibold text-ink leading-tight">
									{domain.shortName}
								</p>
								<p className="caption mt-0.5">
									{dp.completed}/{dp.total} tasks
								</p>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
