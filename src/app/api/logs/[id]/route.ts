import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const log = await prisma.requestLog.findUnique({ where: { id: params.id } });
    if (!log || log.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
    }

    await prisma.requestLog.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete log error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
