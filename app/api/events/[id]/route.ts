// app/api/events/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { title, description, startsAt, endsAt } = await req.json();

    const event = await prisma.event.update({
        where: { id: id },
        data: {
            ...(title && { title }),
            ...(description !== undefined && { description }),
            ...(startsAt && { startsAt: new Date(startsAt) }),
            ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
        },
    });

    return NextResponse.json(event);
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.event.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
}