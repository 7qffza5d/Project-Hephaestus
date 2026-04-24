import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import PostEditor from "@/app/components/PostEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/posts/${id}`,
    { cache: "no-store" }
  );

  if (res.status === 404 || res.status === 403) notFound();
  if (!res.ok) throw new Error("Failed to load post");

  const post = await res.json();

  // Only the author can reach the edit page
  if (post.author.id !== session.user.id) notFound();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col px-6 py-4">
      <h1 className="text-xl font-bold text-white mb-4">Edit post</h1>
      <div className="flex-1 min-h-0">
        <PostEditor initialData={post} />
      </div>
    </div>
  );
}