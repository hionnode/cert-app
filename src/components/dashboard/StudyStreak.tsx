import { useProgress } from "../../lib/hooks/use-progress";
import { Flame } from "lucide-react";

export default function StudyStreak() {
	const { streak } = useProgress();
	const isActive = streak.current > 0;

	return (
		<div className="card-padded flex items-center gap-4">
			<div
				className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${
					isActive ? "bg-accent-gold/15" : "bg-surface-2"
				}`}
			>
				<Flame className={`w-7 h-7 ${isActive ? "text-accent-gold" : "text-ink-muted"}`} />
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-baseline gap-2">
					<span className="text-3xl font-bold font-display text-ink">{streak.current}</span>
					<span className="text-sm font-semibold text-ink-secondary">
						day{streak.current !== 1 ? "s" : ""}
					</span>
				</div>
				<p className="caption">
					{isActive
						? "Keep it going! Study every day to maintain your streak."
						: "Complete a task today to start your streak!"}
				</p>
			</div>
		</div>
	);
}
