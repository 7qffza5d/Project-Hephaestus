// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getPostOrFail(id: string) {
  return prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true } } },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostOrFail(id);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAuthor = post.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isVisible =
    post.visibility === "CLASS" || post.visibility === "SHARED";

  if (!isAuthor && !isAdmin && !isVisible) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(post);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostOrFail(id);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAuthor = post.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, body, type, visibility, pseudonym } = await req.json();

  // Handle shareToken:
  // - Set a new one if visibility is being changed TO "SHARED" and there isn't one yet
  // - Clear it if visibility is being changed AWAY from "SHARED"
  let shareToken = post.shareToken;
  if (visibility === "SHARED" && !shareToken) {
    shareToken = crypto.randomUUID();
  } else if (visibility && visibility !== "SHARED") {
    shareToken = null;
  }

  const updated = await prisma.post.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(body !== undefined && { body }),
      ...(type !== undefined && { type }),
      ...(visibility !== undefined && { visibility }),
      pseudonym: pseudonym !== undefined ? pseudonym?.trim() || null : undefined,
      shareToken,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostOrFail(id);

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAuthor = post.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.post.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}