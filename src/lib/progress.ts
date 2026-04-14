import type { UserProgress, ScenarioRating, ExamAttempt, QuestionResult } from "./types";

const STORAGE_KEY = "aip-c01-progress";
const CURRENT_VERSION = 2;

export function defaultProgress(): UserProgress {
	return {
		version: CURRENT_VERSION,
		tasksCompleted: {},
		scenarioRatings: {},
		scenarioNextReview: {},
		servicesChecked: [],
		examAttempts: [],
		drillScores: {},
		skillScenariosViewed: {},
		handsOnCompleted: {},
		questionResults: {},
		streak: { current: 0, lastDate: "" },
		lastVisitedDay: 1,
	};
}

function migrate(data: Partial<UserProgress> & { version?: number }): UserProgress {
	const base = defaultProgress();
	// Merge v1 fields forward; unknown versions fall back to defaults.
	if (data.version === 1 || data.version === 2) {
		return { ...base, ...data, version: CURRENT_VERSION };
	}
	return base;
}

export function loadProgress(): UserProgress {
	if (typeof window === "undefined") return defaultProgress();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return defaultProgress();
		const data = JSON.parse(raw) as Partial<UserProgress> & { version?: number };
		return migrate(data);
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

export function toggleHandsOn(activityId: string) {
	const p = loadProgress();
	if (!p.handsOnCompleted) p.handsOnCompleted = {};
	p.handsOnCompleted[activityId] = !p.handsOnCompleted[activityId];
	save(p);
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

export function saveQuestionResult(questionId: string, correct: boolean) {
	const p = loadProgress();
	p.questionResults[questionId] = {
		correct,
		answeredAt: new Date().toISOString(),
	};
	save(p);
}

// ── Aggregations ──────────────────────────────────────────────────────────

interface StepLike {
	number: number;
	domain: number;
	tasks: { id: string }[];
	handsOn?: { id: string }[];
	scenarioIds: string[];
	examSkills: string[];
}

export interface StepProgress {
	tasks: { done: number; total: number };
	scenarios: { done: number; total: number };
	handsOn: { done: number; total: number };
	skills: { done: number; total: number };
	overall: number; // 0..1 weighted across sections that exist
}

export function getStepProgress(
	step: StepLike,
	progress: UserProgress,
	scenarios: { id: string }[],
	skills: { id: string; scenarios?: unknown[] }[],
): StepProgress {
	const tasksDone = step.tasks.filter((t) => progress.tasksCompleted[t.id]).length;
	const scenariosForDay = scenarios.filter((s) => step.scenarioIds.includes(s.id));
	const scenariosDone = scenariosForDay.filter(
		(s) => progress.scenarioRatings[s.id] === "got-it",
	).length;
	const handsOnTotal = step.handsOn?.length ?? 0;
	const handsOnDone = (step.handsOn ?? []).filter(
		(h) => progress.handsOnCompleted[h.id],
	).length;
	const skillsForDay = skills.filter((sk) => step.examSkills.includes(sk.id));
	const skillsDone = skillsForDay.filter((sk) => {
		const viewed = progress.skillScenariosViewed[sk.id] ?? [];
		const total = sk.scenarios?.length ?? 0;
		return total === 0 || viewed.length >= total;
	}).length;

	const buckets = [
		{ done: tasksDone, total: step.tasks.length },
		{ done: scenariosDone, total: scenariosForDay.length },
		{ done: handsOnDone, total: handsOnTotal },
		{ done: skillsDone, total: skillsForDay.length },
	].filter((b) => b.total > 0);

	const overall =
		buckets.length === 0
			? 0
			: buckets.reduce((acc, b) => acc + b.done / b.total, 0) / buckets.length;

	return {
		tasks: { done: tasksDone, total: step.tasks.length },
		scenarios: { done: scenariosDone, total: scenariosForDay.length },
		handsOn: { done: handsOnDone, total: handsOnTotal },
		skills: { done: skillsDone, total: skillsForDay.length },
		overall,
	};
}

export function getOverallProgress(
	steps: StepLike[],
	progress: UserProgress,
	scenarios: { id: string }[],
	skills: { id: string; scenarios?: unknown[] }[],
): number {
	if (steps.length === 0) return 0;
	const sum = steps.reduce(
		(acc, s) => acc + getStepProgress(s, progress, scenarios, skills).overall,
		0,
	);
	return sum / steps.length;
}

export function getDueReviews(
	progress: UserProgress,
	today: string = new Date().toISOString().split("T")[0],
): string[] {
	return Object.entries(progress.scenarioNextReview)
		.filter(([, date]) => date <= today)
		.map(([id]) => id);
}

export interface DomainWeakness {
	domain: number;
	missedScenarios: number;
	partialScenarios: number;
	questionsAnswered: number;
	questionsCorrect: number;
	accuracy: number; // 0..1, 0 when no questions
	score: number; // higher = weaker (for ranking)
}

export function getDomainWeaknesses(
	progress: UserProgress,
	scenarios: { id: string; domain: number }[],
	questions: { id: string; domain: number }[],
): DomainWeakness[] {
	const byDomain: Record<number, DomainWeakness> = {};
	for (let d = 1; d <= 5; d++) {
		byDomain[d] = {
			domain: d,
			missedScenarios: 0,
			partialScenarios: 0,
			questionsAnswered: 0,
			questionsCorrect: 0,
			accuracy: 0,
			score: 0,
		};
	}

	for (const s of scenarios) {
		const rating = progress.scenarioRatings[s.id];
		if (rating === "missed") byDomain[s.domain].missedScenarios += 1;
		else if (rating === "partial") byDomain[s.domain].partialScenarios += 1;
	}

	for (const q of questions) {
		const r = progress.questionResults[q.id];
		if (!r) continue;
		byDomain[q.domain].questionsAnswered += 1;
		if (r.correct) byDomain[q.domain].questionsCorrect += 1;
	}

	for (const d of Object.values(byDomain)) {
		d.accuracy =
			d.questionsAnswered === 0 ? 0 : d.questionsCorrect / d.questionsAnswered;
		// score: scenarios missed weigh 2x, partial 1x, inverse accuracy * 5 when answered
		d.score =
			d.missedScenarios * 2 +
			d.partialScenarios +
			(d.questionsAnswered > 0 ? (1 - d.accuracy) * 5 : 0);
	}

	return Object.values(byDomain)
		.filter((d) => d.score > 0)
		.sort((a, b) => b.score - a.score);
}

// Re-export to surface the type when needed externally
export type { QuestionResult };
