import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json({ success: false, error: "ກະລຸນາລະບຸວັນທີ" }, { status: 400 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        status: { not: "cancelled" },
        checkIn: { lt: new Date(to) },
        checkOut: { gt: new Date(from) },
      },
      select: {
        id: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        status: true,
        roomId: true,
        room: {
          select: {
            roomNumber: true,
            roomType: { select: { name: true } },
          },
        },
      },
      orderBy: { checkIn: "asc" },
    });

    const data = bookings.map((b) => ({
      id: b.id,
      guestName: b.guestName,
      checkIn: b.checkIn.toISOString().split("T")[0],
      checkOut: b.checkOut.toISOString().split("T")[0],
      status: b.status,
      roomId: b.roomId,
      roomNumber: b.room.roomNumber,
      roomTypeName: b.room.roomType.name,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/bookings/calendar error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
