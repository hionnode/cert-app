import type { UserProgress, ScenarioRating, ExamAttempt } from "./types";

const STORAGE_KEY = "aip-c01-progress";
const CURRENT_VERSION = 1;

function defaultProgress(): UserProgress {
	return {
		version: CURRENT_VERSION,
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
}

export function loadProgress(): UserProgress {
	if (typeof window === "undefined") return defaultProgress();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultProgress();
		const data = JSON.parse(raw) as UserProgress;
		if (data.version !== CURRENT_VERSION) return defaultProgress();
		return data;
	} catch {
		return defaultProgress();
	}
}

function save(progress: UserProgress) {
	if (typeof window === "undefined") return;
	localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
	window.dispatchEvent(new CustomEvent("progress-updated"));
}

export function toggleTask(taskId: string) {
	const p = loadProgress();
	p.tasksCompleted[taskId] = !p.tasksCompleted[taskId];
	updateStreak(p);
	save(p);
}

export function rateScenario(scenarioId: string, rating: ScenarioRating) {
	const p = loadProgress();
	p.scenarioRatings[scenarioId] = rating;
	if (rating !== "got-it") {
		const days = rating === "missed" ? 1 : 3;
		const next = new Date();
		next.setDate(next.getDate() + days);
		p.scenarioNextReview[scenarioId] = next.toISOString().split("T")[0];
	} else {
		delete p.scenarioNextReview[scenarioId];
	}
	save(p);
}

export function toggleService(serviceName: string) {
	const p = loadProgress();
	const idx = p.servicesChecked.indexOf(serviceName);
	if (idx === -1) p.servicesChecked.push(serviceName);
	else p.servicesChecked.splice(idx, 1);
	save(p);
}

export function addExamAttempt(attempt: ExamAttempt) {
	const p = loadProgress();
	p.examAttempts.push(attempt);
	save(p);
}

export function saveDrillScore(drillId: string, score: number) {
	const p = loadProgress();
	const prev = p.drillScores[drillId] ?? 0;
	if (score > prev) p.drillScores[drillId] = score;
	save(p);
}

export function setLastVisitedDay(day: number) {
	const p = loadProgress();
	p.lastVisitedDay = day;
	save(p);
}

function updateStreak(p: UserProgress) {
	const today = new Date().toISOString().split("T")[0];
	if (p.streak.lastDate === today) return;

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const yesterdayStr = yesterday.toISOString().split("T")[0];

	if (p.streak.lastDate === yesterdayStr) {
		p.streak.current += 1;
	} else if (p.streak.lastDate !== today) {
		p.streak.current = 1;
	}
	p.streak.lastDate = today;
}

export function getCompletionByDomain(
	tasksCompleted: Record<string, boolean>,
	days: { number: number; domain: number; tasks: { id: string }[] }[],
): Record<number, { completed: number; total: number }> {
	const result: Record<number, { completed: number; total: number }> = {};
	for (let d = 1; d <= 5; d++) result[d] = { completed: 0, total: 0 };

	for (const day of days) {
		const domain = day.domain;
		for (const task of day.tasks) {
			result[domain].total += 1;
			if (tasksCompleted[task.id]) result[domain].completed += 1;
		}
	}
	return result;
}

export function markSkillScenarioViewed(skillId: string, scenarioIndex: number) {
	const p = loadProgress();
	if (!p.skillScenariosViewed) p.skillScenariosViewed = {};
	const viewed = p.skillScenariosViewed[skillId] ?? [];
	if (!viewed.includes(scenarioIndex)) {
		p.skillScenariosViewed[skillId] = [...viewed, scenarioIndex];
	}
	save(p);
}

export function exportProgress(): string {
	return localStorage.getItem(STORAGE_KEY) || JSON.stringify(defaultProgress());
}

export function importProgress(json: string) {
	const data = JSON.parse(json) as UserProgress;
	if (data.version !== CURRENT_VERSION) throw new Error("Incompatible version");
	save(data);
}
