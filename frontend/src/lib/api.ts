const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("accessToken");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && !path.startsWith("/api/auth")) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    // Use replaceState + dispatchEvent to trigger React re-render without full reload
    window.history.replaceState(null, "", "/auth");
    window.dispatchEvent(new Event("storage"));
    throw new Error("Unauthorized");
  }

  return res;
}
