import type { Domain } from "./types";

export const DOMAINS: Domain[] = [
	{
		id: 1,
		name: "FM Integration, Data Management, and Compliance",
		shortName: "FM Integration",
		weight: 31,
		approxQuestions: 20,
		color: "var(--grv-domain-1)",
	},
	{
		id: 2,
		name: "Implementation and Integration",
		shortName: "Implementation",
		weight: 26,
		approxQuestions: 17,
		color: "var(--grv-domain-2)",
	},
	{
		id: 3,
		name: "AI Safety, Security, and Governance",
		shortName: "Safety & Security",
		weight: 20,
		approxQuestions: 13,
		color: "var(--grv-domain-3)",
	},
	{
		id: 4,
		name: "Operational Efficiency and Optimization",
		shortName: "Optimization",
		weight: 12,
		approxQuestions: 8,
		color: "var(--grv-domain-4)",
	},
	{
		id: 5,
		name: "Testing, Validation, and Troubleshooting",
		shortName: "Testing",
		weight: 11,
		approxQuestions: 7,
		color: "var(--grv-domain-5)",
	},
];

export const WEEKS = [
	{ number: 1, title: "FM Integration, RAG, and Vector Stores", days: [1, 2, 3, 4, 5, 6, 7] },
	{ number: 2, title: "Implementation, Agents, and Hands-On", days: [8, 9, 10, 11, 12, 13, 14] },
	{
		number: 3,
		title: "Security, Governance, Optimization, Testing",
		days: [15, 16, 17, 18, 19, 20, 21],
	},
	{ number: 4, title: "Practice Exams and Refinement", days: [22, 23, 24, 25, 26, 27, 28] },
];

export const TASK_TYPE_ICONS: Record<string, string> = {
	read: "i-lucide-book-open",
	study: "i-lucide-graduation-cap",
	blog: "i-lucide-newspaper",
	"hands-on": "i-lucide-wrench",
	watch: "i-lucide-play-circle",
	review: "i-lucide-refresh-cw",
	"practice-exam": "i-lucide-file-check",
};

export const TASK_TYPE_LABELS: Record<string, string> = {
	read: "Read",
	study: "Study",
	blog: "Blog",
	"hands-on": "Hands-on",
	watch: "Watch",
	review: "Review",
	"practice-exam": "Practice Exam",
};

export const RESOURCE_TYPE_ICONS: Record<string, string> = {
	docs: "i-lucide-file-text",
	blog: "i-lucide-newspaper",
	video: "i-lucide-play-circle",
	github: "i-lucide-github",
	"practice-exam": "i-lucide-file-check",
	workshop: "i-lucide-flask-conical",
};

export const EXAM_INFO = {
	name: "AWS Certified Generative AI Developer - Professional",
	code: "AIP-C01",
	duration: 180,
	totalQuestions: 75,
	scoredQuestions: 65,
	passingScore: 750,
	maxScore: 1000,
	cost: 300,
	voucherCost: 150,
};

export const NAV_ITEMS = [
	{ label: "Dashboard", href: "/", icon: "i-lucide-layout-dashboard" },
	{ label: "Plan", href: "/plan", icon: "i-lucide-calendar" },
	{ label: "Scenarios", href: "/scenarios", icon: "i-lucide-lightbulb" },
	{ label: "Skills", href: "/skills", icon: "i-lucide-shield-check" },
] as const;

export const SECONDARY_NAV = [
	{ label: "Practice", href: "/practice", icon: "i-lucide-brain" },
	{ label: "Reference", href: "/reference", icon: "i-lucide-table-2" },
	{ label: "Resources", href: "/resources", icon: "i-lucide-library" },
] as const;
