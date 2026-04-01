import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ThumbsUp, Minus, X, Lightbulb, ShieldCheck } from "lucide-react";
import DomainBadge from "../shared/DomainBadge";
import { rateScenario } from "../../lib/progress";
import type { Scenario, ScenarioRating } from "../../lib/types";

interface ScenarioCardProps {
  scenario: Scenario;
}

type CardState = "question" | "answer" | "rated";

const difficultyStyles: Record<string, string> = {
  easy: "bg-primary-100 text-primary-700",
  medium: "bg-accent-gold/15 text-amber-700",
  hard: "bg-red-100 text-red-700",
};

const ratingConfig = [
  { value: "got-it" as ScenarioRating, label: "Got it", icon: ThumbsUp, cls: "bg-primary-500 hover:bg-primary-600 text-white" },
  { value: "partial" as ScenarioRating, label: "Partial", icon: Minus, cls: "bg-accent-gold hover:bg-amber-500 text-white" },
  { value: "missed" as ScenarioRating, label: "Missed", icon: X, cls: "bg-accent-coral hover:bg-red-500 text-white" },
];

const slideVariants = {
  enter: { opacity: 0, y: 16 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
};

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
      <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <DomainBadge domain={scenario.domain} size="sm" />
          <span className={`badge text-[11px] ${difficultyStyles[scenario.difficulty]}`}>
            {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
          </span>
        </div>
        <span className="caption">#{scenario.number}</span>
      </div>

      {/* Title */}
      <div className="px-5 pb-4">
        <h3 className="heading-3">{scenario.title}</h3>
      </div>

      {/* State content */}
      <div className="px-5 pb-5">
        <AnimatePresence mode="wait">
          {/* STATE 1: Question */}
          {state === "question" && (
            <motion.div
              key="question"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <div className="body-text mb-5 whitespace-pre-line">{scenario.question}</div>

              {/* Think prompts */}
              {scenario.thinkPrompts.length > 0 && (
                <div className="bg-secondary-50 border border-secondary-200 rounded-card p-4 mb-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-secondary-500" />
                    <span className="text-sm font-semibold text-secondary-700">Think First</span>
                  </div>
                  <ul className="space-y-1.5">
                    {scenario.thinkPrompts.map((prompt, i) => (
                      <li key={i} className="text-sm text-secondary-700 flex items-start gap-2">
                        <span className="text-secondary-400 shrink-0">&bull;</span>
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
            </motion.div>
          )}

          {/* STATE 2: Answer revealed */}
          {state === "answer" && (
            <motion.div
              key="answer"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              {/* Question recap (collapsed) */}
              <details className="mb-4 group">
                <summary className="cursor-pointer text-sm text-ink-muted hover:text-ink transition-colors">
                  Show question
                </summary>
                <p className="mt-2 text-sm text-ink-secondary whitespace-pre-line">{scenario.question}</p>
              </details>

              {/* Answer */}
              <div className="bg-primary-50 border border-primary-200 rounded-card p-4 mb-4">
                <p className="text-sm font-semibold text-primary-700 mb-2">Answer</p>
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
                  <ShieldCheck className="w-4 h-4 text-secondary-500 shrink-0 mt-0.5" />
                  <div className="flex flex-wrap gap-1.5">
                    {scenario.examSkills.map((skill, i) => (
                      <span key={i} className="badge bg-secondary-100 text-secondary-700 text-[11px]">
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
            </motion.div>
          )}

          {/* STATE 3: Rated */}
          {state === "rated" && selectedRating && (
            <motion.div
              key="rated"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="text-center py-4"
            >
              <div className="flex items-center justify-center gap-2 mb-3">
                {selectedRating === "got-it" && (
                  <>
                    <ThumbsUp className="w-6 h-6 text-primary-500" />
                    <span className="text-lg font-bold text-primary-500">Got it!</span>
                  </>
                )}
                {selectedRating === "partial" && (
                  <>
                    <Minus className="w-6 h-6 text-accent-gold" />
                    <span className="text-lg font-bold text-accent-gold">Partial</span>
                  </>
                )}
                {selectedRating === "missed" && (
                  <>
                    <X className="w-6 h-6 text-accent-coral" />
                    <span className="text-lg font-bold text-accent-coral">Missed</span>
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
