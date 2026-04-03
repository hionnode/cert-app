/// <reference types="vitest/config" />
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./src/tests/setup.ts"],
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		css: false,
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
});
