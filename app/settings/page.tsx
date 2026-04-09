import Link from "next/link";

export default function SettingsPage() {
  return (
    <main className="max-w-sm space-y-6 py-10">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ul className="space-y-2">
        <li>
          <Link href="/settings/password" className="text-blue-600 hover:underline">
            Change password
          </Link>
        </li>
      </ul>
    </main>
  );
}