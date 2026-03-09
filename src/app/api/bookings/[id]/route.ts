import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: {
        room: { include: { roomType: true } },
        payments: { orderBy: { paidAt: "desc" } },
        creator: { select: { displayName: true } },
      },
    });
    if (!booking) {
      return NextResponse.json({ success: false, error: "ບໍ່ພົບການຈອງ" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("GET /api/bookings/[id] error:", error);
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

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        guestName: body.guestName,
        guestPhone: body.guestPhone,
        guestNotes: body.guestNotes || null,
        numGuests: body.numGuests,
        nightPrice: body.nightPrice,
        totalNights: body.totalNights,
        subtotal: body.subtotal,
        discountAmount: body.discountAmount || 0,
        totalAmount: body.totalAmount,
        depositPercent: body.depositPercent || null,
        depositAmount: body.depositAmount || 0,
        depositMethod: body.depositMethod || null,
        remainingAmount: body.remainingAmount,
      },
      include: { room: { include: { roomType: true } } },
    });
    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error("PUT /api/bookings/[id] error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
