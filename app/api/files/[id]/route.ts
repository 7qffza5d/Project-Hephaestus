import { del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const fileItem = await prisma.fileItem.findUnique({ where: { id } });
  if (!fileItem) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Delete from Vercel Blob first, then DB
  try {
    await del(fileItem.url);
  } catch {
    return NextResponse.json({ error: "Storage delete failed" }, { status: 500 });
  }

  await prisma.fileItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}