// app/homework/HomeworkPage.tsx
"use client";

import { useEffect, useState } from "react";
import HomeworkItem from "@/app/components/HomeworkItem";
import AddHomeworkModal from "@/app/components/AddHomeworkModal";

type HWItem = {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  resourceUrl: string | null;
  completions: { userId: string }[];
};

function getStatus(dueDate: string): "overdue" | "soon" | "upcoming" {
  const diff = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "overdue";
  if (diff <= 3) return "soon";
  return "upcoming";
}

export default function HomeworkPage({ userId, role }: { userId: string; role: string }) {
  const [items, setItems] = useState<HWItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<HWItem | null>(null);
  const isAdmin = role === "ADMIN";
  console.log("role = ", role);

  async function load() {
    const res = await fetch("/api/homework");
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => { load(); }, []);

  async function handleToggle(id: string) {
    await fetch(`/api/homework/${id}/complete`, { method: "POST" });
    await load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/homework/${id}`, { method: "DELETE" });
    await load();
  }

  function handleEdit(id: string) {
    const item = items.find(i => i.id === id) ?? null;
    setEditing(item);
    setModalOpen(true);
  }

  const overdue  = items.filter(i => getStatus(i.dueDate) === "overdue");
  const soon     = items.filter(i => getStatus(i.dueDate) === "soon");
  const upcoming = items.filter(i => getStatus(i.dueDate) === "upcoming");

  function renderGroup(group: HWItem[], label: string) {
    if (group.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2">
          {label}
        </p>
        <div className="flex flex-col gap-2">
          {group.map(item => (
            <HomeworkItem
              key={item.id}
              {...item}
              done={item.completions.length > 0}
              isAdmin={isAdmin}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Homework</h1>
        {isAdmin && (
          <button
            onClick={() => { setEditing(null); setModalOpen(true); }}
            className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            + Add item
          </button>
        )}
      </div>

      {items.length === 0 && (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">No homework items yet.</p>
      )}

      {renderGroup(overdue, "Overdue")}
      {renderGroup(soon, "Due soon")}
      {renderGroup(upcoming, "Upcoming")}

      <AddHomeworkModal
        open={modalOpen}
        initial={editing ? {
          id: editing.id,
          title: editing.title,
          subject: editing.subject,
          dueDate: editing.dueDate,
          resourceUrl: editing.resourceUrl ?? "",
        } : undefined}
        onClose={() => setModalOpen(false)}
        onSave={load}
      />
    </div>
  );
}