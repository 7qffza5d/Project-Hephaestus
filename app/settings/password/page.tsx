"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const form = e.currentTarget;
    const currentPassword = (form.elements.namedItem("currentPassword") as HTMLInputElement).value;
    const newPassword = (form.elements.namedItem("newPassword") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.ok) {
      setSuccess(true);
      form.reset();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
    setLoading(false);
  }

  return (
    <main className="max-w-sm space-y-6 py-10">
      <h1 className="text-2xl font-bold">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="currentPassword" type="password" placeholder="Current password" required
          className="w-full rounded border px-3 py-2" />
        <input name="newPassword" type="password" placeholder="New password" required
          className="w-full rounded border px-3 py-2" />
        <input name="confirmPassword" type="password" placeholder="Confirm new password" required
          className="w-full rounded border px-3 py-2" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">Password changed successfully.</p>}
        <button type="submit" disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Saving..." : "Change password"}
        </button>
      </form>
    </main>
  );
}