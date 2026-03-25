"use client";

interface TaskStatusBadgeProps {
  tone: "pending" | "completed" | "overdue";
}

const BADGE_STYLES: Record<TaskStatusBadgeProps["tone"], string> = {
  pending: "border border-amber-200 bg-amber-50 text-amber-800",
  completed: "border border-emerald-200 bg-emerald-50 text-emerald-800",
  overdue: "border border-red-200 bg-red-50 text-red-800",
};

const BADGE_LABELS: Record<TaskStatusBadgeProps["tone"], string> = {
  pending: "Pending",
  completed: "Completed",
  overdue: "Overdue",
};

const DOT_STYLES: Record<TaskStatusBadgeProps["tone"], string> = {
  pending: "bg-amber-500",
  completed: "bg-emerald-500",
  overdue: "bg-red-500",
};

export default function TaskStatusBadge({ tone }: TaskStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase leading-none tracking-[0.06em] ${BADGE_STYLES[tone]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[tone]}`}
        aria-hidden="true"
      />
      {BADGE_LABELS[tone]}
    </span>
  );
}
