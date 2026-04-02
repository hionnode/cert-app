import { useState, useMemo } from "react";
import { Brain, ChevronRight, CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { DOMAINS } from "../../lib/constants";
import type { PracticeQuestion } from "../../lib/types";

interface DayPracticeProps {
	questions: PracticeQuestion[];
	dayNumber: number;
}

const levelLabels: Record<number, { label: string; cls: string }> = {
	1: { label: "Foundation", cls: "bg-primary-100 text-primary-700" },
	2: { label: "Applied", cls: "bg-accent-gold/15 text-amber-700" },
	3: { label: "Expert", cls: "bg-red-100 text-red-700" },
};

export default function DayPractice({ questions, dayNumber }: DayPracticeProps) {
	const [activeLevel, setActiveLevel] = useState<1 | 2 | 3 | null>(null);
	const [currentIdx, setCurrentIdx] = useState(0);
	const [selected, setSelected] = useState<string | null>(null);
	const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
	const [showFeedback, setShowFeedback] = useState(false);
	const [score, setScore] = useState(0);
	const [answered, setAnswered] = useState(0);

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
								className="card p-4 text-left hover:border-primary-400 transition-all cursor-pointer"
							>
								<div className="flex items-center justify-between mb-2">
									<span className={`badge ${cfg.cls}`}>Level {level}</span>
									<span className="caption">{count} Qs</span>
								</div>
								<h4 className="text-sm font-semibold text-ink">{cfg.label}</h4>
								<p className="text-xs text-ink-muted mt-1">
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
		return (
			<div className="card-padded text-center py-8">
				<div className="text-3xl font-bold font-display mb-1" style={{ color: pct >= 75 ? "#1b7e4e" : "#e16e2e" }}>
					{score}/{answered}
				</div>
				<p className="caption mb-4">Level {activeLevel}: {levelLabels[activeLevel]?.label} — {pct}%</p>
				<div className="flex items-center justify-center gap-3">
					<button type="button" onClick={() => startLevel(activeLevel)} className="btn-ghost text-sm">
						<RotateCcw className="w-4 h-4" /> Retry
					</button>
					<button type="button" onClick={() => setActiveLevel(null)} className="btn-primary text-sm">
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
						<span className="badge bg-violet-100 text-violet-700">+D{q.integrationDomains.join("+D")}</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="caption">{currentIdx + 1}/{activeQuestions.length}</span>
					<button type="button" onClick={() => setActiveLevel(null)} className="text-xs text-ink-muted hover:text-ink">
						Exit
					</button>
				</div>
			</div>

			{/* Progress */}
			<div className="mx-4 mb-3">
				<div className="w-full h-1 bg-surface-2 rounded-full">
					<div className="h-1 bg-primary-500 rounded-full transition-all" style={{ width: `${((currentIdx + (showFeedback ? 1 : 0)) / activeQuestions.length) * 100}%` }} />
				</div>
			</div>

			{/* Question */}
			<div className="px-4 pb-4">
				<p className="text-sm font-medium text-ink mb-4">{q.question}</p>

				{/* Options (multiple-choice / multiple-response) */}
				{(q.type === "multiple-choice" || q.type === "multiple-response") && q.options && (
					<div className="space-y-2 mb-4">
						{q.options.map((opt) => {
							const letter = opt.charAt(0);
							const isSel = q.type === "multiple-choice" ? selected === letter : selectedMultiple.includes(letter);
							let style = "border-surface-3 hover:border-primary-300";
							if (showFeedback) {
								const isRight = q.type === "multiple-choice" ? letter === q.correctAnswer : (q.correctAnswers ?? []).includes(letter);
								if (isRight) style = "border-primary-500 bg-primary-50";
								else if (isSel) style = "border-red-400 bg-red-50";
								else style = "border-surface-3 opacity-50";
							} else if (isSel) {
								style = "border-secondary-500 bg-secondary-50";
							}
							return (
								<button
									key={letter}
									type="button"
									disabled={showFeedback}
									onClick={() => q.type === "multiple-choice" ? setSelected(letter) : toggleMultiple(letter)}
									className={`w-full text-left p-3 rounded-button border-2 transition-all cursor-pointer ${style}`}
								>
									<div className="flex items-start gap-2">
										<span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${isSel ? "bg-secondary-500 text-white" : "bg-surface-2 text-ink-muted"}`}>{letter}</span>
										<span className="text-sm text-ink">{opt.substring(3)}</span>
									</div>
								</button>
							);
						})}
					</div>
				)}

				{/* Feedback */}
				{showFeedback && (
					<div className={`rounded-card p-3 mb-4 text-sm ${isCorrect ? "bg-primary-50 border border-primary-200" : "bg-red-50 border border-red-200"}`}>
						<div className="flex items-center gap-2 mb-2">
							{isCorrect ? (
								<><CheckCircle className="w-4 h-4 text-primary-500" /><span className="font-semibold text-primary-700">Correct</span></>
							) : (
								<><XCircle className="w-4 h-4 text-red-500" /><span className="font-semibold text-red-700">Incorrect</span></>
							)}
						</div>
						<p className="text-ink-secondary whitespace-pre-line text-xs">{q.explanation}</p>
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
