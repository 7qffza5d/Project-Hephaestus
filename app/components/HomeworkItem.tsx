// app/components/HomeworkItem.tsx
"use client";

import { useState } from "react";

type HomeworkItemProps = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  resourceUrl?: string | null;
  done: boolean;
  isAdmin: boolean;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function getStatus(dueDate: string): "overdue" | "soon" | "upcoming" {
  const diff = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "soon";
  return "upcoming";
}

function formatDue(dueDate: string): string {
  const due = new Date(dueDate);
  const diffDays = Math.round((due.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const label = due.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return `Due ${label} · ${days} day${days !== 1 ? "s" : ""} ago`;
  }
  return `Due ${label}`;
}

const subjectColors: Record<string, string> = {
  math:    "bg-purple-100 text-purple-800",
  science: "bg-green-100 text-green-800",
  english: "bg-orange-100 text-orange-800",
  thai:    "bg-amber-100 text-amber-800",
  default: "bg-blue-100 text-blue-800",
};

function subjectColor(subject: string): string {
  return subjectColors[subject.toLowerCase()] ?? subjectColors.default;
}

export default function HomeworkItem({
  id, title, subject, dueDate, resourceUrl, done,
  isAdmin, onToggle, onEdit, onDelete,
}: HomeworkItemProps) {
  const [loading, setLoading] = useState(false);
  const status = getStatus(dueDate);

  async function handleToggle() {
    setLoading(true);
    await onToggle(id);
    setLoading(false);
  }

  return (
    <div className={[
      "group flex items-center gap-3 rounded-xl border px-4 py-3 bg-white dark:bg-zinc-900",
      status === "overdue"
        ? "border-l-2 border-l-red-400 border-y-zinc-200 border-r-zinc-200 rounded-l-none"
        : "border-zinc-200 dark:border-zinc-700",
      done ? "opacity-50" : "",
    ].join(" ")}>

      <button
        onClick={handleToggle}
        disabled={loading}
        className={[
          "w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors",
          done
            ? "bg-teal-500 border-teal-500"
            : "border-zinc-300 dark:border-zinc-600 bg-transparent",
        ].join(" ")}
      >
        {done && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={[
          "text-sm font-medium truncate",
          done
            ? "line-through text-zinc-400 dark:text-zinc-500"
            : "text-zinc-900 dark:text-zinc-100",
        ].join(" ")}>
          {title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${subjectColor(subject)}`}>
            {subject}
          </span>
          <span className={[
            "text-xs",
            status === "overdue"
              ? "text-red-500 font-medium"
              : "text-zinc-400 dark:text-zinc-500",
          ].join(" ")}>
            {formatDue(dueDate)}
          </span>
          {resourceUrl && (
            <a
              href={resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline flex items-center gap-1"
            >
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h6l4 4v8a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 2v4h4" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              file
            </a>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(id)}
            className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(id)}
            className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}