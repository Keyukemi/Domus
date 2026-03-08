"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { FiPlus, FiCheckCircle, FiCircle, FiEdit2, FiTrash2, FiClock } from "react-icons/fi";

interface Assignee {
  user: { id: string; name: string; email: string };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  status: "PENDING" | "COMPLETED";
  createdBy: { id: string; name: string; email: string };
  assignees: Assignee[];
  createdAt: string;
}

export default function TasksPage() {
  return (
    <ProtectedRoute>
      <TasksList />
    </ProtectedRoute>
  );
}

function TasksList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const fetchTasks = useCallback(async () => {
    try {
      const query = statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const res = await apiFetch(`/api/tasks${query}`);
      const data = await res.json();

      if (res.ok) {
        setTasks(data);
      } else {
        setError(data.message || "Failed to load tasks.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  async function handleToggleStatus(task: Task) {
    const newStatus = task.status === "PENDING" ? "COMPLETED" : "PENDING";

    try {
      const res = await apiFetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        await fetchTasks();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update task.");
      }
    } catch {
      setError("Could not connect to the server.");
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, { method: "DELETE" });

      if (res.ok) {
        await fetchTasks();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete task.");
      }
    } catch {
      setError("Could not connect to the server.");
    }
  }

  if (loading) {
    return (
      <>
        <AppNavbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-text-muted">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text font-serif">Tasks</h1>
            <Link
              href="/tasks/create"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FiPlus size={16} />
              New Task
            </Link>
          </div>

          {error && (
            <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Status Filter */}
          <div className="flex gap-2">
            {(["ALL", "PENDING", "COMPLETED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-bg-card border border-border-light text-text-muted hover:text-text"
                }`}
              >
                {status === "ALL" ? "All" : status === "PENDING" ? "Pending" : "Completed"}
              </button>
            ))}
          </div>

          {/* Task List */}
          {tasks.length === 0 ? (
            <div className="bg-bg-card border border-border-light rounded-2xl p-12 text-center">
              <p className="text-text-muted">No tasks found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-bg-card border border-border-light rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className={`mt-0.5 flex-shrink-0 transition-colors ${
                          task.status === "COMPLETED"
                            ? "text-green-500 hover:text-green-600"
                            : "text-text-muted hover:text-primary"
                        }`}
                        title={task.status === "COMPLETED" ? "Mark as pending" : "Mark as complete"}
                      >
                        {task.status === "COMPLETED" ? (
                          <FiCheckCircle size={20} />
                        ) : (
                          <FiCircle size={20} />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            task.status === "COMPLETED"
                              ? "text-text-muted line-through"
                              : "text-text"
                          }`}
                        >
                          {task.title}
                        </p>

                        {task.description && (
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {task.deadline && (
                            <span className="flex items-center gap-1 text-xs text-text-muted">
                              <FiClock size={12} />
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          )}

                          {/* Assignee Badges (S3-8) */}
                          {task.assignees.length > 0 && (
                            <div className="flex items-center gap-1">
                              {task.assignees.map(({ user: assignee }) => (
                                <span
                                  key={assignee.id}
                                  title={assignee.name}
                                  className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium"
                                >
                                  {assignee.name.charAt(0).toUpperCase()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link
                        href={`/tasks/${task.id}/edit`}
                        className="p-1.5 text-text-muted hover:text-primary transition-colors"
                        title="Edit task"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                        title="Delete task"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
