import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

const VIEWPORTS = [
	{ name: "desktop", width: 1440, height: 900 },
	{ name: "mobile", width: 375, height: 812 },
];

const PAGES = [
	"/",
	"/step/1",
	"/step/12",
	"/step/28",
	"/skills",
	"/reference",
	"/api",
	"/practice",
	"/plan",
];

mkdirSync(".audit-screenshots", { recursive: true });

test.describe("visual audit", () => {
	for (const vp of VIEWPORTS) {
		for (const url of PAGES) {
			test(`${vp.name} ${url}`, async ({ page }) => {
				const errors: string[] = [];
				page.on("pageerror", (e) => errors.push(String(e)));
				page.on("console", (msg) => {
					if (msg.type() === "error") errors.push(msg.text());
				});

				await page.setViewportSize({
					width: vp.width,
					height: vp.height,
				});
				await page.goto(url);
				await page.waitForLoadState("networkidle");

				const slug = url === "/" ? "_root" : url.replace(/\//g, "_");
				await page.screenshot({
					path: `.audit-screenshots/${vp.name}${slug}.png`,
					fullPage: true,
				});

				// Surface console errors but don't block the whole run.
				if (errors.length > 0) {
					console.warn(`[${vp.name} ${url}] console errors:`, errors);
				}
				expect(errors, `console errors on ${url}`).toEqual([]);
			});
		}
	}
});
