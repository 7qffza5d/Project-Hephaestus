import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");
  if (!folderId) return NextResponse.json({ error: "folderId required" }, { status: 400 });

  const files = await prisma.fileItem.findMany({
    where: { folderId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(files);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folderId = formData.get("folderId") as string | null;

  if (!file || !folderId) {
    return NextResponse.json({ error: "file and folderId required" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 415 });
  }

  let blob;
  try {
    blob = await put(file.name, file, { access: "public" });
    console.log("Blob upload succeeded:", blob.url);
  } catch (e) {
    console.error("Blob upload failed:", e);
    return NextResponse.json({ error: "Storage upload failed" }, { status: 500 });
  }

  try {
    const fileItem = await prisma.fileItem.create({
      data: {
        folderId,
        uploaderId: session.user.id,
        name: file.name,
        url: blob.url,
        size: file.size,
        mimeType: file.type,
      },
    });
    console.log("DB write succeeded:", fileItem.id);
    return NextResponse.json(fileItem, { status: 201 });
  } catch (e){
    console.error("DB write failed:", e);
    await del(blob.url);
    return NextResponse.json({ error: "Database write failed" }, { status: 500 });
  }
}