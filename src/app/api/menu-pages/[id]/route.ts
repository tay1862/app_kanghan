import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();

    const page = await prisma.menuPage.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        sortOrder: body.sortOrder,
      },
    });
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("PUT /api/menu-pages/[id] error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await prisma.menuPage.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/menu-pages/[id] error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
