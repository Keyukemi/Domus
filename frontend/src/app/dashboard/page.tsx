"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";

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
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-text mb-2 font-serif">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-text-muted mb-8">
          You're logged in as <span className="font-medium text-text">{user?.email}</span>
        </p>
      </div>
    </ProtectedRoute>
  );
}
