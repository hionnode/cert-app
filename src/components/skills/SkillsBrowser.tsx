import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Search } from "lucide-react";
import { useProgress } from "../../lib/hooks/use-progress";
import SkillReviewCard from "./SkillReviewCard";
import { DOMAINS } from "../../lib/constants";
import type { ExamSkill } from "../../lib/types";

interface SkillsBrowserProps {
	skills: ExamSkill[];
}

export default function SkillsBrowser({ skills }: SkillsBrowserProps) {
	const [domainFilter, setDomainFilter] = useState<number | "all">("all");
	const [searchQuery, setSearchQuery] = useState("");
	const { skillScenariosViewed } = useProgress();

	const fuse = useMemo(
		() =>
			new Fuse(skills, {
				keys: ["id", "description", "taskTitle", "hint", "referenceAnswer"],
				threshold: 0.4,
				includeScore: true,
			}),
		[skills],
	);

	const filteredSkills = useMemo(() => {
		let result = skills;

		if (domainFilter !== "all") {
			result = result.filter((s) => s.domain === domainFilter);
		}

		if (searchQuery.trim()) {
			const searchResults = fuse.search(searchQuery.trim());
			const ids = new Set(searchResults.map((r) => r.item.id));
			result = result.filter((s) => ids.has(s.id));
		}

		return result;
	}, [skills, domainFilter, searchQuery, fuse]);

	// Group by task
	const grouped = useMemo(() => {
		const groups: Record<string, { taskId: string; taskTitle: string; skills: ExamSkill[] }> = {};
		for (const skill of filteredSkills) {
			if (!groups[skill.taskId]) {
				groups[skill.taskId] = {
					taskId: skill.taskId,
					taskTitle: skill.taskTitle,
					skills: [],
				};
			}
			groups[skill.taskId].skills.push(skill);
		}
		return Object.values(groups);
	}, [filteredSkills]);

	const totalReviewed = skills.filter((s) => (skillScenariosViewed?.[s.id]?.length ?? 0) >= (s.scenarios?.length ?? 1)).length;
	const filteredReviewed = filteredSkills.filter((s) => (skillScenariosViewed?.[s.id]?.length ?? 0) >= (s.scenarios?.length ?? 1)).length;

	return (
		<div>
			{/* Overall progress */}
			<div className="card-padded mb-6 bg-primary-50 border-primary-200">
				<div className="flex items-center justify-between mb-2">
					<span className="heading-3 text-primary-700">Overall Progress</span>
					<span className="text-2xl font-bold text-primary-500">
						{totalReviewed}/{skills.length}
					</span>
				</div>
				<div className="w-full h-3 bg-primary-100 rounded-full overflow-hidden">
					<div
						className="h-3 bg-primary-500 rounded-full transition-all duration-500"
						style={{ width: `${skills.length > 0 ? (totalReviewed / skills.length) * 100 : 0}%` }}
					/>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4 mb-6">
				{/* Search */}
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search skills..."
						className="w-full pl-10 pr-4 py-2.5 rounded-card border border-surface-3 bg-surface-0 text-sm focus:border-secondary-400 focus:outline-none focus:ring-1 focus:ring-secondary-400"
					/>
				</div>

				{/* Domain filter */}
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setDomainFilter("all")}
						className={`badge cursor-pointer transition-colors ${
							domainFilter === "all"
								? "bg-primary-500 text-white"
								: "bg-surface-2 text-ink-secondary hover:bg-surface-3"
						}`}
					>
						All ({skills.length})
					</button>
					{DOMAINS.map((d) => {
						const count = skills.filter((s) => s.domain === d.id).length;
						return (
							<button
								key={d.id}
								type="button"
								onClick={() => setDomainFilter(d.id)}
								className={`badge cursor-pointer transition-colors ${
									domainFilter === d.id
										? `text-white`
										: `badge-domain-${d.id}`
								}`}
								style={domainFilter === d.id ? { backgroundColor: d.color } : undefined}
							>
								D{d.id} ({count})
							</button>
						);
					})}
				</div>
			</div>

			{/* Results info */}
			<p className="caption mb-4">
				{filteredSkills.length} skills shown, {filteredReviewed} reviewed
			</p>

			{/* Grouped skills */}
			<div className="space-y-8">
				{grouped.map((group) => (
					<div key={group.taskId}>
						<div className="flex items-center gap-3 mb-4">
							<span className="badge bg-secondary-100 text-secondary-700">
								Task {group.taskId}
							</span>
							<h3 className="heading-3">{group.taskTitle}</h3>
						</div>
						<div className="space-y-3">
							{group.skills.map((skill) => (
								<SkillReviewCard key={skill.id} skill={skill} />
							))}
						</div>
					</div>
				))}
			</div>

			{filteredSkills.length === 0 && (
				<div className="text-center py-12">
					<p className="body-text">No skills match your search.</p>
				</div>
			)}
		</div>
	);
}
