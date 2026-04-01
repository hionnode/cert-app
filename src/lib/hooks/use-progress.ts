import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { loadProgress } from "../progress";
import type { UserProgress } from "../types";

function subscribe(callback: () => void) {
	window.addEventListener("progress-updated", callback);
	window.addEventListener("storage", callback);
	return () => {
		window.removeEventListener("progress-updated", callback);
		window.removeEventListener("storage", callback);
	};
}

function getSnapshot(): UserProgress {
	return loadProgress();
}

function getServerSnapshot(): UserProgress {
	return {
		version: 1,
		tasksCompleted: {},
		scenarioRatings: {},
		scenarioNextReview: {},
		servicesChecked: [],
		examAttempts: [],
		drillScores: {},
		streak: { current: 0, lastDate: "" },
		lastVisitedDay: 1,
	};
}

export function useProgress(): UserProgress {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
