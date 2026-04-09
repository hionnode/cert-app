import { describe, it, expect } from "vitest";
import {
	DOMAINS,
	WEEKS,
	TASK_TYPE_ICONS,
	TASK_TYPE_LABELS,
	RESOURCE_TYPE_ICONS,
	EXAM_INFO,
	NAV_ITEMS,
	SECONDARY_NAV,
} from "../constants";

describe("constants", () => {
	describe("DOMAINS", () => {
		it("has exactly 5 domains", () => {
			expect(DOMAINS).toHaveLength(5);
		});

		it("has sequential ids from 1 to 5", () => {
			expect(DOMAINS.map((d) => d.id)).toEqual([1, 2, 3, 4, 5]);
		});

		it("domain weights sum to 100", () => {
			const total = DOMAINS.reduce((sum, d) => sum + d.weight, 0);
			expect(total).toBe(100);
		});

		it("approximate questions sum to 65 (scored questions)", () => {
			const total = DOMAINS.reduce((sum, d) => sum + d.approxQuestions, 0);
			expect(total).toBe(65);
		});

		it("every domain has required fields", () => {
			for (const d of DOMAINS) {
				expect(d.name).toBeTruthy();
				expect(d.shortName).toBeTruthy();
				expect(d.color).toMatch(/^var\(--grv-domain-\d+\)$/);
				expect(d.weight).toBeGreaterThan(0);
				expect(d.approxQuestions).toBeGreaterThan(0);
			}
		});
	});

	describe("WEEKS", () => {
		it("has 4 weeks", () => {
			expect(WEEKS).toHaveLength(4);
		});

		it("covers all 28 days", () => {
			const allDays = WEEKS.flatMap((w) => w.days);
			expect(allDays).toHaveLength(28);
			expect(allDays[0]).toBe(1);
			expect(allDays[allDays.length - 1]).toBe(28);
		});

		it("each week has 7 days", () => {
			for (const w of WEEKS) {
				expect(w.days).toHaveLength(7);
			}
		});

		it("days are sequential and non-overlapping", () => {
			const allDays = WEEKS.flatMap((w) => w.days);
			for (let i = 0; i < allDays.length; i++) {
				expect(allDays[i]).toBe(i + 1);
			}
		});
	});

	describe("TASK_TYPE_ICONS & TASK_TYPE_LABELS", () => {
		const taskTypes = ["read", "study", "blog", "hands-on", "watch", "review", "practice-exam"];

		it("has an icon for every task type", () => {
			for (const type of taskTypes) {
				expect(TASK_TYPE_ICONS[type]).toBeTruthy();
			}
		});

		it("has a label for every task type", () => {
			for (const type of taskTypes) {
				expect(TASK_TYPE_LABELS[type]).toBeTruthy();
			}
		});

		it("icons and labels cover the same types", () => {
			expect(Object.keys(TASK_TYPE_ICONS).sort()).toEqual(Object.keys(TASK_TYPE_LABELS).sort());
		});
	});

	describe("RESOURCE_TYPE_ICONS", () => {
		const resourceTypes = ["docs", "blog", "video", "github", "practice-exam", "workshop"];

		it("has an icon for every resource type", () => {
			for (const type of resourceTypes) {
				expect(RESOURCE_TYPE_ICONS[type]).toBeTruthy();
			}
		});
	});

	describe("EXAM_INFO", () => {
		it("has correct exam code", () => {
			expect(EXAM_INFO.code).toBe("AIP-C01");
		});

		it("has 75 total questions with 65 scored", () => {
			expect(EXAM_INFO.totalQuestions).toBe(75);
			expect(EXAM_INFO.scoredQuestions).toBe(65);
			expect(EXAM_INFO.scoredQuestions).toBeLessThanOrEqual(EXAM_INFO.totalQuestions);
		});

		it("passing score is within valid range", () => {
			expect(EXAM_INFO.passingScore).toBeGreaterThan(0);
			expect(EXAM_INFO.passingScore).toBeLessThanOrEqual(EXAM_INFO.maxScore);
		});

		it("voucher cost is less than full cost", () => {
			expect(EXAM_INFO.voucherCost).toBeLessThan(EXAM_INFO.cost);
		});

		it("duration is 180 minutes", () => {
			expect(EXAM_INFO.duration).toBe(180);
		});
	});

	describe("NAV_ITEMS & SECONDARY_NAV", () => {
		it("all nav items have label, href, and icon", () => {
			for (const item of NAV_ITEMS) {
				expect(item.label).toBeTruthy();
				expect(item.href).toMatch(/^\//);
				expect(item.icon).toBeTruthy();
			}
		});

		it("all secondary nav items have label, href, and icon", () => {
			for (const item of SECONDARY_NAV) {
				expect(item.label).toBeTruthy();
				expect(item.href).toMatch(/^\//);
				expect(item.icon).toBeTruthy();
			}
		});

		it("no duplicate hrefs across all nav items", () => {
			const allHrefs = [...NAV_ITEMS, ...SECONDARY_NAV].map((i) => i.href);
			expect(new Set(allHrefs).size).toBe(allHrefs.length);
		});

		it("dashboard is the first nav item pointing to /", () => {
			expect(NAV_ITEMS[0].href).toBe("/");
			expect(NAV_ITEMS[0].label).toBe("Dashboard");
		});
	});
});
