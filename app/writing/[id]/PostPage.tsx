"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MarkdownPreview from "@/app/components/MarkdownPreview";
import AuthorDisplay from "@/app/components/AuthorDisplay";

interface Post {
    id: string;
    title: string;
    body: string;
    type: string;
    visibility: string;
    pseudonym: string | null;
    shareToken: string | null;
    createdAt: string;
    author: { id: string; name: string };
}

interface PostPageProps {
    post: Post;
    role: string;
    userId: string;
}

export default function PostPage({ post, role, userId }: PostPageProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const isAdmin = role === "ADMIN";
    const isAuthor = post.author.id === userId;
    const shareUrl =
        post.shareToken
            ? `${window.location.origin}/share/${post.shareToken}`
            : null;

    async function handleDelete() {
        if (!confirm("Delete this post? This cannot be undone.")) return;
        setDeleting(true);
        await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
        router.push("/writing");
        router.refresh();
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">

            {/* Back */}
            <Link
                href="/writing"
                className="text-sm text-gray-400 hover:text-gray-200 mb-6 inline-block"
            >
                ← Writing
            </Link>

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-2xl font-bold text-white">{post.title}</h1>
                    {(isAuthor || isAdmin) && (
                        <div className="flex gap-2 shrink-0">
                            {isAuthor && (
                                <Link
                                    href={`/writing/${post.id}/edit`}
                                    className="px-3 py-1.5 rounded-lg border border-gray-600
                             text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                                >
                                    Edit
                                </Link>
                            )}
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-3 py-1.5 rounded-lg border border-red-800
                           text-sm text-red-400 hover:bg-red-900/30
                           disabled:opacity-50 transition-colors"
                            >
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <AuthorDisplay
                        author={post.author}
                        pseudonym={post.pseudonym}
                        isAdmin={isAdmin}
                    />
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="capitalize">{post.type.toLowerCase()}</span>
                </div>

                {/* Share link */}
                {shareUrl && (
                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-xs text-gray-500">Public link:</span>
                        <a
                            href={shareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline truncate"
                        >
                            {shareUrl}
                        </a>
                        <button
                            onClick={() => navigator.clipboard.writeText(shareUrl)}
                            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                )}
            </div>

            <hr className="border-gray-700 mb-6" />

            {/* Body */}
            <MarkdownPreview content={post.body} />
        </div>
    );
}