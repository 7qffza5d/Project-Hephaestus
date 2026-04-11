// app/components/AddEventModal.tsx
"use client";

import { useState, useEffect } from "react";

type EventFormData = {
    title: string;
    description: string;
    startsDate: string;
    startsTime: string;
    endsDate: string;
    endsTime: string;
};

type Props = {
    open: boolean;
    initial?: {
        id: string;
        title: string;
        description: string;
        startsAt: string;
        endsAt: string | null;
    };
    onClose: () => void;
    onSave: () => void;
};

export default function AddEventModal({ open, initial, onClose, onSave }: Props) {
    const [form, setForm] = useState<EventFormData>({
        title: "", description: "",
        startsDate: "", startsTime: "",
        endsDate: "", endsTime: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (initial) {
            const starts = new Date(initial.startsAt);
            const ends = initial.endsAt ? new Date(initial.endsAt) : null;
            setForm({
                title: initial.title,
                description: initial.description ?? "",
                startsDate: starts.toISOString().slice(0, 10),
                startsTime: starts.toISOString().slice(11, 16),
                endsDate: ends ? ends.toISOString().slice(0, 10) : "",
                endsTime: ends ? ends.toISOString().slice(11, 16) : "",
            });
        } else {
            setForm({
                title: "",
                description: "",
                startsDate: "",
                startsTime: "",
                endsDate: "",
                endsTime: "",
            });
        }
        setError("");
    }, [initial, open]);

    if (!open) return null;

    async function handleSubmit() {
        if (!form.title || !form.startsDate || !form.startsTime) {
            setError("Title, start date, and start time are required.");
            return;
        }
        setLoading(true);
        const method = initial ? "PATCH" : "POST";
        const url = initial ? `/api/events/${initial.id}` : "/api/events";
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: form.title,
                description: form.description || null,
                startsAt: `${form.startsDate}T${form.startsTime}`,
                endsAt: form.endsDate && form.endsTime
                    ? `${form.endsDate}T${form.endsTime}`
                    : null,
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
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 w-full max-w-md">
                <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-100 mb-4">
                    {initial ? "Edit event" : "Add event"}
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
                        placeholder="Description (optional)"
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-400 dark:text-zinc-500">Start date</label>
                        <input
                            type="date"
                            value={form.startsDate}
                            onChange={e => setForm(f => ({ ...f, startsDate: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-400 dark:text-zinc-500">Start time</label>
                        <input
                            type="time"
                            value={form.startsTime}
                            onChange={e => setForm(f => ({ ...f, startsTime: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-400 dark:text-zinc-500">End date (optional)</label>
                        <input
                            type="date"
                            value={form.endsDate}
                            onChange={e => setForm(f => ({ ...f, endsDate: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-zinc-400 dark:text-zinc-500">End time (optional)</label>
                        <input
                            type="time"
                            value={form.endsTime}
                            onChange={e => setForm(f => ({ ...f, endsTime: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                        />
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
        </div>
    );
}