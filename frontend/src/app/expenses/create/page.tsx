"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { EXPENSE_CATEGORIES } from "@/lib/expense-categories";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import ExpenseCategoryPicker from "@/components/ExpenseCategoryPicker";

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function CreateExpensePage() {
  return (
    <ProtectedRoute>
      <CreateExpense />
    </ProtectedRoute>
  );
}

function CreateExpense() {
  const router = useRouter();
  const { user } = useAuth();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [splitAmongIds, setSplitAmongIds] = useState<string[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resolvedCategory =
    category === "Other" ? customCategory.trim() : category;

  const fetchMembers = useCallback(async () => {
    if (!user?.householdId) return;

    try {
      const res = await apiFetch(`/api/households/${user.householdId}`);
      const data = await res.json();

      if (res.ok) {
        setMembers(data.members);
        // Pre-select all members by default
        setSplitAmongIds(data.members.map((m: Member) => m.id));
      }
    } catch {
      // Members list is optional
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
      const res = await apiFetch("/api/expenses", {
        method: "POST",
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
        setError(data.message || "Failed to create expense.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
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

  return (
    <>
      <AppNavbar />
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-text font-serif mb-6">Add Expense</h1>

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
                placeholder="e.g. Groceries, Dinner, Utilities"
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
                placeholder="0.00"
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-muted mb-1.5">
                Category *
              </label>
              <ExpenseCategoryPicker
                id="category"
                value={category}
                onChange={setCategory}
                options={EXPENSE_CATEGORIES}
              />
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
                  placeholder="Enter a category"
                  className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
                />
              </div>
            )}

            <div className="rounded-xl border border-border-light bg-bg-feature px-4 py-3">
              <p className="text-sm font-medium text-text">Payment note</p>
              <p className="text-xs text-text-muted mt-1">
                This form records an expense that you already paid. The checked household members will split the amount equally.
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
                  loading ||
                  !description.trim() ||
                  !amount ||
                  !resolvedCategory ||
                  splitAmongIds.length === 0
                }
                className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Expense"}
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
