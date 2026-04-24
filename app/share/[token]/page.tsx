import { notFound } from "next/navigation";
import MarkdownPreview from "@/app/components/MarkdownPreview";
import AuthorDisplay from "@/app/components/AuthorDisplay";

export default async function Page({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/posts/share/${token}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const post = await res.json();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {post.type[0] + post.type.slice(1).toLowerCase()}
        </span>
      </div>

      <h1 className="text-2xl font-bold text-white mb-3">{post.title}</h1>

      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        {/* isAdmin is false — public viewers never see through pseudonyms */}
        <AuthorDisplay
          author={post.author}
          pseudonym={post.pseudonym}
          isAdmin={false}
        />
        <span>·</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      <hr className="border-gray-700 mb-6" />

      <MarkdownPreview content={post.body} />

      <p className="mt-10 text-xs text-gray-600 text-center">
        Shared from Classroom Hub
      </p>
    </div>
  );
}