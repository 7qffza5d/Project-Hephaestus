import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostEditor from "@/app/components/PostEditor";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!post) notFound();
  if (post.authorId !== session.user.id) notFound();

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col px-6 py-4">
      <h1 className="text-xl font-bold text-white mb-4">Edit post</h1>
      <div className="flex-1 min-h-0">
        <PostEditor initialData={post} />
      </div>
    </div>
  );
}