import { useState, useMemo } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import DomainBadge from "../shared/DomainBadge";
import type { ComparisonTable as ComparisonTableType } from "../../lib/types";

interface ComparisonTableProps {
  table: ComparisonTableType;
}

type SortDir = "asc" | "desc" | null;

export default function ComparisonTable({ table }: ComparisonTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") {
        setSortCol(null);
        setSortDir(null);
      }
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol || !sortDir) return table.rows;
    return [...table.rows].sort((a, b) => {
      const va = (a[sortCol] ?? "").toLowerCase();
      const vb = (b[sortCol] ?? "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [table.rows, sortCol, sortDir]);

  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ArrowUpDown className="w-3 h-3 text-ink-muted" />;
    if (sortDir === "asc") return <ArrowUp className="w-3 h-3 text-primary-500" />;
    return <ArrowDown className="w-3 h-3 text-primary-500" />;
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <DomainBadge domain={table.domain} size="sm" />
        </div>
        <h3 className="heading-3 mt-2">{table.title}</h3>
        {table.description && (
          <p className="caption mt-1">{table.description}</p>
        )}
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-surface-3 bg-surface-1">
              {table.columns.map((col, i) => {
                const isExamTrigger = col === table.examTriggerColumn;
                return (
                  <th
                    key={col}
                    className={`text-left px-4 py-3 font-semibold whitespace-nowrap cursor-pointer select-none transition-colors hover:bg-surface-2 ${
                      i === 0 ? "sticky left-0 z-10 bg-surface-1" : ""
                    } ${isExamTrigger ? "bg-accent-gold/10" : ""}`}
                    onClick={() => handleSort(col)}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {col}
                      {isExamTrigger && (
                        <span className="badge bg-accent-gold/20 text-amber-700 text-[10px]">
                          Exam
                        </span>
                      )}
                      <SortIcon col={col} />
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-3">
            {sortedRows.map((row, ri) => (
              <tr
                key={ri}
                className="hover:bg-surface-1 transition-colors"
              >
                {table.columns.map((col, ci) => {
                  const isExamTrigger = col === table.examTriggerColumn;
                  return (
                    <td
                      key={col}
                      className={`px-4 py-3 ${
                        ci === 0
                          ? "sticky left-0 z-10 bg-surface-0 font-medium text-ink"
                          : "text-ink-secondary"
                      } ${isExamTrigger ? "bg-accent-gold/5 font-medium text-ink" : ""}`}
                    >
                      {row[col] ?? "\u2014"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
