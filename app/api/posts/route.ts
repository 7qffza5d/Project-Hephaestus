// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { authorId: session.user.id },
        { visibility: "CLASS" },
        { visibility: "SHARED" },
      ],
    },
    include: {
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, type, visibility, pseudonym } = await req.json();

  if (!title || !body || !type) {
    return NextResponse.json(
      { error: "title, body, and type are required" },
      { status: 400 }
    );
  }

  const shareToken =
    visibility === "SHARED" ? crypto.randomUUID() : undefined;

  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      title,
      body,
      type,
      visibility: visibility ?? "PRIVATE",
      pseudonym: pseudonym?.trim() || null,
      shareToken,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(post, { status: 201 });
}