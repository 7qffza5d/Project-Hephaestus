"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm space-y-6 p-8">
        <h1 className="text-2xl font-bold">Log in</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" required
            className="w-full rounded border px-3 py-2" />
          <input name="password" type="password" placeholder="Password" required
            className="w-full rounded border px-3 py-2" />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}