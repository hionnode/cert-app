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

// Exam Skills Types
export interface ExamSkillResource {
	title: string;
	url: string;
	type: "docs" | "blog" | "video" | "github" | "workshop";
}

export interface SkillScenario {
	question: string;
	thinkPrompts: string[];
	answer: string;
	difficulty: "beginner" | "intermediate" | "advanced";
}

export interface ExamSkill {
	id: string;
	taskId: string;
	taskTitle: string;
	domain: number;
	description: string;
	scenarios: SkillScenario[];
	resources: ExamSkillResource[];
}

// Practice Exam Types
export type QuestionType = "multiple-choice" | "multiple-response" | "ordering" | "matching";

export interface PracticeQuestion {
	id: string;
	domain: number;
	level: 1 | 2 | 3;
	type: QuestionType;
	integrationDomains: number[];
	question: string;
	options?: string[];
	correctAnswer?: string;
	correctAnswers?: string[];
	correctOrder?: number[];
	leftItems?: string[];
	rightItems?: string[];
	correctMatches?: Record<string, string>;
	explanation: string;
	examSkills: string[];
	tags: string[];
}

export interface QuizState {
	questionIndex: number;
	answers: Record<string, string | string[] | number[] | Record<string, string>>;
	showResult: boolean;
	score: number;
	total: number;
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
	skillScenariosViewed: Record<string, number[]>;
	handsOnCompleted: Record<string, boolean>;
	streak: { current: number; lastDate: string };
	lastVisitedDay: number;
}
