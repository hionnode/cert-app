import { useState, useCallback } from "react";
import { Check, CheckCircle, ExternalLink, Clock } from "lucide-react";
import ItemStepper from "../shared/ItemStepper";
import { toggleHandsOn } from "../../lib/progress";
import { useProgress } from "../../lib/hooks/use-progress";
import type { HandsOnActivity } from "../../lib/types";

const DIFFICULTY_STYLES: Record<string, string> = {
	beginner: "bg-surface-2 text-accent-aqua",
	intermediate: "bg-surface-2 text-accent-yellow",
	advanced: "bg-surface-2 text-accent-red",
};

interface HandsOnStepperProps {
	activities: HandsOnActivity[];
}

export default function HandsOnStepper({ activities }: HandsOnStepperProps) {
	const progress = useProgress();
	const handsOnCompleted = progress.handsOnCompleted ?? {};

	const [completed, setCompleted] = useState<Record<string, boolean>>(
		() => handsOnCompleted,
	);

	const [currentIndex, setCurrentIndex] = useState(() => {
		const firstIncomplete = activities.findIndex(
			(a) => !handsOnCompleted[a.id],
		);
		return firstIncomplete >= 0 ? firstIncomplete : 0;
	});

	const handleToggle = useCallback((activityId: string) => {
		toggleHandsOn(activityId);
		setCompleted((prev) => ({
			...prev,
			[activityId]: !prev[activityId],
		}));
	}, []);

	const handleComplete = useCallback(
		(activityId: string) => {
			if (!completed[activityId]) {
				toggleHandsOn(activityId);
				setCompleted((prev) => ({ ...prev, [activityId]: true }));
			}
			setTimeout(() => {
				const next = activities.findIndex(
					(a, i) =>
						i > currentIndex &&
						!completed[a.id] &&
						a.id !== activityId,
				);
				if (next >= 0) setCurrentIndex(next);
				else if (currentIndex < activities.length - 1)
					setCurrentIndex(currentIndex + 1);
			}, 300);
		},
		[completed, currentIndex, activities],
	);

	const totalDone = activities.filter((a) => completed[a.id]).length;

	return (
		<ItemStepper
			items={activities}
			getKey={(a) => a.id}
			isDone={(a) => !!completed[a.id]}
			currentIndex={currentIndex}
			onNavigate={setCurrentIndex}
			itemLabel="Activity"
			totalDone={totalDone}
			renderItem={(activity) => {
				const done = completed[activity.id];
				return (
					<>
						<div className="flex items-center gap-3 mb-4">
							<span
								className={`badge ${DIFFICULTY_STYLES[activity.difficulty] ?? "bg-surface-2 text-ink-muted"}`}
							>
								{activity.difficulty}
							</span>
							{activity.estimatedMinutes && (
								<span className="flex items-center gap-1 caption">
									<Clock className="w-4 h-4" />
									{activity.estimatedMinutes}m
								</span>
							)}
							{done && (
								<CheckCircle className="w-5 h-5 text-accent-aqua ml-auto" />
							)}
						</div>
						<h3
							className={`heading-3 mb-3 ${done ? "text-ink-muted" : ""}`}
						>
							{activity.title}
						</h3>
						<p className="body-text mb-4">{activity.description}</p>
						{activity.steps && activity.steps.length > 0 && (
							<ol className="space-y-2 mb-4">
								{activity.steps.map((step, i) => (
									<li
										key={i}
										className="flex items-start gap-2 body-text"
									>
										<span className="text-accent-aqua font-bold w-5 text-center">
											{i + 1}
										</span>
										{step}
									</li>
								))}
							</ol>
						)}
						{activity.url && (
							<a
								href={activity.url}
								target="_blank"
								rel="noopener noreferrer"
								className="btn-secondary w-full justify-center"
							>
								<ExternalLink className="w-4 h-4" />
								Open Lab
							</a>
						)}
					</>
				);
			}}
			renderActions={(activity) => {
				const done = completed[activity.id];
				return done ? (
					<button
						type="button"
						onClick={() => handleToggle(activity.id)}
						className="inline-flex items-center gap-2 px-6 py-2.5 bg-surface-2 text-accent-aqua rounded-button font-semibold transition-colors cursor-pointer hover:bg-surface-3"
					>
						<CheckCircle className="w-4 h-4" /> Completed
					</button>
				) : (
					<button
						type="button"
						onClick={() => handleComplete(activity.id)}
						className="btn-primary"
					>
						<Check className="w-4 h-4" /> Mark Complete
					</button>
				);
			}}
		/>
	);
}
