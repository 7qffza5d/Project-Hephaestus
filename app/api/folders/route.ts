import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await prisma.folder.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { files: true } } },
  });

  return NextResponse.json(folders);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const folder = await prisma.folder.create({ data: { name: name.trim() } });
  return NextResponse.json(folder, { status: 201 });
}