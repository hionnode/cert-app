import { useState } from "react";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy } from "lucide-react";
import type { PracticeQuestion } from "../../lib/types";
import { DOMAINS } from "../../lib/constants";

interface QuizCardProps {
	questions: PracticeQuestion[];
	title: string;
}

type Phase = "answering" | "feedback" | "complete";

const levelLabels: Record<number, { label: string; cls: string }> = {
	1: { label: "Foundation", cls: "bg-primary-100 text-primary-700" },
	2: { label: "Applied", cls: "bg-accent-gold/15 text-amber-700" },
	3: { label: "Expert", cls: "bg-red-100 text-red-700" },
};

export default function QuizCard({ questions, title }: QuizCardProps) {
	const [currentIdx, setCurrentIdx] = useState(0);
	const [selected, setSelected] = useState<string | null>(null);
	const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
	const [phase, setPhase] = useState<Phase>("answering");
	const [score, setScore] = useState(0);
	const [answered, setAnswered] = useState(0);

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
				<Trophy className={`w-16 h-16 mx-auto mb-4 ${passed ? "text-primary-500" : "text-accent-gold"}`} />
				<h2 className="heading-2 mb-2">{passed ? "Great job!" : "Keep practicing!"}</h2>
				<div className="text-4xl font-bold font-display mb-1" style={{ color: passed ? "#1b7e4e" : "#e16e2e" }}>
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
		<div className="card overflow-hidden">
			{/* Header */}
			<div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
				<div className="flex items-center gap-2 flex-wrap">
					<span className={`badge-domain-${q.domain}`}>D{q.domain}</span>
					<span className={`badge ${level.cls}`}>{level.label}</span>
					{q.integrationDomains.length > 0 && (
						<span className="badge bg-violet-100 text-violet-700">
							+D{q.integrationDomains.join("+D")}
						</span>
					)}
					<span className="badge bg-surface-2 text-ink-muted">{q.type}</span>
				</div>
				<span className="caption">
					{currentIdx + 1} / {questions.length}
				</span>
			</div>

			{/* Progress bar */}
			<div className="mx-5 mb-4">
				<div className="w-full h-1.5 bg-surface-2 rounded-full">
					<div
						className="h-1.5 bg-primary-500 rounded-full transition-all duration-300"
						style={{ width: `${((currentIdx + (phase === "feedback" ? 1 : 0)) / questions.length) * 100}%` }}
					/>
				</div>
			</div>

			{/* Question */}
			<div className="px-5 pb-5">
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

							let optionStyle = "border-surface-3 hover:border-primary-400";
							if (phase === "feedback") {
								const isCorrectOpt =
									q.type === "multiple-choice"
										? letter === q.correctAnswer
										: (q.correctAnswers ?? []).includes(letter);
								if (isCorrectOpt) {
									optionStyle = "border-primary-500 bg-primary-50";
								} else if (isSelected && !isCorrectOpt) {
									optionStyle = "border-red-400 bg-red-50";
								} else {
									optionStyle = "border-surface-3 opacity-60";
								}
							} else if (isSelected) {
								optionStyle = "border-secondary-500 bg-secondary-50";
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
									className={`w-full text-left p-4 rounded-card border-2 transition-all cursor-pointer ${optionStyle}`}
								>
									<div className="flex items-start gap-3">
										<span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
											isSelected
												? "bg-secondary-500 text-white"
												: "bg-surface-2 text-ink-secondary"
										}`}>
											{letter}
										</span>
										<span className="text-sm text-ink">{opt.substring(3)}</span>
									</div>
								</button>
							);
						})}
					</div>
				)}

				{/* Feedback */}
				{phase === "feedback" && (
					<div className={`rounded-card p-4 mb-5 ${isCorrect ? "bg-primary-50 border border-primary-200" : "bg-red-50 border border-red-200"}`}>
						<div className="flex items-center gap-2 mb-2">
							{isCorrect ? (
								<><CheckCircle className="w-5 h-5 text-primary-500" /><span className="font-semibold text-primary-700">Correct!</span></>
							) : (
								<><XCircle className="w-5 h-5 text-red-500" /><span className="font-semibold text-red-700">Incorrect</span></>
							)}
						</div>
						<p className="text-sm text-ink-secondary whitespace-pre-line">{q.explanation}</p>
						{q.examSkills.length > 0 && (
							<div className="flex flex-wrap gap-1.5 mt-3">
								{q.examSkills.map((skill) => (
									<span key={skill} className="badge bg-surface-0 text-ink-muted text-[10px]">{skill}</span>
								))}
							</div>
						)}
					</div>
				)}

				{/* Action buttons */}
				<div className="flex justify-end gap-3">
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
							{currentIdx + 1 >= questions.length ? "See Results" : "Next Question"}
							<ArrowRight className="w-4 h-4" />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
