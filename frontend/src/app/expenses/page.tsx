"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiDollarSign } from "react-icons/fi";
import ConfirmModal from "@/components/ConfirmModal";

interface Split {
  user: { id: string; name: string; email: string };
  amount: string;
}

interface Expense {
  id: string;
  description: string;
  amount: string;
  category: string;
  date: string;
  paidBy: { id: string; name: string; email: string };
  splits: Split[];
  createdAt: string;
}

export default function ExpensesPage() {
  return (
    <ProtectedRoute>
      <ExpensesList />
    </ProtectedRoute>
  );
}

function ExpensesList() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      const query = categoryFilter ? `?category=${encodeURIComponent(categoryFilter)}` : "";
      const res = await apiFetch(`/api/expenses${query}`);
      const data = await res.json();

      if (res.ok) {
        setExpenses(data);

        // Extract unique categories from unfiltered results for the filter menu
        if (!categoryFilter) {
          const uniqueCategories = [...new Set(data.map((e: Expense) => e.category))] as string[];
          setCategories(uniqueCategories.sort());
        }
      } else {
        setError(data.message || "Failed to load expenses.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const res = await apiFetch(`/api/expenses/${deleteId}`, { method: "DELETE" });

      if (res.ok) {
        await fetchExpenses();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete expense.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setDeleteId(null);
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
            <h1 className="text-2xl font-bold text-text font-serif">Expenses</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/expenses/balances"
                className="flex items-center gap-1.5 px-4 py-2 border border-border text-sm font-medium rounded-lg text-text hover:bg-bg-feature transition-colors"
              >
                <FiDollarSign size={16} />
                Balances
              </Link>
              <Link
                href="/expenses/create"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
              >
                <FiPlus size={16} />
                New Expense
              </Link>
            </div>
          </div>

          {error && (
            <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setCategoryFilter("")}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                categoryFilter === ""
                  ? "bg-primary text-white"
                  : "bg-bg-card border border-border-light text-text-muted hover:text-text"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  categoryFilter === cat
                    ? "bg-primary text-white"
                    : "bg-bg-card border border-border-light text-text-muted hover:text-text"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expense List */}
          {expenses.length === 0 ? (
            <div className="bg-bg-card border border-border-light rounded-2xl p-12 text-center">
              <p className="text-text-muted">No expenses found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="bg-bg-card border border-border-light rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-text">
                          {expense.description}
                        </p>
                        <span className="text-sm font-semibold text-primary">
                          ${Number(expense.amount).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <FiTag size={12} />
                          {expense.category}
                        </span>
                        <span className="text-xs text-text-muted">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-text-muted">
                          Paid by <span className="font-medium text-text">{expense.paidBy.name}</span>
                        </span>
                      </div>

                      {/* Split badges */}
                      {expense.splits.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-xs text-text-muted mr-1">Split:</span>
                          {expense.splits.map((split) => (
                            <span
                              key={split.user.id}
                              title={`${split.user.name}: $${Number(split.amount).toFixed(2)}`}
                              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium"
                            >
                              {split.user.name.charAt(0).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {user?.id === expense.paidBy.id && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Link
                          href={`/expenses/${expense.id}/edit`}
                          className="p-1.5 text-text-muted hover:text-primary transition-colors"
                          title="Edit expense"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => setDeleteId(expense.id)}
                          className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                          title="Delete expense"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
