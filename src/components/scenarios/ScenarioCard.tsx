import { useState } from "react";
import { Eye, ThumbsUp, Minus, X, Lightbulb, ShieldCheck } from "lucide-react";
import DomainBadge from "../shared/DomainBadge";
import { rateScenario } from "../../lib/progress";
import type { Scenario, ScenarioRating } from "../../lib/types";

interface ScenarioCardProps {
  scenario: Scenario;
}

type CardState = "question" | "answer" | "rated";

const difficultyStyles: Record<string, string> = {
  easy: "bg-surface-2 text-accent-aqua",
  medium: "bg-surface-2 text-accent-yellow",
  hard: "bg-surface-2 text-accent-red",
};

const ratingConfig = [
  { value: "got-it" as ScenarioRating, label: "Got it", icon: ThumbsUp, cls: "bg-accent-aqua hover:bg-accent-aqua/80 text-surface-0" },
  { value: "partial" as ScenarioRating, label: "Partial", icon: Minus, cls: "bg-accent-yellow hover:bg-accent-yellow/80 text-surface-0" },
  { value: "missed" as ScenarioRating, label: "Missed", icon: X, cls: "bg-accent-red hover:bg-accent-red/80 text-surface-0" },
];

export default function ScenarioCard({ scenario }: ScenarioCardProps) {
  const [state, setState] = useState<CardState>("question");
  const [selectedRating, setSelectedRating] = useState<ScenarioRating | undefined>();

  function handleReveal() {
    setState("answer");
  }

  function handleRate(r: ScenarioRating) {
    setSelectedRating(r);
    rateScenario(scenario.id, r);
    setState("rated");
  }

  function handleReset() {
    setState("question");
    setSelectedRating(undefined);
  }

  return (
    <div className="card overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 px-6 pt-6 pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <DomainBadge domain={scenario.domain} size="sm" />
          <span className={`badge ${difficultyStyles[scenario.difficulty]}`}>
            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
          </span>
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pb-4">
        <h3 className="heading-3">{scenario.title}</h3>
      </div>

      {/* State content */}
      <div className="px-6 pb-6">
        {/* STATE 1: Question */}
        {state === "question" && (
          <div>
            <div className="body-text mb-5 whitespace-pre-line">{scenario.question}</div>

            {/* Think prompts */}
            {scenario.thinkPrompts.length > 0 && (
              <div className="bg-surface-2 border border-accent-blue rounded-card p-4 mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-accent-blue" />
                  <span className="text-sm font-semibold text-accent-blue">Think First</span>
                </div>
                <ul className="space-y-1.5">
                  {scenario.thinkPrompts.map((prompt, i) => (
                    <li key={i} className="text-sm text-accent-blue flex items-start gap-2">
                      <span className="text-accent-blue/50 shrink-0">&bull;</span>
                      {prompt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={handleReveal}
              className="btn-primary w-full justify-center text-base py-3"
            >
              <Eye className="w-5 h-5" />
              Reveal Answer
            </button>
          </div>
        )}

        {/* STATE 2: Answer revealed */}
        {state === "answer" && (
          <div>
            {/* Question recap (collapsed) */}
            <details className="mb-4 group">
              <summary className="cursor-pointer text-sm text-ink-muted hover:text-ink transition-colors">
                Show question
              </summary>
              <p className="mt-2 text-sm text-ink-secondary whitespace-pre-line">{scenario.question}</p>
            </details>

            {/* Answer */}
            <div className="bg-surface-2 border border-accent-aqua rounded-card p-4 mb-4">
              <p className="text-sm font-semibold text-accent-aqua mb-2">Answer</p>
              <p className="body-text whitespace-pre-line">{scenario.answer}</p>
            </div>

            {/* Why explanation */}
            {scenario.whyExplanation && (
              <div className="bg-surface-1 border border-surface-3 rounded-card p-4 mb-4">
                <p className="text-sm font-semibold text-ink mb-2">Why?</p>
                <p className="body-text whitespace-pre-line">{scenario.whyExplanation}</p>
              </div>
            )}

            {/* Exam skills */}
            {scenario.examSkills.length > 0 && (
              <div className="flex items-start gap-2 mb-5">
                <ShieldCheck className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1.5">
                  {scenario.examSkills.map((skill, i) => (
                    <span key={i} className="badge bg-surface-2 text-accent-blue">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Self-rate buttons */}
            <div>
              <p className="text-sm font-semibold text-ink mb-3">How did you do?</p>
              <div className="grid grid-cols-3 gap-2">
                {ratingConfig.map(({ value, label, icon: Icon, cls }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleRate(value)}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-button font-semibold transition-colors cursor-pointer ${cls}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STATE 3: Rated */}
        {state === "rated" && selectedRating && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              {selectedRating === "got-it" && (
                <>
                  <ThumbsUp className="w-6 h-6 text-accent-aqua" />
                  <span className="text-lg font-bold text-accent-aqua">Got it!</span>
                </>
              )}
              {selectedRating === "partial" && (
                <>
                  <Minus className="w-6 h-6 text-accent-yellow" />
                  <span className="text-lg font-bold text-accent-yellow">Partial</span>
                </>
              )}
              {selectedRating === "missed" && (
                <>
                  <X className="w-6 h-6 text-accent-red" />
                  <span className="text-lg font-bold text-accent-red">Missed</span>
                </>
              )}
            </div>

            <p className="caption mb-4">
              {selectedRating === "got-it"
                ? "Great job! This scenario is marked as mastered."
                : selectedRating === "partial"
                ? "This will come up for review in 3 days."
                : "This will come up for review tomorrow."}
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="btn-ghost text-sm"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
