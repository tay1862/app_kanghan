import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { roomSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeId = searchParams.get("typeId");

    const rooms = await prisma.room.findMany({
      where: {
        isActive: true,
        ...(typeId ? { roomTypeId: parseInt(typeId) } : {}),
      },
      include: { roomType: true },
      orderBy: { roomNumber: "asc" },
    });
    return NextResponse.json({ success: true, data: rooms });
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = roomSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const existing = await prisma.room.findUnique({ where: { roomNumber: parsed.data.roomNumber } });
    if (existing) {
      return NextResponse.json({ success: false, error: "ເລກຫ້ອງນີ້ມີແລ້ວ" }, { status: 400 });
    }

    const room = await prisma.room.create({
      data: {
        roomTypeId: parsed.data.roomTypeId,
        roomNumber: parsed.data.roomNumber,
        floor: parsed.data.floor || null,
        notes: parsed.data.notes || null,
      },
      include: { roomType: true },
    });

    return NextResponse.json({ success: true, data: room }, { status: 201 });
  } catch (error) {
    console.error("POST /api/rooms error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
