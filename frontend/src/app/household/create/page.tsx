"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function CreateHouseholdPage() {
  return (
    <ProtectedRoute>
      <CreateHouseholdForm />
    </ProtectedRoute>
  );
}

function CreateHouseholdForm() {
  const router = useRouter();
  const { user, updateUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.householdId) {
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Household name is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch("/api/households", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // Update the user's householdId and role in auth context
      if (user) {
        updateUser({ ...user, householdId: data.id, role: "ADMIN" });
      }

      router.push("/dashboard");
    } catch {
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-bg-card border border-border-light rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-text mb-1 font-serif text-center">
            Create Your Household
          </h1>
          <p className="text-sm text-text-muted text-center mb-8">
            Give your household a name to get started. You&apos;ll be the admin.
          </p>

          {error && (
            <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
                Household Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. The Downtown Flat"
                maxLength={100}
                className="w-full px-4 py-2.5 rounded-lg border border-border text-sm text-text bg-bg placeholder:text-text-light outline-none transition-colors focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Household"}
            </button>
          </form>

          <p className="text-sm text-text-muted text-center mt-6">
            Already have an invite code?{" "}
            <a href="/household/join" className="text-primary hover:underline">
              Join a household
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
