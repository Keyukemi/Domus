"use client";

import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-text mb-2 font-serif">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-text-muted mb-8">
          You're logged in as <span className="font-medium text-text">{user?.email}</span>
        </p>
        <button
          onClick={logout}
          className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
        >
          Log Out
        </button>
      </div>
    </ProtectedRoute>
  );
}
