import {
	defineConfig,
	presetUno,
	presetIcons,
	transformerVariantGroup,
} from "unocss";

// Khan Academy green + Coursera blue inspired palette
export default defineConfig({
	presets: [presetUno(), presetIcons({ scale: 1.2, cdn: "https://esm.sh/" })],
	transformers: [transformerVariantGroup()],
	theme: {
		colors: {
			// Primary - Khan Academy inspired greens
			primary: {
				50: "#f0fdf4",
				100: "#dcfce7",
				200: "#bbf7d0",
				300: "#86efac",
				400: "#4ade80",
				500: "#1b7e4e", // Khan Academy green
				600: "#14652e",
				700: "#166534",
				800: "#14532d",
				900: "#052e16",
			},
			// Secondary - Coursera blue
			secondary: {
				50: "#eff6ff",
				100: "#dbeafe",
				200: "#bfdbfe",
				300: "#93c5fd",
				400: "#60a5fa",
				500: "#0056d2", // Coursera blue
				600: "#1d4ed8",
				700: "#1e40af",
				800: "#1e3a8a",
				900: "#172554",
			},
			// Domain colors (for progress rings & badges)
			domain: {
				1: "#1b7e4e", // green - FM Integration (31%)
				2: "#0056d2", // blue - Implementation (26%)
				3: "#e16e2e", // orange - Safety/Security (20%)
				4: "#8b5cf6", // purple - Optimization (12%)
				5: "#e74c3c", // red - Testing (11%)
			},
			// Surfaces
			surface: {
				0: "#ffffff",
				1: "#f8faf9",
				2: "#f0f3f1",
				3: "#e8ece9",
			},
			// Text
			ink: {
				DEFAULT: "#1a2e1f",
				secondary: "#4a5c50",
				muted: "#7a8c80",
			},
			// Accents
			accent: {
				gold: "#f5a623",
				coral: "#ff6b6b",
				teal: "#2ec4b6",
			},
		},
		fontFamily: {
			sans: ["Lato", "system-ui", "-apple-system", "sans-serif"],
			display: [
				"Noto Sans",
				"Lato",
				"system-ui",
				"-apple-system",
				"sans-serif",
			],
			mono: ["JetBrains Mono", "Fira Code", "monospace"],
		},
		borderRadius: {
			card: "12px",
			button: "8px",
			badge: "6px",
			full: "9999px",
		},
	},
	shortcuts: {
		// Layout
		"page-container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
		"card":
			"bg-surface-0 rounded-card border border-surface-3 shadow-sm hover:shadow-md transition-shadow",
		"card-padded":
			"bg-surface-0 rounded-card border border-surface-3 shadow-sm p-5",

		// Typography
		"heading-1": "text-3xl font-bold font-display text-ink",
		"heading-2": "text-2xl font-bold font-display text-ink",
		"heading-3": "text-lg font-semibold text-ink",
		"body-text": "text-base text-ink-secondary leading-relaxed",
		"caption": "text-sm text-ink-muted",

		// Buttons
		"btn-primary":
			"inline-flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-button font-semibold hover:bg-primary-600 transition-colors",
		"btn-secondary":
			"inline-flex items-center gap-2 px-4 py-2 bg-secondary-500 text-white rounded-button font-semibold hover:bg-secondary-600 transition-colors",
		"btn-ghost":
			"inline-flex items-center gap-2 px-4 py-2 text-ink-secondary rounded-button hover:bg-surface-2 transition-colors",

		// Badges
		"badge":
			"inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-semibold",
		"badge-domain-1": "badge bg-primary-100 text-primary-700",
		"badge-domain-2": "badge bg-secondary-100 text-secondary-700",
		"badge-domain-3": "badge bg-orange-100 text-orange-700",
		"badge-domain-4": "badge bg-violet-100 text-violet-700",
		"badge-domain-5": "badge bg-red-100 text-red-700",

		// Nav
		"nav-link":
			"flex items-center gap-3 px-3 py-2.5 rounded-button text-ink-secondary hover:bg-surface-2 hover:text-ink transition-colors",
		"nav-link-active":
			"flex items-center gap-3 px-3 py-2.5 rounded-button bg-primary-50 text-primary-600 font-semibold",
	},
});
