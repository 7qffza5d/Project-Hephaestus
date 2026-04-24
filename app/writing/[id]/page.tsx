import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import PostPage from "./PostPage";

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

  return (
    <PostPage
      post={post}
      role={session.user.role}
      userId={session.user.id}
    />
  );
}