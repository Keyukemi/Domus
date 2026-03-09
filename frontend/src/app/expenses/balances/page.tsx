"use client";

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";

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
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              {balances.map((balance, index) => (
                <div
                  key={index}
                  className="bg-bg-card border border-border-light rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                        {balance.from.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-text">{balance.from.name}</p>
                        <p className="text-xs text-text-muted">owes</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <FiArrowRight size={16} className="text-text-muted" />
                      <span className="text-sm font-semibold text-primary">
                        ${balance.amount}
                      </span>
                      <FiArrowRight size={16} className="text-text-muted" />
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-text">{balance.to.name}</p>
                        <p className="text-xs text-text-muted">is owed</p>
                      </div>
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 text-sm font-medium">
                        {balance.to.name.charAt(0).toUpperCase()}
                      </span>
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
