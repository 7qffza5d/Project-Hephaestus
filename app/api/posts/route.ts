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

  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error("Failed to parse request body:", e);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  console.log("POST /api/posts body:", body);

  const { title, body: postBody, type, visibility, pseudonym } = body;

  if (!title || !postBody || !type) {
    return NextResponse.json(
      { error: "title, body, and type are required" },
      { status: 400 }
    );
  }

  const shareToken =
    visibility === "SHARED" ? crypto.randomUUID() : undefined;

    console.log("session.user.id:", session.user.id);
  try {
    const post = await prisma.post.create({
      data: {
        authorId: session.user.id,
        title,
        body: postBody,
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
  } catch (e) {
    console.error("Prisma error:", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}