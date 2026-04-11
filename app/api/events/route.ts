// app/api/events/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await prisma.event.findMany({
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, startsAt, endsAt } = await req.json();
  if (!title || !startsAt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      title,
      description: description ?? null,
      startsAt: new Date(startsAt),
      endsAt: endsAt ? new Date(endsAt) : null,
      userId: session.user.id,
    },
  });

  return NextResponse.json(event, { status: 201 });
}