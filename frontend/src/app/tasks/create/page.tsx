"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  getDefaultTaskDeadlineInputValue,
  toIsoDateTime,
} from "@/lib/datetime";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function CreateTaskPage() {
  return (
    <ProtectedRoute>
      <CreateTask />
    </ProtectedRoute>
  );
}

function CreateTask() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState(getDefaultTaskDeadlineInputValue);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMembers = useCallback(async () => {
    if (!user?.householdId) return;

    try {
      const res = await apiFetch(`/api/households/${user.householdId}`);
      const data = await res.json();

      if (res.ok) {
        setMembers(data.members);
      }
    } catch {
      // Members list is optional; form still works without it
    }
  }, [user?.householdId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          deadline: toIsoDateTime(deadline),
          assigneeIds: assigneeIds.length > 0 ? assigneeIds : undefined,
        }),
      });

      if (res.ok) {
        router.push("/tasks");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to create task.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  function toggleAssignee(memberId: string) {
    setAssigneeIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-text font-serif mb-6">Create Task</h1>

          {error && (
            <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-text-muted mb-1.5">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-muted mb-1.5">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary resize-none"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-text-muted mb-1.5">
                Deadline
              </label>
              <input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
              />
              <p className="text-xs text-text-muted mt-1">
                Starts with today&apos;s date and current time, but you can change or clear it.
              </p>
            </div>

            {members.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                  Assign to
                </label>
                <div className="space-y-2">
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 py-2 px-4 rounded-xl bg-bg-feature cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={assigneeIds.includes(member.id)}
                        onChange={() => toggleAssignee(member.id)}
                        className="accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-text">{member.name}</p>
                        <p className="text-xs text-text-muted">{member.email}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || !title.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Task"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/tasks")}
                className="px-4 py-2 border border-border text-sm font-medium rounded-lg text-text hover:bg-bg-feature transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
