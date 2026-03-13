"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { FiCheckSquare, FiDollarSign, FiClock } from "react-icons/fi";

interface Assignee {
  user: { id: string; name: string; email: string };
}

interface UpcomingTask {
  id: string;
  title: string;
  deadline: string;
  assignees: Assignee[];
}

interface RecentExpense {
  id: string;
  description: string;
  amount: string;
  date: string;
  paidBy: { id: string; name: string; email: string };
}

interface RecentNote {
  id: string;
  content: string;
  author: { id: string; name: string; email: string };
  createdAt: string;
}

interface DashboardData {
  pendingTasksCount: number;
  upcomingDeadlines: UpcomingTask[];
  myBalance: string;
  recentExpenses: RecentExpense[];
  recentNotes: RecentNote[];
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return new Date(dateString).toLocaleDateString();
}

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && !user.householdId) {
      router.push("/household/create");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user?.householdId) {
    return null;
  }

  return (
    <ProtectedRoute>
      <AppNavbar />
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [householdName, setHouseholdName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const [dashRes, householdRes] = await Promise.all([
        apiFetch("/api/dashboard"),
        user?.householdId
          ? apiFetch(`/api/households/${user.householdId}`)
          : Promise.resolve(null),
      ]);

      const dashData = await dashRes.json();
      if (dashRes.ok) {
        setData(dashData);
      } else {
        setError(dashData.message || "Failed to load dashboard.");
      }

      if (householdRes && householdRes.ok) {
        const household = await householdRes.json();
        setHouseholdName(household.name);
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [user?.householdId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const balance = parseFloat(data.myBalance);

  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-text font-serif">
            Welcome, {user?.name} 👋
          </h1>
          {householdName && (
            <p className="text-text-muted text-sm mt-1">{householdName}</p>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/tasks"
            className="bg-bg-card border border-border-light rounded-2xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
              <FiCheckSquare size={16} />
              Tasks
            </div>
            <p className="text-2xl font-bold text-text">
              {data.pendingTasksCount}
            </p>
            <p className="text-xs text-text-muted mt-1">pending</p>
          </Link>

          <Link
            href="/expenses/balances"
            className="bg-bg-card border border-border-light rounded-2xl p-5 hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center gap-2 text-text-muted text-sm mb-2">
              <FiDollarSign size={16} />
              My Balance
            </div>
            <p
              className={`text-2xl font-bold ${
                balance > 0
                  ? "text-green-600"
                  : balance < 0
                    ? "text-red-600"
                    : "text-text"
              }`}
            >
              {balance > 0 ? "+" : ""}${data.myBalance}
            </p>
            <p className="text-xs text-text-muted mt-1">
              {balance > 0
                ? "You are owed"
                : balance < 0
                  ? "You owe"
                  : "All settled"}
            </p>
          </Link>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
              📋 Upcoming Tasks
            </h2>
            <Link href="/tasks" className="text-xs text-primary hover:text-primary-dark transition-colors">
              View all
            </Link>
          </div>

          {data.upcomingDeadlines.length === 0 ? (
            <div className="bg-bg-card border border-border-light rounded-2xl p-5 text-center">
              <p className="text-sm text-text-muted">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="bg-bg-card border border-border-light rounded-2xl divide-y divide-border-light">
              {data.upcomingDeadlines.map((task) => (
                <div key={task.id} className="p-4 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{task.title}</p>
                    {task.assignees.length > 0 && (
                      <p className="text-xs text-text-muted mt-1">
                        Assigned: {task.assignees.map((a) => a.user.name).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-text-muted flex-shrink-0">
                    <FiClock size={12} />
                    {new Date(task.deadline).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
              💰 Recent Expenses
            </h2>
            <Link href="/expenses" className="text-xs text-primary hover:text-primary-dark transition-colors">
              View all
            </Link>
          </div>

          {data.recentExpenses.length === 0 ? (
            <div className="bg-bg-card border border-border-light rounded-2xl p-5 text-center">
              <p className="text-sm text-text-muted">No expenses yet</p>
            </div>
          ) : (
            <div className="bg-bg-card border border-border-light rounded-2xl divide-y divide-border-light">
              {data.recentExpenses.map((expense) => (
                <div key={expense.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text">{expense.description}</p>
                    <p className="text-xs text-text-muted mt-1">
                      Paid by: {expense.paidBy.name} · {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-text flex-shrink-0">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Notes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wide">
              📝 Recent Notes
            </h2>
            <Link href="/notes" className="text-xs text-primary hover:text-primary-dark transition-colors">
              View all
            </Link>
          </div>

          {data.recentNotes.length === 0 ? (
            <div className="bg-bg-card border border-border-light rounded-2xl p-5 text-center">
              <p className="text-sm text-text-muted">No notes yet</p>
            </div>
          ) : (
            <div className="bg-bg-card border border-border-light rounded-2xl divide-y divide-border-light">
              {data.recentNotes.map((note) => (
                <div key={note.id} className="p-4">
                  <p className="text-sm text-text line-clamp-2">
                    &ldquo;{note.content}&rdquo;
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    👤 {note.author.name} · {timeAgo(note.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
