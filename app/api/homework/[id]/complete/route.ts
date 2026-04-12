// app/api/homework/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.homeworkCompletion.findUnique({
    where: {
      userId_homeworkItemId: {
        userId: session.user.id,
        homeworkItemId: id,
      },
    },
  });

  if (existing) {
    await prisma.homeworkCompletion.delete({
      where: {
        userId_homeworkItemId: {
          userId: session.user.id,
          homeworkItemId: id,
        },
      },
    });
    return NextResponse.json({ done: false });
  } else {
    await prisma.homeworkCompletion.create({
      data: {
        userId: session.user.id,
        homeworkItemId: id,
      },
    });
    return NextResponse.json({ done: true });
  }
}