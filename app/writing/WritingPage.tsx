"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthorDisplay from "@/app/components/AuthorDisplay";

type PostType = "BLOG" | "NOTE";
type Visibility = "PRIVATE" | "CLASS" | "SHARED";

interface Post {
  id: string;
  title: string;
  type: PostType;
  visibility: Visibility;
  pseudonym: string | null;
  createdAt: string;
  author: { id: string; name: string };
}

interface WritingPageProps {
  role: string;
  userId: string;
}

const TABS: PostType[] = ["BLOG", "NOTE"];

export default function WritingPage({ role, userId }: WritingPageProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<PostType>("BLOG");
  const [loading, setLoading] = useState(true);
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => p.type === tab);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Writing</h1>
        <Link
          href="/writing/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500
                     text-sm font-medium text-white transition-colors"
        >
          New post
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            {t[0] + t.slice(1).toLowerCase() + "s"}
          </button>
        ))}
      </div>

      {/* Feed */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">No {tab.toLowerCase()}s yet.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((post) => (
            <li key={post.id}>
              <Link
                href={`/writing/${post.id}`}
                className="block bg-gray-800 hover:bg-gray-750 border border-gray-700
                           rounded-lg px-5 py-4 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-medium mb-1">{post.title}</p>
                    <AuthorDisplay
                      author={post.author}
                      pseudonym={post.pseudonym}
                      isAdmin={isAdmin}
                    />
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <VisibilityBadge visibility={post.visibility} />
                    <span className="text-xs text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: Visibility }) {
  const styles: Record<Visibility, string> = {
    PRIVATE: "bg-gray-700 text-gray-300",
    CLASS:   "bg-green-900 text-green-300",
    SHARED:  "bg-blue-900 text-blue-300",
  };
  const labels: Record<Visibility, string> = {
    PRIVATE: "Private",
    CLASS:   "Class",
    SHARED:  "Shared",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles[visibility]}`}>
      {labels[visibility]}
    </span>
  );
}