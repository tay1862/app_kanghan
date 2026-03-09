import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { foodOrderSchema } from "@/lib/validators";
import { generateInvoiceNumber } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: Record<string, unknown> = {};
    if (status && status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { invoiceNumber: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.foodOrder.findMany({
        where,
        include: {
          items: { orderBy: { sortOrder: "asc" } },
          creator: { select: { displayName: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.foodOrder.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: orders, total, page, pageSize });
  } catch (error) {
    console.error("GET /api/food-orders error:", error);
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
    const parsed = foodOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "ຂໍ້ມູນບໍ່ຖືກຕ້ອງ" },
        { status: 400 }
      );
    }

    const prefix = (await prisma.setting.findUnique({ where: { key: "invoice_prefix_food" } }))?.value || "FB";
    const year = new Date().getFullYear();
    const lastOrder = await prisma.foodOrder.findFirst({
      where: { invoiceNumber: { startsWith: `${prefix}-${year}` } },
      orderBy: { invoiceNumber: "desc" },
    });
    let seq = 1;
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.invoiceNumber.split("-").pop() || "0");
      seq = lastSeq + 1;
    }
    const invoiceNumber = generateInvoiceNumber(prefix, seq);

    const items = parsed.data.items.map((item, index) => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      notes: item.notes || null,
      sortOrder: index,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalAmount = subtotal - (parsed.data.discountAmount || 0);
    const depositAmount = parsed.data.depositAmount || 0;
    const remainingAmount = totalAmount - depositAmount;

    const order = await prisma.foodOrder.create({
      data: {
        invoiceNumber,
        customerName: parsed.data.customerName || null,
        customerPhone: parsed.data.customerPhone || null,
        orderType: parsed.data.orderType,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
        numTables: parsed.data.numTables || null,
        numGuests: parsed.data.numGuests || null,
        subtotal,
        discountAmount: parsed.data.discountAmount || 0,
        totalAmount,
        depositAmount,
        remainingAmount,
        paymentStatus: depositAmount >= totalAmount ? "paid" : depositAmount > 0 ? "partial" : "pending",
        status: "draft",
        notes: parsed.data.notes || null,
        createdBy: (session.user as { id: number }).id,
        items: {
          create: items,
        },
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    console.error("POST /api/food-orders error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
