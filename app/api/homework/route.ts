// app/api/homework/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await prisma.homeworkItem.findMany({
    orderBy: { dueDate: "asc" },
    include: {
      completions: {
        where: { userId: session.user.id },
      },
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, subject, dueDate, resourceUrl } = await req.json();
  if (!title || !subject || !dueDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const item = await prisma.homeworkItem.create({
    data: {
      title,
      subject,
      dueDate: new Date(dueDate),
      userId: session.user.id,
    },
  });

  return NextResponse.json(item, { status: 201 });
}