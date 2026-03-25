"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiLogOut,
  FiSettings,
  FiHome,
  FiCheckSquare,
  FiDollarSign,
  FiFileText,
  FiMenu,
  FiX,
} from "react-icons/fi";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on Escape key
  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: <FiHome size={18} /> },
    ...(user?.householdId
      ? [
          { href: "/tasks", label: "Tasks", icon: <FiCheckSquare size={18} /> },
          { href: "/expenses", label: "Expenses", icon: <FiDollarSign size={18} /> },
          { href: "/notes", label: "Notes", icon: <FiFileText size={18} /> },
          { href: "/household/settings", label: "Household", icon: <FiSettings size={18} /> },
        ]
      : []),
  ];

  return (
    <nav className="border-b border-border-light">
      <div className="flex items-center justify-between px-6 md:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/Domus_l.png" alt="Domus logo" width={32} height={32} />
          <span className="text-lg font-semibold text-text">Domus</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                pathname === link.href
                  ? "text-primary font-medium"
                  : "text-text-muted hover:text-text"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 text-sm text-text-muted hover:text-red-500 transition-colors"
          >
            <FiLogOut size={16} />
            Logout
          </button>
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen((current) => !current)}
          className="sm:hidden p-2 text-text-muted hover:text-text transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-border-light" onClick={closeMenu}>
          <div className="px-6 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors ${
                  pathname === link.href
                    ? "text-primary bg-primary/5 font-medium"
                    : "text-text-muted hover:text-text hover:bg-bg-feature"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}

            <button
              onClick={() => {
                closeMenu();
                logout();
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors w-full"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
