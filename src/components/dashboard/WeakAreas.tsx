import { useMemo } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useProgress } from "../../lib/hooks/use-progress";
import { getDomainWeaknesses } from "../../lib/progress";
import { DOMAINS } from "../../lib/constants";
import type { Scenario, PracticeQuestion } from "../../lib/types";

interface WeakAreasProps {
	scenarios: Scenario[];
	questions: PracticeQuestion[];
}

export default function WeakAreas({ scenarios, questions }: WeakAreasProps) {
	const progress = useProgress();
	const weak = useMemo(
		() => getDomainWeaknesses(progress, scenarios, questions).slice(0, 3),
		[progress, scenarios, questions],
	);

	if (weak.length === 0) {
		return null;
	}

	return (
		<div className="card-padded">
			<div className="flex items-center gap-2 mb-4">
				<AlertTriangle className="w-4 h-4 text-accent-yellow" />
				<h3 className="heading-3">Weak areas to review</h3>
			</div>
			<ul className="space-y-3">
				{weak.map((w) => {
					const domain = DOMAINS.find((d) => d.id === w.domain);
					const accuracyPct = Math.round(w.accuracy * 100);
					const parts: string[] = [];
					if (w.missedScenarios > 0) {
						parts.push(
							`${w.missedScenarios} missed scenario${w.missedScenarios === 1 ? "" : "s"}`,
						);
					}
					if (w.partialScenarios > 0) {
						parts.push(
							`${w.partialScenarios} partial${w.partialScenarios === 1 ? "" : "s"}`,
						);
					}
					if (w.questionsAnswered > 0) {
						parts.push(`${accuracyPct}% quiz accuracy`);
					}
					return (
						<li key={w.domain} className="flex items-start justify-between gap-3">
							<div className="min-w-0 flex-1">
								<span className={`badge-domain-${w.domain}`}>
									{domain?.shortName ?? `Domain ${w.domain}`}
								</span>
								<p className="caption mt-1">{parts.join(" · ")}</p>
							</div>
							<a
								href={`/practice?domain=${w.domain}`}
								className="btn-ghost text-sm shrink-0"
							>
								Review
								<ArrowRight className="w-4 h-4" />
							</a>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
