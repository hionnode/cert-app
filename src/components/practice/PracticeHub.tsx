import { useState, useMemo } from "react";
import { BookOpen, Layers, Zap, Crown, Shuffle } from "lucide-react";
import QuizCard from "./QuizCard";
import type { PracticeQuestion } from "../../lib/types";
import { DOMAINS } from "../../lib/constants";

interface PracticeHubProps {
	questions: PracticeQuestion[];
}

type FilterState = {
	domain: number | "all" | "integration";
	level: 1 | 2 | 3 | "all";
	active: boolean;
};

const levelConfig = [
	{ value: 1 as const, label: "Foundation", icon: BookOpen, desc: "Direct recall, single-service", cls: "border-accent-aqua hover:bg-surface-2" },
	{ value: 2 as const, label: "Applied", icon: Layers, desc: "Scenario-based, multi-service", cls: "border-accent-yellow/50 hover:bg-accent-yellow/5" },
	{ value: 3 as const, label: "Expert", icon: Crown, desc: "Complex trade-offs, architecture", cls: "border-accent-red hover:bg-accent-red/10" },
];

function shuffleArray<T>(arr: T[]): T[] {
	const shuffled = [...arr];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export default function PracticeHub({ questions }: PracticeHubProps) {
	const [filter, setFilter] = useState<FilterState>({ domain: "all", level: "all", active: false });

	const filteredQuestions = useMemo(() => {
		let qs = questions;

		if (filter.domain === "integration") {
			qs = qs.filter((q) => q.integrationDomains.length > 0);
		} else if (filter.domain !== "all") {
			qs = qs.filter((q) => q.domain === filter.domain || q.integrationDomains.includes(filter.domain as number));
		}

		if (filter.level !== "all") {
			qs = qs.filter((q) => q.level === filter.level);
		}

		return shuffleArray(qs);
	}, [questions, filter.domain, filter.level]);

	// Stats
	const totalByDomain = useMemo(() => {
		const counts: Record<string, number> = { all: questions.length, integration: 0 };
		for (const d of DOMAINS) counts[d.id] = 0;
		for (const q of questions) {
			counts[q.domain] = (counts[q.domain] ?? 0) + 1;
			if (q.integrationDomains.length > 0) counts.integration++;
		}
		return counts;
	}, [questions]);

	const totalByLevel = useMemo(() => {
		const counts: Record<string, number> = { all: questions.length };
		for (const q of questions) {
			counts[q.level] = (counts[q.level] ?? 0) + 1;
		}
		return counts;
	}, [questions]);

	if (filter.active && filteredQuestions.length > 0) {
		const domainLabel = filter.domain === "all" ? "All Domains" : filter.domain === "integration" ? "Cross-Domain" : `Domain ${filter.domain}`;
		const levelLabel = filter.level === "all" ? "All Levels" : `Level ${filter.level}`;
		return (
			<div>
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="heading-3">{domainLabel} - {levelLabel}</h2>
						<p className="caption">{filteredQuestions.length} questions</p>
					</div>
					<button
						type="button"
						onClick={() => setFilter({ ...filter, active: false })}
						className="btn-ghost text-sm"
					>
						Back to Selection
					</button>
				</div>
				<QuizCard questions={filteredQuestions} title={`${domainLabel} - ${levelLabel}`} />
			</div>
		);
	}

	return (
		<div>
			{/* Domain Selection */}
			<section className="mb-8">
				<h2 className="heading-3 mb-4">Select Domain</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{/* All domains */}
					<button
						type="button"
						onClick={() => setFilter({ ...filter, domain: "all" })}
						className={`card p-4 text-left transition-all cursor-pointer ${
							filter.domain === "all" ? "border-accent-aqua bg-surface-2" : "hover:border-accent-aqua"
						}`}
					>
						<div className="flex items-center justify-between mb-1">
							<span className="badge bg-surface-2 text-accent-aqua">All</span>
							<span className="caption">{totalByDomain.all} Qs</span>
						</div>
						<h3 className="body-text font-semibold text-ink">All Domains</h3>
						<p className="caption">Full practice across everything</p>
					</button>

					{/* Per domain */}
					{DOMAINS.map((d) => (
						<button
							key={d.id}
							type="button"
							onClick={() => setFilter({ ...filter, domain: d.id })}
							className={`card p-4 text-left transition-all cursor-pointer ${
								filter.domain === d.id ? "" : ""
							}`}
							style={{
								borderColor: filter.domain === d.id ? d.color : undefined,
								backgroundColor: filter.domain === d.id ? `${d.color}10` : undefined,
							}}
						>
							<div className="flex items-center justify-between mb-1">
								<span className={`badge-domain-${d.id}`}>D{d.id}</span>
								<span className="caption">{totalByDomain[d.id] ?? 0} Qs</span>
							</div>
							<h3 className="body-text font-semibold text-ink">{d.shortName}</h3>
							<p className="caption">{d.weight}% of exam</p>
						</button>
					))}

					{/* Integration */}
					<button
						type="button"
						onClick={() => setFilter({ ...filter, domain: "integration" })}
						className={`card p-4 text-left transition-all cursor-pointer ${
							filter.domain === "integration" ? "border-accent-purple bg-surface-2" : "hover:border-accent-purple"
						}`}
					>
						<div className="flex items-center justify-between mb-1">
							<span className="badge border border-accent-purple text-accent-purple">Cross</span>
							<span className="caption">{totalByDomain.integration} Qs</span>
						</div>
						<h3 className="body-text font-semibold text-ink">Cross-Domain</h3>
						<p className="caption">Integration questions spanning multiple domains</p>
					</button>
				</div>
			</section>

			{/* Level Selection */}
			<section className="mb-8">
				<h2 className="heading-3 mb-4">Select Level</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
					<button
						type="button"
						onClick={() => setFilter({ ...filter, level: "all" })}
						className={`card p-4 text-left transition-all cursor-pointer ${
							filter.level === "all" ? "border-accent-aqua bg-surface-2" : "hover:border-accent-aqua"
						}`}
					>
						<Shuffle className="w-5 h-5 text-accent-aqua mb-2" />
						<h3 className="body-text font-semibold">All Levels</h3>
						<p className="caption">{totalByLevel.all} questions</p>
					</button>
					{levelConfig.map(({ value, label, icon: Icon, desc, cls }) => (
						<button
							key={value}
							type="button"
							onClick={() => setFilter({ ...filter, level: value })}
							className={`card p-4 text-left transition-all cursor-pointer ${
								filter.level === value ? `${cls.replace("hover:", "")}` : cls
							}`}
						>
							<Icon className="w-5 h-5 mb-2 text-ink-secondary" />
							<h3 className="body-text font-semibold">Level {value}: {label}</h3>
							<p className="caption">{desc}</p>
							<p className="caption mt-1">{totalByLevel[value] ?? 0} questions</p>
						</button>
					))}
				</div>
			</section>

			{/* Start button */}
			<div className="text-center">
				<p className="caption mb-3">
					{filteredQuestions.length} questions selected
				</p>
				<button
					type="button"
					onClick={() => {
						if (filteredQuestions.length > 0) setFilter({ ...filter, active: true });
					}}
					disabled={filteredQuestions.length === 0}
					className={`btn-primary text-lg px-8 py-3 ${filteredQuestions.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
				>
					<Zap className="w-5 h-5" />
					Start Practice ({filteredQuestions.length} Qs)
				</button>
			</div>
		</div>
	);
}
