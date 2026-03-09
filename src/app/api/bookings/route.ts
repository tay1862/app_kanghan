import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { bookingSchema } from "@/lib/validators";
import { generateInvoiceNumber, calculateNights } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { guestName: { contains: search } },
        { guestPhone: { contains: search } },
        { invoiceNumber: { contains: search } },
      ];
    }
    if (from) {
      where.checkIn = { ...(where.checkIn as object || {}), gte: new Date(from) };
    }
    if (to) {
      where.checkOut = { ...(where.checkOut as object || {}), lte: new Date(to) };
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          room: { include: { roomType: true } },
          creator: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error("GET /api/bookings error:", error);
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
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const checkIn = new Date(parsed.data.checkIn);
    const checkOut = new Date(parsed.data.checkOut);

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: "ວັນເຊັກເອົາຕ້ອງຫຼັງວັນເຊັກອິນ" },
        { status: 400 }
      );
    }

    // Check for overlapping bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        roomId: parsed.data.roomId,
        status: { not: "cancelled" },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { success: false, error: "ຫ້ອງນີ້ຖືກຈອງແລ້ວໃນຊ່ວງວັນທີ່ເລືອກ" },
        { status: 409 }
      );
    }

    // Generate invoice number
    const prefix = (await prisma.setting.findUnique({ where: { key: "invoice_prefix_booking" } }))?.value || "BK";
    const year = new Date().getFullYear();
    const lastBooking = await prisma.booking.findFirst({
      where: { invoiceNumber: { startsWith: `${prefix}-${year}` } },
      orderBy: { invoiceNumber: "desc" },
    });
    let seq = 1;
    if (lastBooking) {
      const lastSeq = parseInt(lastBooking.invoiceNumber.split("-").pop() || "0");
      seq = lastSeq + 1;
    }
    const invoiceNumber = generateInvoiceNumber(prefix, seq);

    const totalNights = calculateNights(checkIn, checkOut);
    const subtotal = parsed.data.nightPrice * totalNights;
    const totalAmount = subtotal - (parsed.data.discountAmount || 0);
    const depositAmount = parsed.data.depositAmount || 0;
    const remainingAmount = totalAmount - depositAmount;

    const booking = await prisma.booking.create({
      data: {
        invoiceNumber,
        roomId: parsed.data.roomId,
        guestName: parsed.data.guestName,
        guestPhone: parsed.data.guestPhone,
        guestNotes: parsed.data.guestNotes || null,
        checkIn,
        checkOut,
        numGuests: parsed.data.numGuests,
        nightPrice: parsed.data.nightPrice,
        totalNights,
        subtotal,
        discountAmount: parsed.data.discountAmount || 0,
        totalAmount,
        depositPercent: parsed.data.depositPercent || null,
        depositAmount,
        depositMethod: parsed.data.depositMethod || null,
        remainingAmount,
        status: "confirmed",
        paymentStatus: depositAmount >= totalAmount ? "paid" : depositAmount > 0 ? "partial" : "pending",
        createdBy: (session.user as { id: number }).id,
      },
      include: {
        room: { include: { roomType: true } },
      },
    });

    // Create payment record if deposit was paid
    if (depositAmount > 0 && parsed.data.depositMethod) {
      await prisma.bookingPayment.create({
        data: {
          bookingId: booking.id,
          amount: depositAmount,
          method: parsed.data.depositMethod,
          note: "ມັດຈຳ",
          createdBy: (session.user as { id: number }).id,
        },
      });
    }

    return NextResponse.json({ success: true, data: booking }, { status: 201 });
  } catch (error) {
    console.error("POST /api/bookings error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
