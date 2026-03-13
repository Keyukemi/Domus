"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppNavbar from "@/components/AppNavbar";
import ConfirmModal from "@/components/ConfirmModal";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

interface Note {
  id: string;
  content: string;
  author: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

function timeAgo(dateString: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  return new Date(dateString).toLocaleDateString();
}

export default function NotesPage() {
  return (
    <ProtectedRoute>
      <NotesList />
    </ProtectedRoute>
  );
}

function NotesList() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteContent, setNoteContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const res = await apiFetch("/api/notes");
      const data = await res.json();

      if (res.ok) {
        setNotes(data);
      } else {
        setError(data.message || "Failed to load notes.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  function openCreateModal() {
    setEditingNote(null);
    setNoteContent("");
    setModalError("");
    setModalOpen(true);
  }

  function openEditModal(note: Note) {
    setEditingNote(note);
    setNoteContent(note.content);
    setModalError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingNote(null);
    setNoteContent("");
    setModalError("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setModalError("");

    try {
      const isEditing = !!editingNote;
      const url = isEditing ? `/api/notes/${editingNote.id}` : "/api/notes";
      const method = isEditing ? "PATCH" : "POST";

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ content: noteContent.trim() }),
      });

      if (res.ok) {
        closeModal();
        await fetchNotes();
      } else {
        const data = await res.json();
        setModalError(data.message || "Failed to save note.");
      }
    } catch {
      setModalError("Could not connect to the server.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const res = await apiFetch(`/api/notes/${deleteId}`, { method: "DELETE" });

      if (res.ok) {
        await fetchNotes();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete note.");
      }
    } catch {
      setError("Could not connect to the server.");
    } finally {
      setDeleteId(null);
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
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text font-serif">Notes</h1>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
            >
              <FiPlus size={16} />
              New Note
            </button>
          </div>

          {error && (
            <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {notes.length === 0 ? (
            <div className="bg-bg-card border border-border-light rounded-2xl p-12 text-center">
              <p className="text-text-muted">No notes yet — create one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-bg-card border border-border-light rounded-2xl p-5"
                >
                  <p className="text-sm text-text whitespace-pre-wrap">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-text-muted">
                      👤 {note.author.name} · {timeAgo(note.createdAt)}
                    </p>

                    {user?.id === note.author.id && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(note)}
                          className="p-1.5 text-text-muted hover:text-primary transition-colors"
                          title="Edit note"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteId(note.id)}
                          className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                          title="Delete note"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Note Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-bg-card border border-border-light rounded-2xl shadow-lg max-w-md w-full mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text font-serif">
                {editingNote ? "Edit Note" : "New Note"}
              </h2>
              <button
                onClick={closeModal}
                className="text-text-muted hover:text-text transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="text-center bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave}>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={5}
                placeholder="Write a note for your household..."
                className="w-full px-4 py-2 rounded-lg border border-border text-sm text-text bg-bg outline-none focus:border-primary resize-none"
                autoFocus
              />

              <div className="flex flex-col gap-3 mt-4">
                <button
                  type="submit"
                  disabled={saving || !noteContent.trim()}
                  className="w-full px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Note"}
                </button>

                {editingNote && (
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      setDeleteId(editingNote.id);
                    }}
                    className="w-full px-4 py-2 text-red-600 text-sm font-medium hover:text-red-700 transition-colors"
                  >
                    Delete Note
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteId}
        title="Delete Note"
        message="Are you sure you want to delete this note? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
