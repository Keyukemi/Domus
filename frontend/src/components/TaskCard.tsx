"use client";

import { FiClock } from "react-icons/fi";
import TaskStatusBadge from "@/components/TaskStatusBadge";

interface TaskCardProps {
  title: string;
  description?: string | null;
  deadline?: string | null;
  status: "PENDING" | "COMPLETED";
  assigneeNames?: string[];
  leadingAction?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "default" | "embedded";
  actionsPlacement?: "side" | "bottom-right-mobile";
}

function isOverdue(status: TaskCardProps["status"], deadline?: string | null) {
  if (status !== "PENDING" || !deadline) {
    return false;
  }

  return new Date(deadline).getTime() < Date.now();
}

export default function TaskCard({
  title,
  description,
  deadline,
  status,
  assigneeNames = [],
  leadingAction,
  actions,
  variant = "default",
  actionsPlacement = "side",
}: TaskCardProps) {
  const overdue = isOverdue(status, deadline);
  const statusTone =
    status === "COMPLETED" ? "completed" : overdue ? "overdue" : "pending";
  const wrapperClasses =
    variant === "embedded"
      ? "bg-transparent border-0 p-0 rounded-none"
      : overdue
        ? "rounded-2xl border border-red-200 bg-bg-card p-5"
        : "rounded-2xl border border-border-light bg-bg-card p-5";
  const actionsWrapperClasses =
    actionsPlacement === "bottom-right-mobile"
      ? "flex w-full justify-end sm:w-auto sm:justify-start sm:items-start sm:shrink-0"
      : "flex shrink-0 items-start";

  return (
    <div className={wrapperClasses}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex flex-1 items-start gap-3">
          {leadingAction && <div className="mt-0.5 shrink-0">{leadingAction}</div>}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p
                className={`text-sm font-medium ${
                  status === "COMPLETED"
                    ? "text-text-muted line-through"
                    : "text-text"
                }`}
              >
                {title}
              </p>
              <TaskStatusBadge tone={statusTone} />
            </div>

            {description && (
              <p className="mt-2 text-xs text-text-muted line-clamp-2">
                {description}
              </p>
            )}

            {(deadline || assigneeNames.length > 0) && (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                {deadline && (
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${
                      overdue ? "text-red-600" : "text-text-muted"
                    }`}
                  >
                    <FiClock size={12} />
                    {new Date(deadline).toLocaleDateString()}
                  </span>
                )}

                {assigneeNames.length > 0 && (
                  <p className="text-xs text-text-muted sm:pl-1">
                    Assigned: {assigneeNames.join(", ")}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {actions && <div className={actionsWrapperClasses}>{actions}</div>}
      </div>
    </div>
  );
}
