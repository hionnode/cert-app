import { useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface ItemStepperProps<T> {
	items: T[];
	getKey: (item: T) => string;
	isDone: (item: T, index: number) => boolean;
	currentIndex: number;
	onNavigate: (index: number) => void;
	itemLabel: string;
	totalDone: number;
	renderItem: (item: T, index: number) => ReactNode;
	renderActions?: (item: T, index: number) => ReactNode;
	renderAllDone?: () => ReactNode;
}

export default function ItemStepper<T>({
	items,
	getKey,
	isDone,
	currentIndex,
	onNavigate,
	itemLabel,
	totalDone,
	renderItem,
	renderActions,
	renderAllDone,
}: ItemStepperProps<T>) {
	const allDone = totalDone === items.length && items.length > 0;
	const compact = items.length > 10;
	const isFirst = currentIndex === 0;
	const isLast = currentIndex === items.length - 1;
	const item = items[currentIndex];

	// Listen for inner-nav events dispatched by StepFocus's keyboard handler.
	// StepFocus owns the keyboard; this stepper just reacts.
	useEffect(() => {
		function onInnerNav(e: Event) {
			const direction = (e as CustomEvent<{ direction: "prev" | "next" }>)
				.detail?.direction;
			if (direction === "prev" && !isFirst) {
				onNavigate(currentIndex - 1);
			} else if (direction === "next" && !isLast) {
				onNavigate(currentIndex + 1);
			}
		}
		window.addEventListener("focus-nav-inner", onInnerNav);
		return () => window.removeEventListener("focus-nav-inner", onInnerNav);
	}, [currentIndex, isFirst, isLast, onNavigate]);

	if (!item) return null;

	if (allDone && renderAllDone) {
		return <>{renderAllDone()}</>;
	}

	// Default all-done
	if (allDone) {
		return (
			<div className="card p-6 text-center">
				<CheckCircle className="w-12 h-12 text-accent-aqua mx-auto mb-4" />
				<h3 className="heading-3 mb-2">
					All {items.length} {itemLabel.toLowerCase()}
					{items.length !== 1 ? "s" : ""} complete
				</h3>
				<p className="body-text mb-6">Nice work!</p>
				<button
					type="button"
					onClick={() => onNavigate(0)}
					className="btn-ghost"
				>
					Review
				</button>
			</div>
		);
	}

	const done = isDone(item, currentIndex);

	return (
		<div>
			{/* Dot navigation */}
			{items.length > 1 && (
				<>
					<div
						className={`flex items-center justify-center ${compact ? "gap-1" : "gap-1.5"} mb-5`}
					>
						{items.map((it, i) => {
							const itemDone = isDone(it, i);
							const isActive = i === currentIndex;

							let dotClass = "bg-surface-3 hover:bg-surface-4";
							if (itemDone) dotClass = "bg-accent-aqua";
							if (isActive)
								dotClass =
									"bg-accent-yellow ring-1 ring-accent-yellow ring-offset-1 ring-offset-surface-0";

							const sizeClass = isActive
								? compact
									? "w-6 h-2"
									: "w-8 h-2.5"
								: compact
									? "w-4 h-1.5"
									: "w-6 h-2";

							return (
								<button
									key={getKey(it)}
									type="button"
									onClick={() => onNavigate(i)}
									className={`${sizeClass} rounded-full cursor-pointer transition-all duration-200 ${dotClass}`}
									aria-label={`Go to ${itemLabel.toLowerCase()} ${i + 1}`}
								/>
							);
						})}
					</div>
				</>
			)}

			{/* Card */}
			<div
				className={`card p-6 transition-opacity duration-200 ${done ? "border-accent-aqua" : ""}`}
			>
				{renderItem(item, currentIndex)}

				{/* Action bar */}
				<div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-3">
					<button
						type="button"
						onClick={() => onNavigate(currentIndex - 1)}
						disabled={isFirst}
						className={`btn-ghost text-sm ${isFirst ? "opacity-30 pointer-events-none" : ""}`}
					>
						<ChevronLeft className="w-4 h-4" />{" "}
						<span className="hidden sm:inline">Back</span>
					</button>

					{renderActions && renderActions(item, currentIndex)}

					<button
						type="button"
						onClick={() => onNavigate(currentIndex + 1)}
						disabled={isLast}
						className={`btn-ghost text-sm ${isLast ? "opacity-30 pointer-events-none" : ""}`}
					>
						<span className="hidden sm:inline">Next</span>{" "}
						<ChevronRight className="w-4 h-4" />
					</button>
				</div>
			</div>
		</div>
	);
}
