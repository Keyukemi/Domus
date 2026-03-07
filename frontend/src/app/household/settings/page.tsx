"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { FiCopy, FiCheck, FiUserMinus, FiArrowRight } from "react-icons/fi";
import AppNavbar from "@/components/AppNavbar";

interface Member {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Household {
  id: string;
  name: string;
  inviteCode: string;
  members: Member[];
}

export default function HouseholdSettingsPage() {
  return (
    <ProtectedRoute>
      <HouseholdSettings />
    </ProtectedRoute>
  );
}

function HouseholdSettings() {
  const { user, updateUser } = useAuth();
  const [household, setHousehold] = useState<Household | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isAdmin = user?.role === "ADMIN";

  const fetchHousehold = useCallback(async () => {
    if (!user?.householdId) return;

    try {
      const res = await apiFetch(`/api/households/${user.householdId}`);
      const data = await res.json();

      if (res.ok) {
        setHousehold(data);
      } else {
        setError(data.message || "Failed to load household.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [user?.householdId]);

  useEffect(() => {
    fetchHousehold();
  }, [fetchHousehold]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-text-muted">Loading...</p>
      </div>
    );
  }

  if (!user?.householdId || !household) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-text-muted mb-4">You don&apos;t belong to a household yet.</p>
          <a href="/household/create" className="text-primary hover:underline">
            Create or join one
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
    <AppNavbar />
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-text font-serif">Household Settings</h1>

        {error && (
          <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <HouseholdInfoCard
          household={household}
          isAdmin={isAdmin}
          onUpdate={fetchHousehold}
          setError={setError}
        />

        {isAdmin && <InviteCodeCard inviteCode={household.inviteCode} />}

        <MembersCard
          household={household}
          currentUserId={user.id}
          isAdmin={isAdmin}
          onUpdate={fetchHousehold}
          updateUser={updateUser}
          user={user}
          setError={setError}
        />
      </div>
    </div>
    </>
  );
}

/* ── Household Info Card ── */

function HouseholdInfoCard({
  household,
  isAdmin,
  onUpdate,
  setError,
}: {
  household: Household;
  isAdmin: boolean;
  onUpdate: () => Promise<void>;
  setError: (msg: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(household.name);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await apiFetch(`/api/households/${household.id}`, {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim() }),
      });

      if (res.ok) {
        await onUpdate();
        setEditing(false);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to update name.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-bg-card border border-border-light rounded-2xl p-6">
      <p className="text-sm font-medium text-text-muted mb-2">Household Name</p>
      {editing ? (
        <div className="flex gap-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="flex-1 px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => {
              setName(household.name);
              setEditing(false);
            }}
            className="px-4 py-2 border border-border text-sm font-medium rounded-lg text-text hover:bg-bg-feature transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-text">{household.name}</p>
          {isAdmin && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-primary hover:underline"
            >
              Edit
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Invite Code Card ── */

function InviteCodeCard({ inviteCode }: { inviteCode: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-bg-card border border-border-light rounded-2xl p-6">
      <p className="text-sm font-medium text-text-muted mb-2">Invite Code</p>
      <div className="flex items-center justify-between">
        <p className="text-lg font-mono font-bold tracking-widest text-text">{inviteCode}</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="text-xs text-text-muted mt-2">
        Share this code with others so they can join your household.
      </p>
    </div>
  );
}

/* ── Members Card ── */

function MembersCard({
  household,
  currentUserId,
  isAdmin,
  onUpdate,
  updateUser,
  user,
  setError,
}: {
  household: Household;
  currentUserId: string;
  isAdmin: boolean;
  onUpdate: () => Promise<void>;
  updateUser: (user: { id: string; email: string; name: string; role: string; householdId: string | null }) => void;
  user: { id: string; email: string; name: string; role: string; householdId: string | null };
  setError: (msg: string) => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function handleRemove(memberId: string) {
    if (!confirm("Are you sure you want to remove this member?")) return;

    setActionLoading(memberId);
    setError("");

    try {
      const res = await apiFetch(`/api/households/${household.id}/members/${memberId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await onUpdate();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to remove member.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleTransferAdmin(memberId: string) {
    if (!confirm("Are you sure you want to transfer admin rights? You will become a regular member.")) return;

    setActionLoading(memberId);
    setError("");

    try {
      const res = await apiFetch(`/api/households/${household.id}/transfer-admin/${memberId}`, {
        method: "PATCH",
      });

      if (res.ok) {
        updateUser({ ...user, role: "MEMBER" });
        await onUpdate();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to transfer admin role.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="bg-bg-card border border-border-light rounded-2xl p-6">
      <p className="text-sm font-medium text-text-muted mb-4">
        Members ({household.members.length})
      </p>
      <div className="space-y-3">
        {household.members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between py-3 px-4 rounded-xl bg-bg-feature"
          >
            <div>
              <p className="text-sm font-medium text-text">
                {member.name}
                {member.id === currentUserId && (
                  <span className="text-text-muted ml-1">(you)</span>
                )}
              </p>
              <p className="text-xs text-text-muted">{member.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  member.role === "ADMIN"
                    ? "bg-primary/10 text-primary"
                    : "bg-accent-light/30 text-text-muted"
                }`}
              >
                {member.role}
              </span>

              {isAdmin && member.id !== currentUserId && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleTransferAdmin(member.id)}
                    disabled={actionLoading === member.id}
                    title="Transfer admin"
                    className="p-1.5 text-text-muted hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <FiArrowRight size={16} />
                  </button>
                  <button
                    onClick={() => handleRemove(member.id)}
                    disabled={actionLoading === member.id}
                    title="Remove member"
                    className="p-1.5 text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    <FiUserMinus size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
