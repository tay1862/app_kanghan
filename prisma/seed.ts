import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await hash("Te1862005", 12);
  const staffPassword = await hash("staff123", 12);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: adminPassword,
      displayName: "ແອັດມິນ",
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { username: "staff" },
    update: {},
    create: {
      username: "staff",
      passwordHash: staffPassword,
      displayName: "ພະນັກງານ",
      role: "staff",
    },
  });

  console.log("Users created: admin/Te1862005, staff/staff123");

  // Create room types
  const kanghan = await prisma.roomType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: "ເຮືອນກັງຫັນ",
      description: "ເຮືອນພັກແບບກັງຫັນ ບັນຍາກາດທຳມະຊາດ",
      basePrice: 650000,
      maxGuests: 4,
      category: "room",
      sortOrder: 1,
    },
  });

  const samLiam = await prisma.roomType.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: "ເຮືອນສາມຫຼ່ຽມ",
      description: "ເຮືອນພັກແບບສາມຫຼ່ຽມ ທັນສະໄໝ",
      basePrice: 650000,
      maxGuests: 4,
      category: "room",
      sortOrder: 2,
    },
  });

  const lao = await prisma.roomType.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: "ເຮືອນລາວ",
      description: "ເຮືອນພັກແບບລາວດັ້ງເດີມ",
      basePrice: 350000,
      maxGuests: 2,
      category: "room",
      sortOrder: 3,
    },
  });

  const campingOwn = await prisma.roomType.upsert({
    where: { id: 4 },
    update: {},
    create: {
      name: "ກາງເຕັນ (ເອົາເຕັນມາເອງ)",
      description: "ພື້ນທີ່ກາງເຕັນ ລູກຄ້າເອົາເຕັນມາເອງ",
      basePrice: 100000,
      maxGuests: 4,
      category: "camping_own_tent",
      sortOrder: 4,
    },
  });

  const campingResort = await prisma.roomType.upsert({
    where: { id: 5 },
    update: {},
    create: {
      name: "ກາງເຕັນ (ເຕັນຂອງຣີສອດ)",
      description: "ພື້ນທີ່ກາງເຕັນ ພ້ອມເຕັນຂອງຣີສອດ",
      basePrice: 200000,
      maxGuests: 4,
      category: "camping_resort_tent",
      sortOrder: 5,
    },
  });

  console.log("Room types created");

  // Create rooms for each type
  const roomData = [
    { typeId: kanghan.id, prefix: "KH", count: 5 },
    { typeId: samLiam.id, prefix: "SL", count: 5 },
    { typeId: lao.id, prefix: "LO", count: 4 },
    { typeId: campingOwn.id, prefix: "CO", count: 5 },
    { typeId: campingResort.id, prefix: "CR", count: 5 },
  ];

  for (const { typeId, prefix, count } of roomData) {
    for (let i = 1; i <= count; i++) {
      const roomNumber = `${prefix}-${String(i).padStart(2, "0")}`;
      await prisma.room.upsert({
        where: { roomNumber },
        update: {},
        create: {
          roomTypeId: typeId,
          roomNumber,
          status: "available",
        },
      });
    }
  }

  console.log("Rooms created");

  // Create default settings
  const defaultSettings = [
    { key: "business_name", value: "Kanghan Valley Resort & Camping" },
    { key: "business_name_lao", value: "ກັງຫັນ ວາເລ ຣີສອດ ແອນ ແຄັມປິງ" },
    { key: "business_address", value: "" },
    { key: "business_phone", value: "" },
    { key: "check_in_time", value: "14:00" },
    { key: "check_out_time", value: "11:00" },
    { key: "default_deposit_percent", value: "30" },
    { key: "currency", value: "LAK" },
    { key: "currency_symbol", value: "₭" },
    { key: "invoice_prefix_booking", value: "BK" },
    { key: "invoice_prefix_food", value: "FB" },
  ];

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }

  console.log("Settings created");
  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
