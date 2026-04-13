// app/components/AddHomeworkModal.tsx
"use client";

import { useState, useEffect } from "react";

type HomeworkFormData = {
  title: string;
  subject: string;
  dueDate: string;
  fileItemId: string;
};

type Folder = {
  id: string;
  name: string;
};

type FileItem = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  initial?: { id: string } & HomeworkFormData;
  onClose: () => void;
  onSave: () => void;
};

export default function AddHomeworkModal({ open, initial, onClose, onSave }: Props) {
  const [form, setForm] = useState<HomeworkFormData>({
    title: "", subject: "", dueDate: "", fileItemId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    if (open) fetchFolders();
  }, [open]);

  useEffect(() => {
    if (selectedFolderId) fetchFiles(selectedFolderId);
    else setFiles([]);
  }, [selectedFolderId]);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        subject: initial.subject,
        dueDate: initial.dueDate.slice(0, 10),
        fileItemId: initial.fileItemId ?? "",
      });
    } else {
      setForm({ title: "", subject: "", dueDate: "", fileItemId: "" });
      setSelectedFolderId("");
      setFiles([]);
    }
    setError("");
  }, [initial, open]);

  async function fetchFolders() {
    const res = await fetch("/api/folders");
    const data = await res.json();
    setFolders(data);
  }

  async function fetchFiles(folderId: string) {
    const res = await fetch(`/api/files?folderId=${folderId}`);
    const data = await res.json();
    setFiles(data);
  }

  if (!open) return null;

  async function handleSubmit() {
    if (!form.title || !form.subject || !form.dueDate) {
      setError("Title, subject, and due date are required.");
      return;
    }
    setLoading(true);
    const method = initial ? "PATCH" : "POST";
    const url = initial ? `/api/homework/${initial.id}` : "/api/homework";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        fileItemId: form.fileItemId || null,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Something went wrong. Please try again.");
      return;
    }
    onSave();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-md shadow-none">
        <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-4">
          {initial ? "Edit item" : "Add homework"}
        </h2>

        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />
          <input
            type="date"
            value={form.dueDate}
            onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
          />

          {/* File picker */}
          <div className="flex flex-col gap-2">
            <select
              value={selectedFolderId}
              onChange={e => {
                setSelectedFolderId(e.target.value);
                setForm(f => ({ ...f, fileItemId: "" }));
              }}
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            >
              <option value="">Attach a file — pick folder (optional)</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>{folder.name}</option>
              ))}
            </select>
            {selectedFolderId && (
              <select
                value={form.fileItemId}
                onChange={e => setForm(f => ({ ...f, fileItemId: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
              >
                <option value="">No file</option>
                {files.map(file => (
                  <option key={file.id} value={file.id}>{file.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="text-sm px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}