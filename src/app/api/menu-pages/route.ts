import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const pages = await prisma.menuPage.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error("GET /api/menu-pages error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const title = formData.get("title") as string || "";
    const sortOrder = parseInt(formData.get("sortOrder") as string || "0");

    if (!file) {
      return NextResponse.json({ success: false, error: "ກະລຸນາອັບໂຫຼດຮູບ" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "menu");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `menu-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/menu/${fileName}`;

    const page = await prisma.menuPage.create({
      data: {
        title,
        imageUrl,
        sortOrder,
      },
    });

    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error) {
    console.error("POST /api/menu-pages error:", error);
    return NextResponse.json({ success: false, error: "ເກີດຂໍ້ຜິດພາດ" }, { status: 500 });
  }
}
