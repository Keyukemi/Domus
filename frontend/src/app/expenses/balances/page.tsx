"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiCheck } from "react-icons/fi";

interface Balance {
  from: { id: string; name: string; email: string };
  to: { id: string; name: string; email: string };
  amount: string;
}

export default function BalancesPage() {
  return (
    <ProtectedRoute>
      <BalancesSummary />
    </ProtectedRoute>
  );
}

function BalancesSummary() {
  const { user } = useAuth();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settleTarget, setSettleTarget] = useState<Balance | null>(null);
  const [settleAmount, setSettleAmount] = useState("");
  const [settling, setSettling] = useState(false);

  const fetchBalances = useCallback(async () => {
    try {
      const res = await apiFetch("/api/expenses/balances");
      const data = await res.json();

      if (res.ok) {
        setBalances(data);
      } else {
        setError(data.message || "Failed to load balances.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  function openSettleForm(balance: Balance) {
    setSettleTarget(balance);
    setSettleAmount(balance.amount);
    setError("");
  }

  async function handleSettle(e: React.FormEvent) {
    e.preventDefault();
    if (!settleTarget || !user) return;
    setSettling(true);
    setError("");

    try {
      const res = await apiFetch("/api/expenses/settlements", {
        method: "POST",
        body: JSON.stringify({
          fromUserId: settleTarget.from.id,
          toUserId: settleTarget.to.id,
          amount: parseFloat(settleAmount),
        }),
      });

      if (res.ok) {
        setSettleTarget(null);
        setSettleAmount("");
        await fetchBalances();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to record settlement.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSettling(false);
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
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Link
              href="/expenses"
              className="p-1.5 text-text-muted hover:text-text transition-colors"
            >
              <FiArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-text font-serif">Balances</h1>
          </div>

          {error && (
            <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {balances.length === 0 ? (
            <div className="bg-bg-card border border-border-light rounded-2xl p-12 text-center">
              <p className="text-text-muted">All settled up! No balances owed.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((balance) => {
                const isInvolved = user?.id === balance.from.id || user?.id === balance.to.id;
                const balanceKey = `${balance.from.id}-${balance.to.id}`;

                return (
                  <div
                    key={balanceKey}
                    className="bg-bg-card border border-border-light rounded-2xl p-5"
                  >
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-sm font-medium flex-shrink-0">
                          {balance.from.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-text">{balance.from.name}</p>
                          <p className="text-xs text-text-muted">owes</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiArrowRight size={16} className="text-text-muted hidden sm:block" />
                        <span className="text-sm font-semibold text-primary">
                          ${balance.amount}
                        </span>
                        <FiArrowRight size={16} className="text-text-muted hidden sm:block" />
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right sm:text-right text-left">
                          <p className="text-sm font-medium text-text">{balance.to.name}</p>
                          <p className="text-xs text-text-muted">is owed</p>
                        </div>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-medium flex-shrink-0">
                          {balance.to.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {isInvolved && (
                      <div className="mt-3 pt-3 border-t border-border-light">
                        <button
                          onClick={() => openSettleForm(balance)}
                          className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
                        >
                          <FiCheck size={14} />
                          Settle Up
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Settle Up Form */}
          {settleTarget && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setSettleTarget(null)}>
              <div className="absolute inset-0 bg-black/40" />
              <div
                className="relative bg-bg-card border border-border-light rounded-2xl shadow-lg max-w-sm w-full mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-semibold text-text font-serif">Settle Up</h2>
                <p className="text-sm text-text-muted mt-1">
                  {settleTarget.from.name} owes {settleTarget.to.name} ${settleTarget.amount}
                </p>

                <form onSubmit={handleSettle} className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="settleAmount" className="block text-sm font-medium text-text-muted mb-1.5">
                      Amount to settle
                    </label>
                    <input
                      id="settleAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={settleAmount}
                      onChange={(e) => setSettleAmount(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={settling || !settleAmount}
                      className="flex-1 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                    >
                      {settling ? "Recording..." : "Record Payment"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettleTarget(null)}
                      className="px-4 py-2 border border-border text-sm font-medium rounded-lg text-text hover:bg-bg-feature transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
