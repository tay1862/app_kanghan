import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const VALID_TRANSITIONS: Record<string, string[]> = {
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const { status } = await request.json();

    const booking = await prisma.booking.findUnique({ where: { id: parseInt(id) } });
    if (!booking) {
      return NextResponse.json({ success: false, error: "ບໍ່ພົບການຈອງ" }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[booking.status] || [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { success: false, error: `ບໍ່ສາມາດປ່ຽນສະຖານະຈາກ ${booking.status} ເປັນ ${status}` },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (status === "checked_in") {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: "occupied" },
      });
    }

    if (status === "checked_out") {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: "available" },
      });
    }

    if (status === "cancelled") {
      await prisma.room.update({
        where: { id: booking.roomId },
        data: { status: "available" },
      });
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { room: { include: { roomType: true } } },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PATCH /api/bookings/[id]/status error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
