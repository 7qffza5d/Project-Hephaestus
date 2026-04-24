// app/components/PostEditor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MarkdownPreview from "./MarkdownPreview";

type PostType = "BLOG" | "NOTE";
type Visibility = "PRIVATE" | "CLASS" | "SHARED";

interface PostEditorProps {
  // If provided, we're editing an existing post
  initialData?: {
    id: string;
    title: string;
    body: string;
    type: PostType;
    visibility: Visibility;
    pseudonym: string | null;
  };
}

export default function PostEditor({ initialData }: PostEditorProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [body, setBody] = useState(initialData?.body ?? "");
  const [type, setType] = useState<PostType>(initialData?.type ?? "BLOG");
  const [visibility, setVisibility] = useState<Visibility>(
    initialData?.visibility ?? "PRIVATE"
  );
  const [pseudonym, setPseudonym] = useState(initialData?.pseudonym ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      setError("Title and body are required.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: title.trim(),
      body,
      type,
      visibility,
      pseudonym: pseudonym.trim() || null,
    };

    try {
      const res = await fetch(
        isEditing ? `/api/posts/${initialData.id}` : "/api/posts",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Something went wrong.");
      }

      const post = await res.json();
      router.push(`/writing/${post.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Title */}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 min-w-48 bg-gray-800 border border-gray-700 rounded-lg
                     px-3 py-2 text-sm text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Type toggle */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700 text-sm">
          {(["BLOG", "NOTE"] as PostType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-2 transition-colors ${
                type === t
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {t[0] + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Visibility */}
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as Visibility)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2
                     text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="PRIVATE">Private</option>
          <option value="CLASS">Class</option>
          <option value="SHARED">Shared link</option>
        </select>

        {/* Pseudonym */}
        <input
          type="text"
          placeholder="Post as… (optional)"
          value={pseudonym}
          onChange={(e) => setPseudonym(e.target.value)}
          className="w-44 bg-gray-800 border border-gray-700 rounded-lg
                     px-3 py-2 text-sm text-white placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Save */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="ml-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500
                     disabled:opacity-50 text-sm font-medium text-white transition-colors"
        >
          {saving ? "Saving…" : isEditing ? "Save changes" : "Publish"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      {/* Split pane */}
      <div className="flex flex-1 gap-4 min-h-0">

        {/* Editor — left */}
        <div className="flex flex-col w-1/2">
          <p className="text-xs text-gray-500 mb-1 font-mono">Markdown</p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              "Write in Markdown…\n\nInline math: $E = mc^2$\nBlock math:\n$$\n\\int_0^\\infty e^{-x}\\,dx = 1\n$$\n\nCode:\n```python\nprint('hello')\n```"
            }
            className="flex-1 resize-none bg-gray-900 border border-gray-700 rounded-lg
                       p-4 font-mono text-sm text-gray-200 leading-relaxed
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
        </div>

        {/* Preview — right */}
        <div className="flex flex-col w-1/2">
          <p className="text-xs text-gray-500 mb-1 font-mono">Preview</p>
          <div
            className="flex-1 overflow-y-auto bg-gray-900 border border-gray-700
                       rounded-lg p-4 text-gray-200"
          >
            {body.trim() ? (
              <MarkdownPreview content={body} />
            ) : (
              <p className="text-gray-600 text-sm italic">
                Nothing to preview yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}