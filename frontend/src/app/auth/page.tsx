"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const modeParam = searchParams.get("mode");
    if (modeParam === "register") {
      setMode("register");
    }
  }, [searchParams]);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function switchMode(newMode: "login" | "register") {
    setMode(newMode);
    setForm({ name: "", email: "", password: "" });
    setError("");
    setSuccess("");
    setFieldErrors({});
    setShowPassword(false);
  }

  function validate() {
    const errors: Record<string, string> = {};

    if (mode === "register" && !form.name.trim()) {
      errors.name = "Name is required.";
    }

    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      errors.password = "Password is required.";
    } else if (mode === "register") {
      if (form.password.length < 8) {
        errors.password = "Password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(form.password)) {
        errors.password = "Password must contain at least 1 uppercase letter.";
      } else if (!/\d/.test(form.password)) {
        errors.password = "Password must contain at least 1 number.";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = mode === "register" ? "register" : "login";
      const body =
        mode === "register"
          ? { name: form.name, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const res = await apiFetch(`/api/auth/${endpoint}`, {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      if (mode === "register") {
        setSuccess("Account created successfully!");
        setForm({ name: "", email: "", password: "" });
        setTimeout(() => switchMode("login"), 1500);
      } else {
        login(data.accessToken, data.user);
        router.push("/");
      }
    } catch {
      setError("Could not connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-10">
          <Image src="/Domus_l.png" alt="Domus logo" width={36} height={36} />
          <span className="text-xl font-semibold text-text">Domus</span>
        </Link>

        {/* Card */}
        <div className="bg-bg-card border border-border-light rounded-2xl p-8">
          {/* Tabs */}
          <div className="flex border-b border-border-light mb-8">
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                mode === "register"
                  ? "text-primary border-b-2 border-primary"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="text-2xl font-bold text-text mb-1 font-serif text-center">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-sm text-text-muted text-center mb-8">
            {mode === "login"
              ? "Log in to your Domus account."
              : "Join Domus and start managing your household."}
          </p>

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-6">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (register only) */}
            {mode === "register" && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-text mb-1.5">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Jane Doe"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text bg-bg placeholder:text-text-light outline-none transition-colors focus:border-primary ${
                    fieldErrors.name ? "border-red-400" : "border-border"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="jane@example.com"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm text-text bg-bg placeholder:text-text-light outline-none transition-colors focus:border-primary ${
                  fieldErrors.email ? "border-red-400" : "border-border"
                }`}
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"}
                  className={`w-full px-4 py-2.5 pr-11 rounded-lg border text-sm text-text bg-bg placeholder:text-text-light outline-none transition-colors focus:border-primary ${
                    fieldErrors.password ? "border-red-400" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPassword ? (
                    <HiEyeOff size={18} />
                  ) : (
                    <HiEye size={18} />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? mode === "login"
                  ? "Logging in..."
                  : "Creating account..."
                : mode === "login"
                  ? "Log In"
                  : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
