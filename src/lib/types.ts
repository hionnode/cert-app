export interface Domain {
	id: number;
	name: string;
	shortName: string;
	weight: number;
	approxQuestions: number;
	color: string;
}

export interface StudyDay {
	number: number;
	weekday: string;
	title: string;
	week: number;
	domain: number;
	learningObjectives: string[];
	tasks: Task[];
	handsOn?: HandsOnActivity[];
	furtherReading?: FurtherReadingItem[];
	scenarioIds: string[];
	examSkills: string[];
	spacedRepetitionReview?: string[];
}

export interface HandsOnActivity {
	id: string;
	title: string;
	description: string;
	estimatedMinutes: number;
	url?: string;
	difficulty: "beginner" | "intermediate" | "advanced";
	steps?: string[];
}

export interface FurtherReadingItem {
	title: string;
	url: string;
	type: "blog" | "video" | "docs" | "github" | "workshop";
	description: string;
	estimatedMinutes?: number;
}

export interface Task {
	id: string;
	type: "read" | "study" | "blog" | "hands-on" | "watch" | "review" | "practice-exam";
	title: string;
	description: string;
	estimatedMinutes: number;
	url?: string;
}

export interface Scenario {
	id: string;
	number: string;
	domain: number;
	week: number;
	day: number;
	title: string;
	question: string;
	thinkPrompts: string[];
	answer: string;
	whyExplanation?: string;
	examSkills: string[];
	difficulty: "easy" | "medium" | "hard";
}

export interface ComparisonTable {
	id: string;
	title: string;
	domain: number;
	description?: string;
	columns: string[];
	rows: Record<string, string>[];
	examTriggerColumn?: string;
}

export interface WrongAnswerRule {
	id: string;
	trigger: string;
	answer: string;
	notThis?: string;
	domain: number;
}

export interface Resource {
	id: string;
	title: string;
	url: string;
	type: "docs" | "blog" | "video" | "github" | "practice-exam" | "workshop";
	domain?: number;
	tier?: number;
	topic?: string;
	estimatedMinutes?: number;
	description?: string;
}

export interface Architecture {
	id: string;
	title: string;
	description: string;
	steps: ArchitectureStep[];
	monitoring?: string;
	costNote?: string;
}

export interface ArchitectureStep {
	service: string;
	action: string;
	next?: string;
}

export interface OrderingSequence {
	id: string;
	title: string;
	steps: string[];
}

export interface MatchingExercise {
	id: string;
	title: string;
	pairs: { left: string; right: string }[];
}

export interface ServiceItem {
	name: string;
	category: string;
	checked?: boolean;
}

export interface ExamAttempt {
	id: string;
	source: string;
	date: string;
	score: number;
	total: number;
	domainScores?: Record<number, number>;
}

export type ScenarioRating = "got-it" | "partial" | "missed";

export interface UserProgress {
	version: number;
	tasksCompleted: Record<string, boolean>;
	scenarioRatings: Record<string, ScenarioRating>;
	scenarioNextReview: Record<string, string>;
	servicesChecked: string[];
	examAttempts: ExamAttempt[];
	drillScores: Record<string, number>;
	streak: { current: number; lastDate: string };
	lastVisitedDay: number;
}
