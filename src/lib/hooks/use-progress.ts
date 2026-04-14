import { useState, useEffect } from "react";
import { loadProgress, defaultProgress } from "../progress";
import type { UserProgress } from "../types";

const DEFAULT_PROGRESS: UserProgress = defaultProgress();

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
