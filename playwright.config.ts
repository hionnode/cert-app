import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "./scripts",
	testMatch: /visual-audit\.ts/,
	fullyParallel: true,
	reporter: [["list"]],
	use: {
		baseURL: "http://localhost:4321",
		trace: "off",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
	webServer: {
		command: "npm run dev",
		url: "http://localhost:4321",
		reuseExistingServer: true,
		timeout: 120_000,
	},
});
