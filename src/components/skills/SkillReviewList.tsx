import { useState } from "react";
import { useProgress } from "../../lib/hooks/use-progress";
import SkillReviewCard from "./SkillReviewCard";
import type { ExamSkill } from "../../lib/types";

interface SkillReviewListProps {
	skills: ExamSkill[];
	compact?: boolean;
	maxVisible?: number;
}

export default function SkillReviewList({ skills, compact, maxVisible }: SkillReviewListProps) {
	const { skillScenariosViewed } = useProgress();
	const [showAll, setShowAll] = useState(false);

	const reviewed = skills.filter((s) => {
		const viewed = skillScenariosViewed?.[s.id] ?? [];
		const total = s.scenarios?.length ?? 0;
		return total > 0 && viewed.length >= total;
	}).length;
	const pct = skills.length > 0 ? Math.round((reviewed / skills.length) * 100) : 0;

	const visible =
		maxVisible && !showAll ? skills.slice(0, maxVisible) : skills;
	const hiddenCount = maxVisible && !showAll ? Math.max(0, skills.length - maxVisible) : 0;

	return (
		<div>
			{/* Progress bar */}
			<div className="flex items-center gap-3 mb-4">
				<div className="flex-1 h-2 bg-surface-2 rounded-full overflow-hidden">
					<div
						className="h-2 bg-primary-500 rounded-full transition-all duration-500"
						style={{ width: `${pct}%` }}
					/>
				</div>
				<span className="caption whitespace-nowrap">
					{reviewed}/{skills.length} reviewed
				</span>
			</div>

			{/* Skill cards */}
			<div className="space-y-3">
				{visible.map((skill) => (
					<SkillReviewCard key={skill.id} skill={skill} compact={compact} />
				))}
			</div>

			{/* Show more */}
			{hiddenCount > 0 && (
				<button
					type="button"
					onClick={() => setShowAll(true)}
					className="btn-ghost w-full justify-center mt-3 text-sm"
				>
					Show {hiddenCount} more skill{hiddenCount !== 1 ? "s" : ""}
				</button>
			)}
		</div>
	);
}
