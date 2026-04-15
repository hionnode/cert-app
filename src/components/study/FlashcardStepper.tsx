import { useEffect, useRef, useState } from "react";
import ItemStepper from "../shared/ItemStepper";
import { markFlashcardFlipped } from "../../lib/progress";
import { useProgress } from "../../lib/hooks/use-progress";
import type { Flashcard } from "../../lib/types";

interface FlashcardStepperProps {
	cards: Flashcard[];
}

export default function FlashcardStepper({ cards }: FlashcardStepperProps) {
	const { flashcardsFlipped } = useProgress();
	const isCardDone = (card: Flashcard) =>
		flashcardsFlipped?.[card.id] === true;

	const [currentIndex, setCurrentIndex] = useState(() => {
		const first = cards.findIndex((c) => !isCardDone(c));
		return first >= 0 ? first : 0;
	});

	const totalDone = cards.filter(isCardDone).length;

	return (
		<div>
			<p className="caption mb-4">
				Flip cards to self-check. Answer in your head first.
			</p>

			<ItemStepper
				items={cards}
				getKey={(c) => c.id}
				isDone={isCardDone}
				currentIndex={currentIndex}
				onNavigate={setCurrentIndex}
				itemLabel="Card"
				totalDone={totalDone}
				renderItem={(card, index) => (
					<FlashcardStage
						card={card}
						index={index}
						total={cards.length}
					/>
				)}
				renderActions={(_, index) => (
					<span className="caption" aria-live="polite">
						{index + 1} / {cards.length}
					</span>
				)}
			/>
		</div>
	);
}

function FlashcardStage({
	card,
	index,
	total,
}: {
	card: Flashcard;
	index: number;
	total: number;
}) {
	const [flipped, setFlipped] = useState(false);
	const stageRef = useRef<HTMLDivElement>(null);

	// Reset flip when card changes, and focus the stage so keyboard
	// flip works without clicking. Don't steal focus on the very first mount.
	const firstMountRef = useRef(true);
	useEffect(() => {
		setFlipped(false);
		if (firstMountRef.current) {
			firstMountRef.current = false;
			return;
		}
		stageRef.current?.focus();
	}, [card.id]);

	function toggle() {
		setFlipped((prev) => {
			const next = !prev;
			if (next) markFlashcardFlipped(card.id);
			return next;
		});
	}

	function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		// Only handle Space/Enter. H/L/arrows belong to StepFocus inner-nav.
		if (e.key === " " || e.key === "Enter") {
			e.preventDefault();
			toggle();
		}
	}

	return (
		<div
			ref={stageRef}
			role="button"
			tabIndex={0}
			aria-pressed={flipped}
			aria-label={`Flashcard ${index + 1} of ${total}. ${
				flipped ? "Showing answer." : "Press space to reveal answer."
			}`}
			onClick={toggle}
			onKeyDown={onKeyDown}
			className="relative min-h-[360px] flex items-center justify-center cursor-pointer select-none rounded-card outline-none focus-visible:ring-2 focus-visible:ring-accent-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
			style={{ perspective: "1200px" }}
		>
			<div
				className="relative w-full max-w-[640px] min-h-[280px] transition-transform duration-[400ms] ease-out motion-reduce:transition-none"
				style={{
					transformStyle: "preserve-3d",
					transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
				}}
			>
				{/* Front — question */}
				<div
					aria-hidden={flipped}
					className="absolute inset-0 backface-hidden flex flex-col items-center justify-center gap-5 px-4"
				>
					<span className="caption uppercase tracking-wider text-ink-muted">
						Question
					</span>
					<p className="heading-3 text-center leading-relaxed">
						{card.question}
					</p>
					{card.hint && (
						<details className="caption text-ink-muted">
							<summary className="cursor-pointer list-none hover:text-accent-blue transition-colors [&::-webkit-details-marker]:hidden">
								Need a hint?
							</summary>
							<p className="mt-2 italic">{card.hint}</p>
						</details>
					)}
				</div>

				{/* Back — answer */}
				<div
					aria-hidden={!flipped}
					className="absolute inset-0 backface-hidden flex flex-col items-center justify-center gap-5 px-4"
					style={{ transform: "rotateY(180deg)" }}
				>
					<span className="caption uppercase tracking-wider text-accent-aqua">
						Answer
					</span>
					<p className="body-text text-ink text-center leading-relaxed">
						{card.answer}
					</p>
					{card.tags && card.tags.length > 0 && (
						<p className="caption italic text-ink-muted">
							{card.tags.map((t) => `#${t}`).join(" · ")}
						</p>
					)}
				</div>
			</div>

			{/* Flip hint pinned to bottom of stage */}
			<div className="absolute bottom-0 left-0 right-0 flex justify-center caption text-ink-muted pointer-events-none">
				<span className="inline-flex items-center gap-1.5">
					<kbd className="text-ink">Space</kbd>
					{flipped ? "to flip back" : "to flip · click card"}
				</span>
			</div>
		</div>
	);
}
