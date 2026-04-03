import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
	loadProgress,
	toggleTask,
	rateScenario,
	toggleService,
	addExamAttempt,
	saveDrillScore,
	setLastVisitedDay,
	getCompletionByDomain,
	markSkillScenarioViewed,
	exportProgress,
	importProgress,
} from "../progress";
import type { UserProgress } from "../types";

const STORAGE_KEY = "aip-c01-progress";

function getStored(): UserProgress {
	return JSON.parse(localStorage.getItem(STORAGE_KEY)!);
}

function seedProgress(overrides: Partial<UserProgress> = {}) {
	const base: UserProgress = {
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
		...overrides,
	};
	localStorage.setItem(STORAGE_KEY, JSON.stringify(base));
}

describe("progress", () => {
	beforeEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	// ── loadProgress ──────────────────────────────────────────────

	describe("loadProgress", () => {
		it("returns default progress when localStorage is empty", () => {
			const p = loadProgress();
			expect(p.version).toBe(1);
			expect(p.tasksCompleted).toEqual({});
			expect(p.servicesChecked).toEqual([]);
			expect(p.streak).toEqual({ current: 0, lastDate: "" });
			expect(p.lastVisitedDay).toBe(1);
		});

		it("returns stored progress when valid data exists", () => {
			seedProgress({ lastVisitedDay: 5, servicesChecked: ["S3", "Lambda"] });
			const p = loadProgress();
			expect(p.lastVisitedDay).toBe(5);
			expect(p.servicesChecked).toEqual(["S3", "Lambda"]);
		});

		it("returns default when version mismatches", () => {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999 }));
			const p = loadProgress();
			expect(p.version).toBe(1);
			expect(p.tasksCompleted).toEqual({});
		});

		it("returns default when stored JSON is invalid", () => {
			localStorage.setItem(STORAGE_KEY, "not-json");
			const p = loadProgress();
			expect(p.version).toBe(1);
		});
	});

	// ── toggleTask ────────────────────────────────────────────────

	describe("toggleTask", () => {
		it("marks a task as completed", () => {
			seedProgress();
			toggleTask("d1-t1");
			expect(getStored().tasksCompleted["d1-t1"]).toBe(true);
		});

		it("toggles a task off when already completed", () => {
			seedProgress({ tasksCompleted: { "d1-t1": true } });
			toggleTask("d1-t1");
			expect(getStored().tasksCompleted["d1-t1"]).toBe(false);
		});

		it("dispatches progress-updated event", () => {
			seedProgress();
			const handler = vi.fn();
			window.addEventListener("progress-updated", handler);
			toggleTask("d1-t1");
			expect(handler).toHaveBeenCalledTimes(1);
			window.removeEventListener("progress-updated", handler);
		});
	});

	// ── rateScenario ──────────────────────────────────────────────

	describe("rateScenario", () => {
		it("stores got-it rating and removes next review date", () => {
			seedProgress({ scenarioNextReview: { "s1": "2026-01-01" } });
			rateScenario("s1", "got-it");
			const stored = getStored();
			expect(stored.scenarioRatings["s1"]).toBe("got-it");
			expect(stored.scenarioNextReview["s1"]).toBeUndefined();
		});

		it("stores missed rating with 1-day review", () => {
			seedProgress();
			const today = new Date();
			const expected = new Date(today);
			expected.setDate(expected.getDate() + 1);
			const expectedDate = expected.toISOString().split("T")[0];

			rateScenario("s2", "missed");
			const stored = getStored();
			expect(stored.scenarioRatings["s2"]).toBe("missed");
			expect(stored.scenarioNextReview["s2"]).toBe(expectedDate);
		});

		it("stores partial rating with 3-day review", () => {
			seedProgress();
			const today = new Date();
			const expected = new Date(today);
			expected.setDate(expected.getDate() + 3);
			const expectedDate = expected.toISOString().split("T")[0];

			rateScenario("s3", "partial");
			const stored = getStored();
			expect(stored.scenarioRatings["s3"]).toBe("partial");
			expect(stored.scenarioNextReview["s3"]).toBe(expectedDate);
		});
	});

	// ── toggleService ─────────────────────────────────────────────

	describe("toggleService", () => {
		it("adds a service when not checked", () => {
			seedProgress();
			toggleService("Amazon S3");
			expect(getStored().servicesChecked).toContain("Amazon S3");
		});

		it("removes a service when already checked", () => {
			seedProgress({ servicesChecked: ["Amazon S3", "Lambda"] });
			toggleService("Amazon S3");
			const services = getStored().servicesChecked;
			expect(services).not.toContain("Amazon S3");
			expect(services).toContain("Lambda");
		});
	});

	// ── addExamAttempt ────────────────────────────────────────────

	describe("addExamAttempt", () => {
		it("appends an exam attempt", () => {
			seedProgress();
			const attempt = {
				id: "exam-1",
				source: "practice",
				date: "2026-04-01",
				score: 60,
				total: 75,
			};
			addExamAttempt(attempt);
			const stored = getStored();
			expect(stored.examAttempts).toHaveLength(1);
			expect(stored.examAttempts[0]).toEqual(attempt);
		});

		it("appends multiple attempts without overwriting", () => {
			seedProgress();
			addExamAttempt({ id: "e1", source: "a", date: "2026-01-01", score: 50, total: 75 });
			addExamAttempt({ id: "e2", source: "b", date: "2026-01-02", score: 60, total: 75 });
			expect(getStored().examAttempts).toHaveLength(2);
		});
	});

	// ── saveDrillScore ────────────────────────────────────────────

	describe("saveDrillScore", () => {
		it("saves a new drill score", () => {
			seedProgress();
			saveDrillScore("drill-1", 80);
			expect(getStored().drillScores["drill-1"]).toBe(80);
		});

		it("updates score only if higher", () => {
			seedProgress({ drillScores: { "drill-1": 80 } });
			saveDrillScore("drill-1", 60);
			expect(getStored().drillScores["drill-1"]).toBe(80);
		});

		it("updates score when new score is higher", () => {
			seedProgress({ drillScores: { "drill-1": 60 } });
			saveDrillScore("drill-1", 90);
			expect(getStored().drillScores["drill-1"]).toBe(90);
		});
	});

	// ── setLastVisitedDay ─────────────────────────────────────────

	describe("setLastVisitedDay", () => {
		it("updates last visited day", () => {
			seedProgress();
			setLastVisitedDay(14);
			expect(getStored().lastVisitedDay).toBe(14);
		});
	});

	// ── markSkillScenarioViewed ───────────────────────────────────

	describe("markSkillScenarioViewed", () => {
		it("records a viewed scenario index", () => {
			seedProgress();
			markSkillScenarioViewed("skill-1", 0);
			expect(getStored().skillScenariosViewed["skill-1"]).toEqual([0]);
		});

		it("appends without duplicating", () => {
			seedProgress({ skillScenariosViewed: { "skill-1": [0] } });
			markSkillScenarioViewed("skill-1", 0);
			markSkillScenarioViewed("skill-1", 1);
			const viewed = getStored().skillScenariosViewed["skill-1"];
			expect(viewed).toEqual([0, 1]);
		});
	});

	// ── exportProgress / importProgress ───────────────────────────

	describe("exportProgress / importProgress", () => {
		it("round-trips progress through export and import", () => {
			seedProgress({ lastVisitedDay: 20, servicesChecked: ["Bedrock"] });
			const exported = exportProgress();
			localStorage.clear();

			importProgress(exported);
			const p = loadProgress();
			expect(p.lastVisitedDay).toBe(20);
			expect(p.servicesChecked).toEqual(["Bedrock"]);
		});

		it("throws on version mismatch during import", () => {
			const bad = JSON.stringify({ version: 99 });
			expect(() => importProgress(bad)).toThrow("Incompatible version");
		});
	});

	// ── getCompletionByDomain ─────────────────────────────────────

	describe("getCompletionByDomain", () => {
		const days = [
			{ number: 1, domain: 1, tasks: [{ id: "t1" }, { id: "t2" }] },
			{ number: 2, domain: 1, tasks: [{ id: "t3" }] },
			{ number: 3, domain: 2, tasks: [{ id: "t4" }, { id: "t5" }] },
			{ number: 4, domain: 3, tasks: [{ id: "t6" }] },
		];

		it("counts all tasks per domain with zero completions", () => {
			const result = getCompletionByDomain({}, days);
			expect(result[1]).toEqual({ completed: 0, total: 3 });
			expect(result[2]).toEqual({ completed: 0, total: 2 });
			expect(result[3]).toEqual({ completed: 0, total: 1 });
			expect(result[4]).toEqual({ completed: 0, total: 0 });
			expect(result[5]).toEqual({ completed: 0, total: 0 });
		});

		it("correctly counts completed tasks", () => {
			const completed = { t1: true, t3: true, t4: true };
			const result = getCompletionByDomain(completed, days);
			expect(result[1]).toEqual({ completed: 2, total: 3 });
			expect(result[2]).toEqual({ completed: 1, total: 2 });
		});

		it("ignores false-valued task completions", () => {
			const completed = { t1: true, t2: false };
			const result = getCompletionByDomain(completed as Record<string, boolean>, days);
			expect(result[1]).toEqual({ completed: 1, total: 3 });
		});
	});

	// ── streak logic (via toggleTask) ─────────────────────────────

	describe("streak tracking", () => {
		it("starts streak at 1 on first task toggle", () => {
			seedProgress();
			toggleTask("t1");
			const stored = getStored();
			expect(stored.streak.current).toBe(1);
			expect(stored.streak.lastDate).toBe(new Date().toISOString().split("T")[0]);
		});

		it("does not increment streak on same day", () => {
			const today = new Date().toISOString().split("T")[0];
			seedProgress({ streak: { current: 3, lastDate: today } });
			toggleTask("t1");
			expect(getStored().streak.current).toBe(3);
		});

		it("increments streak on consecutive day", () => {
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);
			const yesterdayStr = yesterday.toISOString().split("T")[0];
			seedProgress({ streak: { current: 5, lastDate: yesterdayStr } });
			toggleTask("t1");
			expect(getStored().streak.current).toBe(6);
		});

		it("resets streak after a gap day", () => {
			const twoDaysAgo = new Date();
			twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
			const twoStr = twoDaysAgo.toISOString().split("T")[0];
			seedProgress({ streak: { current: 10, lastDate: twoStr } });
			toggleTask("t1");
			expect(getStored().streak.current).toBe(1);
		});
	});
});
