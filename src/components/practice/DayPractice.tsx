import { useState, useMemo } from "react";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { saveQuestionResult } from "../../lib/progress";
import type { PracticeQuestion } from "../../lib/types";

interface DayPracticeProps {
	questions: PracticeQuestion[];
	dayNumber: number;
}

const levelLabels: Record<number, { label: string; cls: string }> = {
	1: { label: "Foundation", cls: "bg-surface-2 text-accent-aqua" },
	2: { label: "Applied", cls: "bg-surface-2 text-accent-yellow" },
	3: { label: "Expert", cls: "bg-surface-2 text-accent-red" },
};

export default function DayPractice({ questions, dayNumber }: DayPracticeProps) {
	const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | null>(null);
	const [currentIdx, setCurrentIdx] = useState(0);
	const [selected, setSelected] = useState<string | null>(null);
	const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
	const [showFeedback, setShowFeedback] = useState(false);
	const [score, setScore] = useState(0);
	const [answered, setAnswered] = useState(0);
	const [sessionResults, setSessionResults] = useState<Array<{ domain: number; correct: boolean }>>([]);

	const byLevel = useMemo(() => {
		const groups: Record<number, PracticeQuestion[]> = { 1: [], 2: [], 3: [] };
		for (const q of questions) {
			(groups[q.level] ??= []).push(q);
		}
		return groups;
	}, [questions]);

	const activeQuestions = activeLevel ? byLevel[activeLevel] ?? [] : [];
	const q = activeQuestions[currentIdx];
	const isComplete = activeLevel !== null && currentIdx >= activeQuestions.length && answered > 0;

	function startLevel(level: 1 | 2 | 3) {
		setActiveLevel(level);
		setCurrentIdx(0);
		setSelected(null);
		setSelectedMultiple([]);
		setShowFeedback(false);
		setScore(0);
		setAnswered(0);
		setSessionResults([]);
	}

	function checkAnswer() {
		if (!q) return;
		let correct = false;
		if (q.type === "multiple-choice") {
			correct = selected === q.correctAnswer;
		} else if (q.type === "multiple-response") {
			const sorted = [...selectedMultiple].sort();
			const expected = [...(q.correctAnswers ?? [])].sort();
			correct = sorted.length === expected.length && sorted.every((v, i) => v === expected[i]);
		}
		saveQuestionResult(q.id, correct);
		setSessionResults((rs) => [...rs, { domain: q.domain, correct }]);
		if (correct) setScore((s) => s + 1);
		setAnswered((a) => a + 1);
		setShowFeedback(true);
	}

	function nextQuestion() {
		setCurrentIdx((i) => i + 1);
		setSelected(null);
		setSelectedMultiple([]);
		setShowFeedback(false);
	}

	function toggleMultiple(opt: string) {
		setSelectedMultiple((prev) =>
			prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
		);
	}

	// Level selection view
	if (activeLevel === null || questions.length === 0) {
		return (
			<div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
					{([1, 2, 3] as const).map((level) => {
						const count = byLevel[level]?.length ?? 0;
						if (count === 0) return null;
						const cfg = levelLabels[level];
						return (
							<button
								key={level}
								type="button"
								onClick={() => startLevel(level)}
								className="card p-4 text-left hover:border-accent-aqua transition-all cursor-pointer"
							>
								<div className="flex items-center justify-between mb-2">
									<span className={`badge ${cfg.cls}`}>Level {level}</span>
									<span className="caption">{count} Qs</span>
								</div>
								<h4 className="body-text font-semibold text-ink">{cfg.label}</h4>
								<p className="caption mt-1">
									{level === 1 && "Recall & identification"}
									{level === 2 && "Scenario-based application"}
									{level === 3 && "Complex trade-off analysis"}
								</p>
							</button>
						);
					})}
				</div>
				{questions.length === 0 && (
					<p className="caption text-center py-6">No practice questions mapped to this day yet.</p>
				)}
			</div>
		);
	}

	// Complete view
	if (isComplete) {
		const pct = Math.round((score / answered) * 100);
		const byDomain = sessionResults.reduce<Record<number, { correct: number; total: number }>>(
			(acc, r) => {
				acc[r.domain] ??= { correct: 0, total: 0 };
				acc[r.domain].total += 1;
				if (r.correct) acc[r.domain].correct += 1;
				return acc;
			},
			{},
		);
		const domainRows = Object.entries(byDomain).sort(
			([, a], [, b]) => a.correct / a.total - b.correct / b.total,
		);
		return (
			<div className="card-padded text-center py-8">
				<div
					className="text-3xl font-bold font-mono mb-1"
					style={{ color: pct >= 75 ? "var(--grv-green)" : "var(--grv-orange)" }}
				>
					{score}/{answered}
				</div>
				<p className="caption mb-4">
					Level {activeLevel}: {levelLabels[activeLevel]?.label} — {pct}%
				</p>
				{domainRows.length > 1 && (
					<div className="max-w-md mx-auto mb-4">
						<p className="caption mb-2 text-left">By domain</p>
						<ul className="space-y-1">
							{domainRows.map(([d, s]) => {
								const dp = Math.round((s.correct / s.total) * 100);
								return (
									<li
										key={d}
										className="flex items-center justify-between caption"
									>
										<span>Domain {d}</span>
										<span
											className={
												dp < 60
													? "text-accent-red"
													: dp < 80
														? "text-accent-yellow"
														: "text-accent-aqua"
											}
										>
											{s.correct}/{s.total} · {dp}%
										</span>
									</li>
								);
							})}
						</ul>
					</div>
				)}
				<div className="flex items-center justify-center gap-3">
					<button
						type="button"
						onClick={() => startLevel(activeLevel)}
						className="btn-ghost text-sm"
					>
						<RotateCcw className="w-4 h-4" /> Retry
					</button>
					<button
						type="button"
						onClick={() => setActiveLevel(null)}
						className="btn-primary text-sm"
					>
						Back to Levels
					</button>
				</div>
			</div>
		);
	}

	if (!q) {
		setActiveLevel(null);
		return null;
	}

	const isCorrect =
		q.type === "multiple-choice"
			? selected === q.correctAnswer
			: [...selectedMultiple].sort().join() === [...(q.correctAnswers ?? [])].sort().join();

	return (
		<div className="card overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between px-4 pt-4 pb-2">
				<div className="flex items-center gap-2">
					<span className={`badge ${levelLabels[q.level]?.cls}`}>L{q.level}</span>
					<span className={`badge-domain-${q.domain}`}>D{q.domain}</span>
					{q.integrationDomains.length > 0 && (
						<span className="badge border border-accent-purple text-accent-purple">+D{q.integrationDomains.join("+D")}</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="caption">{currentIdx + 1}/{activeQuestions.length}</span>
					<button type="button" onClick={() => setActiveLevel(null)} className="caption hover:text-ink">
						Exit
					</button>
				</div>
			</div>

			{/* Progress */}
			<div className="mx-4 mb-3">
				<div className="w-full h-1 bg-surface-2 rounded-sm">
					<div className="h-1 bg-accent-aqua rounded-sm transition-all" style={{ width: `${((currentIdx + (showFeedback ? 1 : 0)) / activeQuestions.length) * 100}%` }} />
				</div>
			</div>

			{/* Question */}
			<div className="px-4 pb-4">
				<p className="body-text font-medium text-ink mb-4">{q.question}</p>

				{/* Options (multiple-choice / multiple-response) */}
				{(q.type === "multiple-choice" || q.type === "multiple-response") && q.options && (
					<div className="space-y-2 mb-4">
						{q.options.map((opt) => {
							const letter = opt.charAt(0);
							const isSel = q.type === "multiple-choice" ? selected === letter : selectedMultiple.includes(letter);
							let style = "border-surface-3 hover:border-accent-aqua";
							if (showFeedback) {
								const isRight = q.type === "multiple-choice" ? letter === q.correctAnswer : (q.correctAnswers ?? []).includes(letter);
								if (isRight) style = "border-accent-aqua bg-surface-2";
								else if (isSel) style = "border-accent-red bg-accent-red/10";
								else style = "border-surface-3 opacity-50";
							} else if (isSel) {
								style = "border-accent-blue bg-surface-2";
							}
							return (
								<button
									key={letter}
									type="button"
									disabled={showFeedback}
									onClick={() => q.type === "multiple-choice" ? setSelected(letter) : toggleMultiple(letter)}
									className={`w-full text-left p-3 rounded-button border transition-all cursor-pointer ${style}`}
								>
									<div className="flex items-start gap-2">
										<span className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSel ? "bg-accent-blue text-surface-0" : "bg-surface-2 text-ink-muted"}`}>{letter}</span>
										<span className="body-text text-ink">{opt.substring(3)}</span>
									</div>
								</button>
							);
						})}
					</div>
				)}

				{/* Feedback */}
				{showFeedback && (
					<div className={`rounded-card p-3 mb-4 text-sm ${isCorrect ? "bg-surface-2 border border-accent-aqua" : "bg-accent-red/10 border border-accent-red"}`}>
						<div className="flex items-center gap-2 mb-2">
							{isCorrect ? (
								<><CheckCircle className="w-4 h-4 text-accent-aqua" /><span className="font-semibold text-accent-aqua">Correct</span></>
							) : (
								<><XCircle className="w-4 h-4 text-accent-red" /><span className="font-semibold text-accent-red">Incorrect</span></>
							)}
						</div>
						<p className="text-ink-secondary whitespace-pre-line caption">{q.explanation}</p>
					</div>
				)}

				{/* Actions */}
				<div className="flex justify-end">
					{!showFeedback ? (
						<button
							type="button"
							disabled={!selected && selectedMultiple.length === 0}
							onClick={checkAnswer}
							className={`btn-primary text-sm ${!selected && selectedMultiple.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
						>
							Check
						</button>
					) : (
						<button type="button" onClick={nextQuestion} className="btn-primary text-sm">
							{currentIdx + 1 >= activeQuestions.length ? "See Results" : "Next"}
							<ArrowRight className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
