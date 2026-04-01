import { useState, useMemo } from "react";
import Fuse from "fuse.js";
import { Search, ArrowRight } from "lucide-react";
import DomainBadge from "../shared/DomainBadge";
import type { WrongAnswerRule } from "../../lib/types";

interface RulesSearchProps {
  rules: WrongAnswerRule[];
}

export default function RulesSearch({ rules }: RulesSearchProps) {
  const [query, setQuery] = useState("");

  const fuse = useMemo(
    () =>
      new Fuse(rules, {
        keys: [
          { name: "trigger", weight: 0.6 },
          { name: "answer", weight: 0.3 },
          { name: "notThis", weight: 0.1 },
        ],
        threshold: 0.35,
        includeScore: true,
      }),
    [rules]
  );

  const filteredRules = useMemo(() => {
    if (!query.trim()) return rules;
    return fuse.search(query).map((r) => r.item);
  }, [query, fuse, rules]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
        <input
          type="text"
          placeholder="Search wrong-answer rules..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-surface-0 border border-surface-3 rounded-card text-ink placeholder:text-ink-muted focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all text-base"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="caption mb-4">
        {filteredRules.length} rule{filteredRules.length !== 1 ? "s" : ""} found
      </p>

      {/* Rule list */}
      <ul className="space-y-2">
        {filteredRules.map((rule) => (
          <li
            key={rule.id}
            className="card-padded flex flex-col gap-2"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-ink">{rule.trigger}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-ink-muted shrink-0" />
                  <span className="text-primary-600 font-medium">{rule.answer}</span>
                </div>

                {rule.notThis && (
                  <p className="mt-1.5 text-sm">
                    <span className="font-semibold text-accent-coral">NOT:</span>{" "}
                    <span className="text-ink-secondary">{rule.notThis}</span>
                  </p>
                )}
              </div>

              <DomainBadge domain={rule.domain} size="sm" />
            </div>
          </li>
        ))}

        {filteredRules.length === 0 && (
          <li className="text-center py-12">
            <p className="body-text">No rules match your search.</p>
            <p className="caption mt-1">Try a different keyword or clear the search.</p>
          </li>
        )}
      </ul>
    </div>
  );
}
