import { useState, useCallback } from "react";
import { CheckCircle } from "lucide-react";
import ItemStepper from "../shared/ItemStepper";
import ScenarioCard from "./ScenarioCard";
import { useProgress } from "../../lib/hooks/use-progress";
import type { Scenario } from "../../lib/types";

interface ScenarioStepperProps {
	scenarios: Scenario[];
}

export default function ScenarioStepper({ scenarios }: ScenarioStepperProps) {
	const { scenarioRatings } = useProgress();

	const [currentIndex, setCurrentIndex] = useState(() => {
		const firstUnrated = scenarios.findIndex(
			(s) => !scenarioRatings[s.id],
		);
		return firstUnrated >= 0 ? firstUnrated : 0;
	});

	const handleRated = useCallback(() => {
		// Auto-advance to next unrated
		const nextUnrated = scenarios.findIndex(
			(s, i) => i > currentIndex && !scenarioRatings[s.id],
		);
		if (nextUnrated >= 0) {
			setCurrentIndex(nextUnrated);
		} else if (currentIndex < scenarios.length - 1) {
			setCurrentIndex(currentIndex + 1);
		}
	}, [currentIndex, scenarios, scenarioRatings]);

	const totalDone = scenarios.filter((s) => scenarioRatings[s.id]).length;

	return (
		<ItemStepper
			items={scenarios}
			getKey={(s) => s.id}
			isDone={(s) => !!scenarioRatings[s.id]}
			currentIndex={currentIndex}
			onNavigate={setCurrentIndex}
			itemLabel="Scenario"
			totalDone={totalDone}
			renderItem={(scenario) => (
				<ScenarioCard
					scenario={scenario}
					onRated={handleRated}
					embedded
				/>
			)}
			renderAllDone={() => (
				<div className="card p-6 text-center">
					<CheckCircle className="w-12 h-12 text-accent-aqua mx-auto mb-4" />
					<h3 className="heading-3 mb-2">
						All {scenarios.length} scenarios reviewed
					</h3>
					<p className="body-text mb-6">
						{scenarios.filter((s) => scenarioRatings[s.id] === "got-it").length} got-it
						{" / "}
						{scenarios.filter((s) => scenarioRatings[s.id] === "partial").length} partial
						{" / "}
						{scenarios.filter((s) => scenarioRatings[s.id] === "missed").length} missed
					</p>
					<button
						type="button"
						onClick={() => setCurrentIndex(0)}
						className="btn-ghost"
					>
						Review Scenarios
					</button>
				</div>
			)}
		/>
	);
}
