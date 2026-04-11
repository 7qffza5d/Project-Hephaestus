// app/schedule/SchedulePage.tsx
"use client";

import { useEffect, useState } from "react";
import AddEventModal from "@/app/components/AddEventModal";

type CalEvent = {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SchedulePage({ role }: { role: string }) {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [view, setView] = useState<"calendar" | "agenda">("calendar");
  const [cursor, setCursor] = useState(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CalEvent | null>(null);
  const isAdmin = role === "ADMIN";

  async function load() {
    const res = await fetch("/api/events");
    const data = await res.json();
    setEvents(data);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this event?")) return;
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    await load();
  }

  function handleEdit(event: CalEvent) {
    setEditing(event);
    setModalOpen(true);
  }

  // Calendar grid helpers
  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells: { date: Date; thisMonth: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), thisMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), thisMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, cells.length - daysInMonth - firstDay + 1), thisMonth: false });
  }

  const today = new Date();

  function eventsOnDay(date: Date) {
    return events.filter(e => isSameDay(new Date(e.startsAt), date));
  }

  const selectedEvents = eventsOnDay(selected);

  // Agenda: group upcoming events by month
  const upcoming = events
    .filter(e => new Date(e.startsAt) >= new Date(today.getFullYear(), today.getMonth(), 1))
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const grouped = upcoming.reduce<Record<string, CalEvent[]>>((acc, e) => {
    const key = new Date(e.startsAt).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100">Schedule</h1>
        <div className="flex items-center gap-2">
          <div className="flex border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setView("calendar")}
              className={[
                "text-sm px-3 py-1.5",
                view === "calendar"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("agenda")}
              className={[
                "text-sm px-3 py-1.5",
                view === "agenda"
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800",
              ].join(" ")}
            >
              Agenda
            </button>
          </div>
          {isAdmin && (
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="text-sm px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            >
              + Add event
            </button>
          )}
        </div>
      </div>

      {view === "calendar" && (
        <div className="grid grid-cols-[1fr_220px] gap-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setCursor(new Date(year, month - 1, 1))}
                className="text-sm px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ‹
              </button>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {cursor.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => setCursor(new Date(year, month + 1, 1))}
                className="text-sm px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                ›
              </button>
            </div>

            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {DOW.map(d => (
                <div key={d} className="text-center text-xs font-medium text-zinc-400 dark:text-zinc-500 py-1 uppercase tracking-wider">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {cells.map(({ date, thisMonth }, i) => {
                const dayEvents = eventsOnDay(date);
                const isToday = isSameDay(date, today);
                const isSelected = isSameDay(date, selected);
                return (
                  <div
                    key={i}
                    onClick={() => setSelected(date)}
                    className={[
                      "min-h-[56px] rounded-lg p-1.5 cursor-pointer border",
                      isSelected
                        ? "border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-800"
                        : "border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800",
                    ].join(" ")}
                  >
                    <div className="flex justify-start mb-1">
                      {isToday ? (
                        <span className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-medium">
                          {date.getDate()}
                        </span>
                      ) : (
                        <span className={[
                          "text-xs",
                          thisMonth
                            ? "text-zinc-600 dark:text-zinc-400"
                            : "text-zinc-300 dark:text-zinc-600",
                        ].join(" ")}>
                          {date.getDate()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayEvents.slice(0, 2).map(e => (
                        <div
                          key={e.id}
                          className="text-xs px-1 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 truncate"
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 bg-white dark:bg-zinc-900 self-start">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
              {formatDateLabel(selected)}
            </p>
            {selectedEvents.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">No events</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedEvents.map(e => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800"
                  >
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{e.title}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {formatTime(e.startsAt)}
                      {e.endsAt && ` — ${formatTime(e.endsAt)}`}
                    </p>
                    {e.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{e.description}</p>
                    )}
                    {isAdmin && (
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEdit(e)}
                          className="text-xs px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="text-xs px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {view === "agenda" && (
        <div className="flex flex-col">
          {Object.keys(grouped).length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No upcoming events.</p>
          )}
          {Object.entries(grouped).map(([monthLabel, monthEvents]) => (
            <div key={monthLabel}>
              <p className="text-xs font-medium uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 mt-4 first:mt-0">
                {monthLabel}
              </p>
              <div className="flex flex-col gap-2">
                {monthEvents.map(e => {
                  const d = new Date(e.startsAt);
                  return (
                    <div
                      key={e.id}
                      className="flex gap-4 items-start px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    >
                      <div className="text-center min-w-[32px]">
                        <div className="text-lg font-medium text-zinc-900 dark:text-zinc-100 leading-none">
                          {d.getDate()}
                        </div>
                        <div className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                          {DOW[d.getDay()]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{e.title}</p>
                        {e.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{e.description}</p>
                        )}
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {formatTime(e.startsAt)}
                          {e.endsAt && ` — ${formatTime(e.endsAt)}`}
                        </p>
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleEdit(e)}
                            className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(e.id)}
                            className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-red-500"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddEventModal
        open={modalOpen}
        initial={editing ? {
          id: editing.id,
          title: editing.title,
          description: editing.description ?? "",
          startsAt: editing.startsAt,
          endsAt: editing.endsAt ?? "",
        } : undefined}
        onClose={() => setModalOpen(false)}
        onSave={load}
      />
    </div>
  );
}