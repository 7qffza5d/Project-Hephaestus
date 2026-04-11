// app/api/homework/[id]/complete/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.homeworkCompletion.findUnique({
    where: {
      userId_homeworkItemId: {
        userId: session.user.id,
        homeworkItemId: params.id,
      },
    },
  });

  if (existing) {
    await prisma.homeworkCompletion.delete({
      where: {
        userId_homeworkItemId: {
          userId: session.user.id,
          homeworkItemId: params.id,
        },
      },
    });
    return NextResponse.json({ done: false });
  } else {
    await prisma.homeworkCompletion.create({
      data: {
        userId: session.user.id,
        homeworkItemId: params.id,
      },
    });
    return NextResponse.json({ done: true });
  }
}