import { useState, useEffect } from "react";
import { loadProgress } from "../progress";
import type { UserProgress } from "../types";

const DEFAULT_PROGRESS: UserProgress = {
	version: 1,
	tasksCompleted: {},
	scenarioRatings: {},
	scenarioNextReview: {},
	servicesChecked: [],
	examAttempts: [],
	drillScores: {},
	skillScenariosViewed: {},
	streak: { current: 0, lastDate: "" },
	lastVisitedDay: 1,
};

export function useProgress(): UserProgress {
	const [progress, setProgress] = useState<UserProgress>(DEFAULT_PROGRESS);

	useEffect(() => {
		// Load from localStorage after mount (avoids hydration mismatch)
		setProgress(loadProgress());

		function handleUpdate() {
			setProgress(loadProgress());
		}

		window.addEventListener("progress-updated", handleUpdate);
		window.addEventListener("storage", handleUpdate);
		return () => {
			window.removeEventListener("progress-updated", handleUpdate);
			window.removeEventListener("storage", handleUpdate);
		};
	}, []);

	return progress;
}
