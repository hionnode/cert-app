import { useState, useMemo } from "react";
import {
  FileText,
  Newspaper,
  PlayCircle,
  Code,
  FileCheck,
  FlaskConical,
  ExternalLink,
  Filter,
} from "lucide-react";
import DomainBadge from "../shared/DomainBadge";
import { DOMAINS } from "../../lib/constants";
import type { Resource } from "../../lib/types";

interface ResourceGridProps {
  resources: Resource[];
}

const typeConfig: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  docs: { label: "Docs", icon: FileText },
  blog: { label: "Blog", icon: Newspaper },
  video: { label: "Video", icon: PlayCircle },
  github: { label: "GitHub", icon: Code },
  "practice-exam": { label: "Practice Exam", icon: FileCheck },
  workshop: { label: "Workshop", icon: FlaskConical },
};

const ALL_TYPES = ["all", "docs", "blog", "video", "github", "practice-exam", "workshop"] as const;

const TOPIC_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Topics" },
  { value: "bedrock-foundations", label: "Bedrock Foundations" },
  { value: "rag-knowledge-bases", label: "RAG & Knowledge Bases" },
  { value: "vector-stores", label: "Vector Stores" },
  { value: "bedrock-agents", label: "Agents & AgentCore" },
  { value: "guardrails", label: "Guardrails" },
  { value: "prompt-engineering", label: "Prompt Engineering" },
  { value: "cost-optimization", label: "Cost Optimization" },
  { value: "security-governance", label: "Security & Governance" },
  { value: "testing-evaluation", label: "Testing & Evaluation" },
  { value: "step-functions-genai", label: "Step Functions + GenAI" },
  { value: "amazon-q", label: "Amazon Q" },
  { value: "fine-tuning", label: "Fine-Tuning & Customization" },
  { value: "document-processing", label: "Document Processing" },
  { value: "mcp", label: "MCP (Model Context Protocol)" },
  { value: "monitoring-observability", label: "Monitoring & Observability" },
];

const tierLabels: Record<number, string> = {
  1: "Essential",
  2: "Recommended",
  3: "Supplemental",
};

const tierBadgeClasses: Record<number, string> = {
  1: "bg-surface-2 text-accent-aqua",
  2: "bg-surface-2 text-accent-blue",
  3: "bg-surface-2 text-ink-muted",
};

export default function ResourceGrid({ resources }: ResourceGridProps) {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [domainFilter, setDomainFilter] = useState<number | null>(null);
  const [topicFilter, setTopicFilter] = useState<string>("");

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (domainFilter !== null && r.domain !== domainFilter) return false;
      if (topicFilter && r.topic !== topicFilter) return false;
      return true;
    });
  }, [resources, typeFilter, domainFilter, topicFilter]);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Type filter buttons */}
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const active = typeFilter === t;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-button text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-accent-aqua text-surface-0"
                    : "bg-surface-0 border border-surface-3 text-ink-secondary hover:bg-surface-2"
                }`}
              >
                {t === "all" ? "All" : typeConfig[t]?.label ?? t}
              </button>
            );
          })}
        </div>

        {/* Domain filter dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <select
            value={domainFilter ?? ""}
            onChange={(e) =>
              setDomainFilter(e.target.value ? Number(e.target.value) : null)
            }
            className="pl-9 pr-8 py-1.5 bg-surface-0 border border-surface-3 rounded-button text-sm text-ink appearance-none cursor-pointer focus:outline-none focus:border-accent-aqua"
          >
            <option value="">All Domains</option>
            {DOMAINS.map((d) => (
              <option key={d.id} value={d.id}>
                D{d.id}: {d.shortName}
              </option>
            ))}
          </select>
        </div>

        {/* Topic filter dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="pl-9 pr-8 py-1.5 bg-surface-0 border border-surface-3 rounded-button text-sm text-ink appearance-none cursor-pointer focus:outline-none focus:border-accent-aqua"
          >
            {TOPIC_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="caption mb-4">
        {filtered.length} resource{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((resource) => {
          const tc = typeConfig[resource.type];
          const Icon = tc?.icon ?? FileText;

          return (
            <a
              key={resource.id}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-5 flex flex-col gap-3 group hover:border-accent-aqua transition-all"
            >
              {/* Top row: icon + badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-sm bg-surface-2 flex items-center justify-center shrink-0 group-hover:bg-surface-1 transition-colors">
                  <Icon className="w-5 h-5 text-ink-secondary group-hover:text-accent-aqua transition-colors" />
                </div>
                <ExternalLink className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>

              {/* Title */}
              <h3 className="body-text font-semibold text-ink leading-snug group-hover:text-accent-aqua transition-colors">
                {resource.title}
              </h3>

              {/* Description */}
              {resource.description && (
                <p className="caption text-ink-secondary leading-relaxed line-clamp-2">
                  {resource.description}
                </p>
              )}

              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap mt-auto pt-1">
                {resource.domain && (
                  <DomainBadge domain={resource.domain} size="sm" />
                )}
                {resource.tier && (
                  <span
                    className={`badge ${
                      tierBadgeClasses[resource.tier] ?? "bg-surface-2 text-ink-muted"
                    }`}
                  >
                    {tierLabels[resource.tier] ?? `Tier ${resource.tier}`}
                  </span>
                )}
                <span className="badge-muted">
                  {tc?.label ?? resource.type}
                </span>
                {resource.estimatedMinutes && (
                  <span className="badge-muted">
                    ~{resource.estimatedMinutes}m
                  </span>
                )}
              </div>
            </a>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="body-text">No resources match your filters.</p>
            <p className="caption mt-1">Try adjusting the type or domain filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
