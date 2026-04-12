// app/api/homework/[id]/route.ts
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

    const { title, subject, dueDate, resourceUrl } = await req.json();

    const item = await prisma.homeworkItem.update({
        where: { id: id },
        data: {
            ...(title && { title }),
            ...(subject && { subject }),
            ...(dueDate && { dueDate: new Date(dueDate) }),
            ...(resourceUrl !== undefined && { resourceUrl }),
        },
    });

    return NextResponse.json(item);
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

    await prisma.homeworkItem.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
}