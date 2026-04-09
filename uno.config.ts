import {
	defineConfig,
	presetUno,
	presetIcons,
	transformerVariantGroup,
} from "unocss";

export default defineConfig({
	presets: [
		presetUno({ dark: "class" }),
		presetIcons({ scale: 1.2, cdn: "https://esm.sh/" }),
	],
	transformers: [transformerVariantGroup()],
	preflights: [
		{
			getCSS: () => `
				:root {
					--grv-bg0: #fbf1c7;
					--grv-bg0-s: #f2e5bc;
					--grv-bg1: #ebdbb2;
					--grv-bg2: #d5c4a1;
					--grv-bg3: #bdae93;
					--grv-bg4: #a89984;
					--grv-fg: #3c3836;
					--grv-fg2: #504945;
					--grv-fg3: #665c54;
					--grv-fg4: #7c6f64;
					--grv-red: #cc241d;
					--grv-green: #98971a;
					--grv-yellow: #d79921;
					--grv-blue: #458588;
					--grv-purple: #b16286;
					--grv-aqua: #689d6a;
					--grv-orange: #d65d0e;
					--grv-domain-1: #79740e;
					--grv-domain-2: #076678;
					--grv-domain-3: #af3a03;
					--grv-domain-4: #8f3f71;
					--grv-domain-5: #9d0006;
				}
				.dark {
					--grv-bg0: #282828;
					--grv-bg0-s: #32302f;
					--grv-bg1: #3c3836;
					--grv-bg2: #504945;
					--grv-bg3: #665c54;
					--grv-bg4: #7c6f64;
					--grv-fg: #ebdbb2;
					--grv-fg2: #d5c4a1;
					--grv-fg3: #bdae93;
					--grv-fg4: #a89984;
					--grv-red: #fb4934;
					--grv-green: #b8bb26;
					--grv-yellow: #fabd2f;
					--grv-blue: #83a598;
					--grv-purple: #d3869b;
					--grv-aqua: #8ec07c;
					--grv-orange: #fe8019;
					--grv-domain-1: #b8bb26;
					--grv-domain-2: #83a598;
					--grv-domain-3: #fe8019;
					--grv-domain-4: #d3869b;
					--grv-domain-5: #fb4934;
				}
				body {
					font-family: '0xProto Nerd Font Mono', '0xProto', 'JetBrains Mono', monospace;
					font-size: 16px;
				}
			`,
		},
	],
	theme: {
		colors: {
			surface: {
				0: "var(--grv-bg0)",
				1: "var(--grv-bg0-s)",
				2: "var(--grv-bg1)",
				3: "var(--grv-bg2)",
				4: "var(--grv-bg3)",
			},
			ink: {
				DEFAULT: "var(--grv-fg)",
				secondary: "var(--grv-fg2)",
				muted: "var(--grv-fg4)",
			},
			accent: {
				red: "var(--grv-red)",
				green: "var(--grv-green)",
				yellow: "var(--grv-yellow)",
				blue: "var(--grv-blue)",
				purple: "var(--grv-purple)",
				aqua: "var(--grv-aqua)",
				orange: "var(--grv-orange)",
			},
			domain: {
				1: "var(--grv-domain-1)",
				2: "var(--grv-domain-2)",
				3: "var(--grv-domain-3)",
				4: "var(--grv-domain-4)",
				5: "var(--grv-domain-5)",
			},
		},
		fontFamily: {
			mono: ["0xProto Nerd Font Mono", "0xProto", "JetBrains Mono", "monospace"],
		},
		borderRadius: {
			sm: "2px",
			card: "4px",
			button: "4px",
			badge: "3px",
			full: "9999px",
		},
	},
	shortcuts: {
		// Layout
		"page-container": "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
		card: "bg-surface-1 border border-surface-3 rounded-card",
		"card-padded": "bg-surface-1 border border-surface-3 rounded-card p-5",

		// Typography
		"heading-1": "text-3xl font-bold font-mono text-ink tracking-tight leading-tight",
		"heading-2": "text-2xl font-bold font-mono text-ink tracking-tight leading-snug",
		"heading-3": "text-lg font-semibold font-mono text-ink leading-snug",
		"body-text": "text-base font-mono text-ink-secondary leading-relaxed",
		"body-sm": "text-[15px] font-mono text-ink-secondary leading-relaxed",
		caption: "text-sm font-mono text-ink-muted tracking-wide",
		"caption-sm": "text-[13px] font-mono text-ink-muted tracking-wide",

		// Buttons
		"btn-primary":
			"inline-flex items-center gap-2.5 px-5 py-2.5 bg-accent-aqua text-surface-0 rounded-button font-semibold font-mono text-base hover:brightness-110 transition-colors",
		"btn-secondary":
			"inline-flex items-center gap-2.5 px-5 py-2.5 border border-accent-aqua text-accent-aqua rounded-button font-mono text-base hover:bg-accent-aqua/10 transition-colors",
		"btn-ghost":
			"inline-flex items-center gap-2.5 px-5 py-2.5 text-ink-muted rounded-button font-mono text-base hover:text-ink hover:bg-surface-2 transition-colors",

		// Badges
		badge:
			"inline-flex items-center px-2 py-1 rounded-badge text-[13px] font-mono",
		"badge-muted": "inline-flex items-center px-2 py-1 rounded-badge text-[13px] font-mono bg-surface-2 text-ink-muted",
		"badge-domain-1": "badge border border-domain-1 text-domain-1",
		"badge-domain-2": "badge border border-domain-2 text-domain-2",
		"badge-domain-3": "badge border border-domain-3 text-domain-3",
		"badge-domain-4": "badge border border-domain-4 text-domain-4",
		"badge-domain-5": "badge border border-domain-5 text-domain-5",

		// Nav
		"nav-link":
			"flex items-center gap-2.5 px-5 py-2.5 text-base font-mono text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors",
		"nav-link-active":
			"flex items-center gap-2.5 px-5 py-2.5 text-base font-mono text-accent-aqua font-semibold border-l-3 border-accent-aqua",
	},
});
