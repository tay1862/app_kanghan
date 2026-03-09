import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { roomTypeSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const roomType = await prisma.roomType.findUnique({
      where: { id: parseInt(id) },
      include: {
        rooms: { where: { isActive: true }, orderBy: { roomNumber: "asc" } },
      },
    });
    if (!roomType) {
      return NextResponse.json({ success: false, error: "ບໍ່ພົບປະເພດຫ້ອງ" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: roomType });
  } catch (error) {
    console.error("GET /api/room-types/[id] error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}

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
    const parsed = roomTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const roomType = await prisma.roomType.update({
      where: { id: parseInt(id) },
      data: {
        name: parsed.data.name,
        description: parsed.data.description || null,
        basePrice: parsed.data.basePrice,
        maxGuests: parsed.data.maxGuests,
        category: parsed.data.category,
        amenities: parsed.data.amenities || null,
        sortOrder: parsed.data.sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: roomType });
  } catch (error) {
    console.error("PUT /api/room-types/[id] error:", error);
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
    await prisma.roomType.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/room-types/[id] error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
