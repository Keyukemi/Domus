"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formatDateForDatetimeLocal, toIsoDateTime } from "@/lib/datetime";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function EditTaskPage() {
  return (
    <ProtectedRoute>
      <EditTask />
    </ProtectedRoute>
  );
}

function EditTask() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    if (!user?.householdId) return;

    try {
      const [taskRes, householdRes] = await Promise.all([
        apiFetch(`/api/tasks/${taskId}`),
        apiFetch(`/api/households/${user.householdId}`),
      ]);

      const taskData = await taskRes.json();
      const householdData = await householdRes.json();

      if (taskRes.ok) {
        if (taskData.createdBy.id !== user?.id) {
          router.push("/tasks");
          return;
        }
        setTitle(taskData.title);
        setDescription(taskData.description || "");
        setDeadline(
          taskData.deadline ? formatDateForDatetimeLocal(taskData.deadline) : ""
        );
        setAssigneeIds(taskData.assignees.map((a: { user: Member }) => a.user.id));
      } else {
        setError(taskData.message || "Failed to load task.");
      }

      if (householdRes.ok) {
        setMembers(householdData.members);
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [taskId, router, user?.householdId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiFetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          deadline: toIsoDateTime(deadline),
          assigneeIds,
        }),
      });

      if (res.ok) {
        router.push("/tasks");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update task.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  function toggleAssignee(memberId: string) {
    setAssigneeIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
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
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-text font-serif mb-6">Edit Task</h1>

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
                disabled={saving || !title.trim()}
                className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
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
