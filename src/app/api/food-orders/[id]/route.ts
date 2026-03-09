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
    const order = await prisma.foodOrder.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { orderBy: { sortOrder: "asc" } },
        creator: { select: { displayName: true } },
      },
    });
    if (!order) {
      return NextResponse.json({ success: false, error: "ບໍ່ພົບອໍເດີ" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("GET /api/food-orders/[id] error:", error);
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

    const items = (body.items || []).map((item: { name: string; quantity: number; unit: string; unitPrice: number; notes?: string }, index: number) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      notes: item.notes || null,
      sortOrder: index,
    }));

    const subtotal = items.reduce((sum: number, item: { totalPrice: number }) => sum + item.totalPrice, 0);
    const discountAmount = body.discountAmount || 0;
    const totalAmount = subtotal - discountAmount;
    const depositAmount = body.depositAmount || 0;
    const remainingAmount = totalAmount - depositAmount;

    await prisma.foodOrderItem.deleteMany({ where: { foodOrderId: parseInt(id) } });

    const order = await prisma.foodOrder.update({
      where: { id: parseInt(id) },
      data: {
        customerName: body.customerName || null,
        customerPhone: body.customerPhone || null,
        orderType: body.orderType,
        eventDate: body.eventDate ? new Date(body.eventDate) : null,
        numTables: body.numTables || null,
        numGuests: body.numGuests || null,
        subtotal,
        discountAmount,
        totalAmount,
        depositAmount,
        remainingAmount,
        paymentStatus: depositAmount >= totalAmount ? "paid" : depositAmount > 0 ? "partial" : "pending",
        notes: body.notes || null,
        items: { create: items },
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("PUT /api/food-orders/[id] error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
