// app/api/posts/share/[token]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const post = await prisma.post.findUnique({
    where: { shareToken: token },
    include: { author: { select: { id: true, name: true } } },
  });

  if (!post || post.visibility !== "SHARED") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Strip authorId from the public response — only expose what's needed
  const { authorId: _, ...safePost } = post;

  return NextResponse.json(safePost);
}