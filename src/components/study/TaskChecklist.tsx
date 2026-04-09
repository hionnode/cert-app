import { useState, useCallback } from "react";
import { toggleTask } from "../../lib/progress";
import { TASK_TYPE_LABELS } from "../../lib/constants";
import {
  BookOpen,
  GraduationCap,
  Newspaper,
  Wrench,
  PlayCircle,
  RefreshCw,
  FileCheck,
  ExternalLink,
  Clock,
  Check,
} from "lucide-react";
import type { Task } from "../../lib/types";

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  read: BookOpen,
  study: GraduationCap,
  blog: Newspaper,
  "hands-on": Wrench,
  watch: PlayCircle,
  review: RefreshCw,
  "practice-exam": FileCheck,
};

const typeBadgeClasses: Record<string, string> = {
  read: "bg-surface-2 text-accent-blue",
  study: "bg-surface-2 text-accent-aqua",
  blog: "border border-accent-orange text-accent-orange",
  "hands-on": "border border-accent-purple text-accent-purple",
  watch: "bg-accent-red/10 text-accent-red",
  review: "bg-surface-2 text-accent-aqua",
  "practice-exam": "bg-accent-yellow/15 text-accent-yellow",
};

interface TaskChecklistProps {
  tasks: Task[];
  dayNumber: number;
}

export default function TaskChecklist({ tasks, dayNumber }: TaskChecklistProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("aip-c01-progress");
      if (!raw) return {};
      return JSON.parse(raw).tasksCompleted ?? {};
    } catch { return {}; }
  });

  const handleToggle = useCallback((taskId: string) => {
    toggleTask(taskId);
    setCompleted((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  const doneCount = tasks.filter((t) => completed[t.id]).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="heading-3">Tasks</h3>
        <span className="caption">
          {doneCount}/{tasks.length} completed
        </span>
      </div>

      <ul className="space-y-3">
        {tasks.map((task) => {
          const done = completed[task.id];
          const Icon = typeIcons[task.type] ?? BookOpen;

          return (
            <li
              key={task.id}
              className={`flex items-start gap-3 p-4 rounded-card border transition-colors ${
                done
                  ? "bg-surface-2 border-accent-aqua"
                  : "bg-surface-0 border-surface-3 hover:border-accent-aqua"
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => handleToggle(task.id)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                  done
                    ? "bg-accent-aqua border-accent-aqua"
                    : "border-surface-3 hover:border-accent-aqua"
                }`}
                aria-label={done ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
              >
                {done && <Check className="w-3.5 h-3.5 text-surface-0" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span
                    className={`badge gap-1 ${
                      typeBadgeClasses[task.type] ?? "bg-surface-2 text-ink-secondary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {TASK_TYPE_LABELS[task.type] ?? task.type}
                  </span>
                  <span className="flex items-center gap-1 caption-sm">
                    <Clock className="w-4 h-4" />
                    {task.estimatedMinutes}m
                  </span>
                </div>

                <p
                  className={`body-sm leading-snug ${
                    done ? "line-through text-ink-muted" : "text-ink"
                  }`}
                >
                  {task.title}
                </p>

                {task.description && (
                  <p className="caption mt-1 leading-relaxed">{task.description}</p>
                )}
              </div>

              {/* External link */}
              {task.url && (
                <a
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost p-2 shrink-0"
                  aria-label={`Open resource for ${task.title}`}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
