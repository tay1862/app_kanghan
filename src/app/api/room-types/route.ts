import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { roomTypeSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const roomTypes = await prisma.roomType.findMany({
      where: { isActive: true },
      include: {
        rooms: {
          where: { isActive: true },
          orderBy: { roomNumber: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: roomTypes });
  } catch (error) {
    console.error("GET /api/room-types error:", error);
    return NextResponse.json(
      { success: false, error: "ເກີດຂໍ້ຜິດພາດ" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = roomTypeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const roomType = await prisma.roomType.create({
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

    return NextResponse.json({ success: true, data: roomType }, { status: 201 });
  } catch (error) {
    console.error("POST /api/room-types error:", error);
    return NextResponse.json(
      { success: false, error: "ເກີດຂໍ້ຜິດພາດ" },
      { status: 500 }
    );
  }
}
