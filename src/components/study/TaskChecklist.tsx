import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  read: "bg-secondary-100 text-secondary-700",
  study: "bg-primary-100 text-primary-700",
  blog: "bg-orange-100 text-orange-700",
  "hands-on": "bg-violet-100 text-violet-700",
  watch: "bg-red-100 text-red-700",
  review: "bg-teal-100 text-teal-700",
  "practice-exam": "bg-accent-gold/15 text-amber-700",
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

      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {tasks.map((task) => {
            const done = completed[task.id];
            const Icon = typeIcons[task.type] ?? BookOpen;

            return (
              <motion.li
                key={task.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`flex items-start gap-3 p-3.5 rounded-card border transition-colors ${
                  done
                    ? "bg-primary-50/50 border-primary-200"
                    : "bg-surface-0 border-surface-3 hover:border-primary-300"
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggle(task.id)}
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    done
                      ? "bg-primary-500 border-primary-500"
                      : "border-surface-3 hover:border-primary-400"
                  }`}
                  aria-label={done ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                >
                  {done && <Check className="w-3.5 h-3.5 text-white" />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`badge text-[11px] gap-1 ${
                        typeBadgeClasses[task.type] ?? "bg-surface-2 text-ink-secondary"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {TASK_TYPE_LABELS[task.type] ?? task.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-ink-muted">
                      <Clock className="w-3 h-3" />
                      {task.estimatedMinutes}m
                    </span>
                  </div>

                  <p
                    className={`text-sm leading-snug ${
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
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
