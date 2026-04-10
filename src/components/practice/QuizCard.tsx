import { useState } from "react";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, ChevronLeft } from "lucide-react";
import type { PracticeQuestion } from "../../lib/types";
import { DOMAINS } from "../../lib/constants";

interface QuizCardProps {
	questions: PracticeQuestion[];
	title: string;
}

type Phase = "answering" | "feedback" | "complete";

const levelLabels: Record<number, { label: string; cls: string }> = {
	1: { label: "Foundation", cls: "bg-surface-2 text-accent-aqua" },
	2: { label: "Applied", cls: "bg-surface-2 text-accent-yellow" },
	3: { label: "Expert", cls: "bg-surface-2 text-accent-red" },
};

export default function QuizCard({ questions, title }: QuizCardProps) {
	const [currentIdx, setCurrentIdx] = useState(0);
	const [selected, setSelected] = useState<string | null>(null);
	const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
	const [phase, setPhase] = useState<Phase>("answering");
	const [score, setScore] = useState(0);
	const [answered, setAnswered] = useState(0);
	const [answeredSet, setAnsweredSet] = useState<Set<number>>(new Set());

	const q = questions[currentIdx];
	if (!q) return null;

	const isComplete = phase === "complete";
	const domain = DOMAINS.find((d) => d.id === q.domain);
	const level = levelLabels[q.level] ?? levelLabels[1];

	function checkAnswer() {
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
		setAnsweredSet((prev) => new Set(prev).add(currentIdx));
		setPhase("feedback");
	}

	function nextQuestion() {
		if (currentIdx + 1 >= questions.length) {
			setPhase("complete");
			return;
		}
		setCurrentIdx((i) => i + 1);
		setSelected(null);
		setSelectedMultiple([]);
		setPhase("answering");
	}

	function restart() {
		setCurrentIdx(0);
		setSelected(null);
		setSelectedMultiple([]);
		setPhase("answering");
		setScore(0);
		setAnswered(0);
	}

	function toggleMultiple(opt: string) {
		setSelectedMultiple((prev) =>
			prev.includes(opt) ? prev.filter((o) => o !== opt) : [...prev, opt],
		);
	}

	if (isComplete) {
		const pct = Math.round((score / questions.length) * 100);
		const passed = pct >= 75;
		return (
			<div className="card-padded text-center py-10">
				<Trophy className={`w-16 h-16 mx-auto mb-4 ${passed ? "text-accent-aqua" : "text-accent-yellow"}`} />
				<h2 className="heading-2 mb-2">{passed ? "Great job!" : "Keep practicing!"}</h2>
				<div className="text-4xl font-bold font-mono mb-1" style={{ color: passed ? "var(--grv-green)" : "var(--grv-orange)" }}>
					{score}/{questions.length}
				</div>
				<p className="caption mb-1">{pct}% correct</p>
				<p className="body-text mb-6">{title}</p>
				<div className="flex items-center justify-center gap-4">
					<button type="button" onClick={restart} className="btn-primary">
						<RotateCcw className="w-4 h-4" /> Try Again
					</button>
				</div>
			</div>
		);
	}

	const isCorrect =
		q.type === "multiple-choice"
			? selected === q.correctAnswer
			: q.type === "multiple-response"
				? [...selectedMultiple].sort().join() === [...(q.correctAnswers ?? [])].sort().join()
				: false;

	return (
		<div>
			{/* Dot navigation */}
			{questions.length > 1 && (
				<>
					<div className={`flex items-center justify-center ${questions.length > 10 ? "gap-1" : "gap-1.5"} mb-5`}>
						{questions.map((_, i) => {
							const isAnswered = answeredSet.has(i);
							const isActive = i === currentIdx;
							let dotClass = "bg-surface-3 hover:bg-surface-4";
							if (isAnswered) dotClass = "bg-accent-aqua";
							if (isActive) dotClass = "bg-accent-yellow ring-1 ring-accent-yellow ring-offset-1 ring-offset-surface-0";
							const compact = questions.length > 10;
							const sizeClass = isActive
								? compact ? "w-6 h-2" : "w-8 h-2.5"
								: compact ? "w-4 h-1.5" : "w-6 h-2";
							return (
								<button
									key={i}
									type="button"
									className={`${sizeClass} rounded-full cursor-pointer transition-all duration-200 ${dotClass}`}
									aria-label={`Question ${i + 1}`}
									disabled
								/>
							);
						})}
					</div>
					<div className="flex items-center justify-between mb-4">
						<span className="caption">Question {currentIdx + 1} of {questions.length}</span>
						<span className="caption">{answeredSet.size}/{questions.length} answered</span>
					</div>
				</>
			)}

			<div className="card overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between gap-2 px-6 pt-6 pb-4">
				<div className="flex items-center gap-2 flex-wrap">
					<span className={`badge-domain-${q.domain}`}>D{q.domain}</span>
					<span className={`badge ${level.cls}`}>{level.label}</span>
					{q.integrationDomains.length > 0 && (
						<span className="badge border border-accent-purple text-accent-purple">
							+D{q.integrationDomains.join("+D")}
						</span>
					)}
				</div>
			</div>

			{/* Question */}
			<div className="px-6 pb-6">
				<p className="body-text mb-5 font-medium text-ink">{q.question}</p>

				{/* Multiple Choice / Multiple Response Options */}
				{(q.type === "multiple-choice" || q.type === "multiple-response") && q.options && (
					<div className="space-y-2 mb-5">
						{q.options.map((opt) => {
							const letter = opt.charAt(0);
							const isSelected =
								q.type === "multiple-choice"
									? selected === letter
									: selectedMultiple.includes(letter);

							let optionStyle = "border-surface-3 hover:border-accent-aqua";
							if (phase === "feedback") {
								const isCorrectOpt =
									q.type === "multiple-choice"
										? letter === q.correctAnswer
										: (q.correctAnswers ?? []).includes(letter);
								if (isCorrectOpt) {
									optionStyle = "border-accent-aqua bg-surface-2";
								} else if (isSelected && !isCorrectOpt) {
									optionStyle = "border-accent-red bg-accent-red/10";
								} else {
									optionStyle = "border-surface-3 opacity-60";
								}
							} else if (isSelected) {
								optionStyle = "border-accent-blue bg-surface-2";
							}

							return (
								<button
									key={letter}
									type="button"
									disabled={phase === "feedback"}
									onClick={() => {
										if (q.type === "multiple-choice") setSelected(letter);
										else toggleMultiple(letter);
									}}
									className={`w-full text-left p-4 rounded-card border transition-all cursor-pointer ${optionStyle}`}
								>
									<div className="flex items-start gap-3">
										<span className={`w-7 h-7 rounded-sm flex items-center justify-center text-sm font-bold flex-shrink-0 ${
											isSelected
												? "bg-accent-blue text-surface-0"
												: "bg-surface-2 text-ink-secondary"
										}`}>
											{letter}
										</span>
										<span className="body-sm text-ink">{opt.substring(3)}</span>
									</div>
								</button>
							);
						})}
					</div>
				)}

				{/* Feedback */}
				{phase === "feedback" && (
					<div className={`rounded-card p-4 mb-5 ${isCorrect ? "bg-surface-2 border border-accent-aqua" : "bg-accent-red/10 border border-accent-red"}`}>
						<div className="flex items-center gap-2 mb-2">
							{isCorrect ? (
								<><CheckCircle className="w-5 h-5 text-accent-aqua" /><span className="font-semibold text-accent-aqua">Correct!</span></>
							) : (
								<><XCircle className="w-5 h-5 text-accent-red" /><span className="font-semibold text-accent-red">Incorrect</span></>
							)}
						</div>
						<p className="body-sm whitespace-pre-line">{q.explanation}</p>
						{q.examSkills.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-3">
								{q.examSkills.map((skill) => (
									<span key={skill} className="badge-muted">{skill}</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Action buttons */}
				<div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-3">
					<button
						type="button"
						disabled={currentIdx === 0}
						onClick={() => {
							if (currentIdx > 0) {
								setCurrentIdx(currentIdx - 1);
								setSelected(null);
								setSelectedMultiple([]);
								setPhase(answeredSet.has(currentIdx - 1) ? "feedback" : "answering");
							}
						}}
						className={`btn-ghost text-sm ${currentIdx === 0 ? "opacity-30 pointer-events-none" : ""}`}
					>
						<ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
					</button>

					{phase === "answering" && (
						<button
							type="button"
							disabled={!selected && selectedMultiple.length === 0}
							onClick={checkAnswer}
							className={`btn-primary ${!selected && selectedMultiple.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
						>
							Check Answer
						</button>
					)}
					{phase === "feedback" && (
						<button type="button" onClick={nextQuestion} className="btn-primary">
							{currentIdx + 1 >= questions.length ? "See Results" : "Next"}
							<ArrowRight className="w-4 h-4" />
						</button>
					)}

					<div className="w-16" />
				</div>
			</div>
		</div>
		</div>
	);
}
