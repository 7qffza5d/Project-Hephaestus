"use client";

import { useEffect, useRef, useState } from "react";

type Folder = {
  id: string;
  name: string;
  _count: { files: number };
};

type FileItem = {
  id: string;
  name: string;
  url: string;
  size: number;
  createdAt: string;
};

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function VaultPage({ role, userId }: { role: string; userId: string }) {
  const isAdmin = role === "ADMIN";

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // New folder
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);

  // Upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    fetchFolders();
  }, []);

  useEffect(() => {
    if (selectedFolder) fetchFiles(selectedFolder.id);
  }, [selectedFolder]);

  async function fetchFolders() {
    const res = await fetch("/api/folders");
    const data = await res.json();
    setFolders(data);
    if (data.length > 0) setSelectedFolder(data[0]);
  }

  async function fetchFiles(folderId: string) {
    setLoadingFiles(true);
    const res = await fetch(`/api/files?folderId=${folderId}`);
    const data = await res.json();
    setFiles(data);
    setLoadingFiles(false);
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    if (res.ok) {
      setNewFolderName("");
      setShowNewFolder(false);
      fetchFolders();
    }
  }

  async function deleteFolder(folderId: string) {
    if (!confirm("Delete this folder and all its files?")) return;
    await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
    setSelectedFolder(null);
    setFiles([]);
    fetchFolders();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedFolder) return;
    setUploadError("");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folderId", selectedFolder.id);

    const res = await fetch("/api/files", { method: "POST", body: formData });
    if (res.ok) {
      fetchFiles(selectedFolder.id);
      fetchFolders();
    } else {
      const data = await res.json();
      setUploadError(data.error ?? "Upload failed");
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function deleteFile(fileId: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/files/${fileId}`, { method: "DELETE" });
    fetchFiles(selectedFolder!.id);
    fetchFolders();
  }

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-neutral-200 dark:border-neutral-800 flex flex-col">
        <div className="px-4 pt-4 pb-2 text-xs font-medium uppercase tracking-widest text-neutral-400">
          Folders
        </div>
        <nav className="flex-1 overflow-y-auto">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolder(folder)}
              className={[
                "w-full text-left px-4 py-2 text-sm flex items-center justify-between gap-2",
                selectedFolder?.id === folder.id
                  ? "bg-neutral-100 dark:bg-neutral-800 font-medium"
                  : "hover:bg-neutral-50 dark:hover:bg-neutral-900",
              ].join(" ")}
            >
              <span className="truncate">{folder.name}</span>
              <span className="text-xs text-neutral-400 shrink-0">{folder._count.files}</span>
            </button>
          ))}
        </nav>
        {isAdmin && (
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
            {showNewFolder ? (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createFolder()}
                  placeholder="Folder name"
                  className="text-sm border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 w-full bg-transparent"
                />
                <div className="flex gap-2">
                  <button onClick={createFolder} className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                    Create
                  </button>
                  <button onClick={() => setShowNewFolder(false)} className="text-xs text-neutral-400 hover:text-neutral-600">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewFolder(true)}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                + New folder
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        {!selectedFolder ? (
          <p className="text-sm text-neutral-400">
            {folders.length === 0 ? "No folders yet." : "Select a folder."}
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h1 className="text-base font-medium">{selectedFolder.name}</h1>
                <span className="text-sm text-neutral-400">{files.length} files</span>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="text-sm px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {uploading ? "Uploading…" : "+ Upload PDF"}
                    </button>
                    <button
                      onClick={() => deleteFolder(selectedFolder.id)}
                      className="text-sm px-3 py-1.5 rounded border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                    >
                      Delete folder
                    </button>
                  </>
                )}
              </div>
            </div>

            {uploadError && (
              <p className="text-sm text-red-500 mb-4">{uploadError}</p>
            )}

            {loadingFiles ? (
              <p className="text-sm text-neutral-400">Loading…</p>
            ) : files.length === 0 ? (
              <p className="text-sm text-neutral-400">No files in this folder yet.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 flex flex-col gap-2"
                  >
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-neutral-400">
                      {formatSize(file.size)} · {formatDate(file.createdAt)}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      >
                        Open
                      </a>
                      {isAdmin && (
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}