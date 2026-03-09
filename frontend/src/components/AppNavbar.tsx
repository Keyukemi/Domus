"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { FiLogOut, FiSettings, FiHome, FiCheckSquare, FiDollarSign } from "react-icons/fi";

export default function AppNavbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-border-light max-w-7xl mx-auto">
      <Link href="/dashboard" className="flex items-center gap-2">
        <Image src="/Domus_l.png" alt="Domus logo" width={32} height={32} />
        <span className="text-lg font-semibold text-text">Domus</span>
      </Link>

      <div className="flex items-center gap-4 md:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
        >
          <FiHome size={16} />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>

        {user?.householdId && (
          <Link
            href="/tasks"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <FiCheckSquare size={16} />
            <span className="hidden sm:inline">Tasks</span>
          </Link>
        )}

        {user?.householdId && (
          <Link
            href="/expenses"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <FiDollarSign size={16} />
            <span className="hidden sm:inline">Expenses</span>
          </Link>
        )}

        {user?.householdId && (
          <Link
            href="/household/settings"
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors"
          >
            <FiSettings size={16} />
            <span className="hidden sm:inline">Household</span>
          </Link>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-red-500 transition-colors"
        >
          <FiLogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </nav>
  );
}
