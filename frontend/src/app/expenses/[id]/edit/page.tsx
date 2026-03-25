"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  EXPENSE_CATEGORIES,
  isPresetExpenseCategory,
} from "@/lib/expense-categories";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function EditExpensePage() {
  return (
    <ProtectedRoute>
      <EditExpense />
    </ProtectedRoute>
  );
}

function EditExpense() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;
  const { user } = useAuth();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState("");
  const [splitAmongIds, setSplitAmongIds] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const resolvedCategory =
    category === "Other" ? customCategory.trim() : category;

  const fetchData = useCallback(async () => {
    if (!user?.householdId) return;

    try {
      const [expenseRes, householdRes] = await Promise.all([
        apiFetch(`/api/expenses/${expenseId}`),
        apiFetch(`/api/households/${user.householdId}`),
      ]);

      const expenseData = await expenseRes.json();
      const householdData = await householdRes.json();

      if (expenseRes.ok) {
        if (expenseData.paidBy.id !== user?.id) {
          router.push("/expenses");
          return;
        }
        setDescription(expenseData.description);
        setAmount(Number(expenseData.amount).toString());
        if (isPresetExpenseCategory(expenseData.category)) {
          setCategory(expenseData.category);
          setCustomCategory("");
        } else {
          setCategory("Other");
          setCustomCategory(expenseData.category);
        }
        setDate(expenseData.date.split("T")[0]);
        setSplitAmongIds(expenseData.splits.map((s: { user: Member }) => s.user.id));
      } else {
        setError(expenseData.message || "Failed to load expense.");
      }

      if (householdRes.ok) {
        setMembers(householdData.members);
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [expenseId, router, user?.householdId, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await apiFetch(`/api/expenses/${expenseId}`, {
        method: "PATCH",
        body: JSON.stringify({
          description: description.trim(),
          amount: parseFloat(amount),
          category: resolvedCategory,
          date,
          splitAmongIds,
        }),
      });

      if (res.ok) {
        router.push("/expenses");
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update expense.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  function toggleMember(memberId: string) {
    setSplitAmongIds((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  }

  const splitPreview = splitAmongIds.length > 0 && amount
    ? (parseFloat(amount) / splitAmongIds.length).toFixed(2)
    : null;

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
          <h1 className="text-2xl font-bold text-text font-serif mb-6">Edit Expense</h1>

          {error && (
            <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-text-muted mb-1.5">
                Description *
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={200}
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-text-muted mb-1.5">
                Amount *
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-muted mb-1.5">
                Category *
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
              >
                {EXPENSE_CATEGORIES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {category === "Other" && (
              <div>
                <label htmlFor="customCategory" className="block text-sm font-medium text-text-muted mb-1.5">
                  Custom category *
                </label>
                <input
                  id="customCategory"
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                  maxLength={50}
                  className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="rounded-xl border border-border-light bg-bg-feature px-4 py-3">
              <p className="text-sm font-medium text-text">Payment note</p>
              <p className="text-xs text-text-muted mt-1">
                This expense is recorded as paid by you. The checked household members will share the amount equally.
              </p>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-text-muted mb-1.5">
                Date *
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
              />
            </div>

            {members.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-text-muted mb-1.5">
                  Split among *
                </label>
                <div className="space-y-2">
                  {members.map((member) => (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 py-2 px-4 rounded-xl bg-bg-feature cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={splitAmongIds.includes(member.id)}
                        onChange={() => toggleMember(member.id)}
                        className="accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-text">{member.name}</p>
                        <p className="text-xs text-text-muted">{member.email}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {splitPreview && (
                  <p className="text-xs text-text-muted mt-2">
                    ${splitPreview} per person ({splitAmongIds.length} {splitAmongIds.length === 1 ? "person" : "people"})
                  </p>
                )}

                {splitAmongIds.length > 0 && (
                  <p className="text-xs text-text-muted mt-1">
                    {splitAmongIds.includes(user?.id || "")
                      ? "Your share is included in this split."
                      : "Your share is not included in this split."}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={
                  saving ||
                  !description.trim() ||
                  !amount ||
                  !resolvedCategory ||
                  splitAmongIds.length === 0
                }
                className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/expenses")}
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
