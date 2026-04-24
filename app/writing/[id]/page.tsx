import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostPage from "./PostPage";

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

  const isAuthor = post.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isVisible = post.visibility === "CLASS" || post.visibility === "SHARED";

  if (!isAuthor && !isAdmin && !isVisible) notFound();

  return (
    <PostPage
      post={post}
      role={session.user.role}
      userId={session.user.id}
    />
  );
}