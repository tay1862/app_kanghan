import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້"),
  password: z.string().min(1, "ກະລຸນາປ້ອນລະຫັດຜ່ານ"),
});

export const bookingSchema = z.object({
  roomId: z.number().int().positive("ກະລຸນາເລືອກຫ້ອງ"),
  guestName: z.string().min(1, "ກະລຸນາປ້ອນຊື່ແຂກ"),
  guestPhone: z.string().min(1, "ກະລຸນາປ້ອນເບີໂທ"),
  guestNotes: z.string().optional(),
  checkIn: z.string().min(1, "ກະລຸນາເລືອກວັນເຊັກອິນ"),
  checkOut: z.string().min(1, "ກະລຸນາເລືອກວັນເຊັກເອົາ"),
  numGuests: z.number().int().positive().default(1),
  nightPrice: z.number().positive("ລາຄາຕ້ອງຫຼາຍກວ່າ 0"),
  depositPercent: z.number().min(0).max(100).optional(),
  depositAmount: z.number().min(0).default(0),
  depositMethod: z.enum(["cash", "transfer", "other"]).optional(),
  discountAmount: z.number().min(0).default(0),
});

export const roomTypeSchema = z.object({
  name: z.string().min(1, "ກະລຸນາປ້ອນຊື່ປະເພດຫ້ອງ"),
  description: z.string().optional(),
  basePrice: z.number().positive("ລາຄາຕ້ອງຫຼາຍກວ່າ 0"),
  maxGuests: z.number().int().positive().default(2),
  category: z.enum(["room", "camping_own_tent", "camping_resort_tent"]),
  amenities: z.any().optional(),
  sortOrder: z.number().int().default(0),
});

export const roomSchema = z.object({
  roomTypeId: z.number().int().positive("ກະລຸນາເລືອກປະເພດຫ້ອງ"),
  roomNumber: z.string().min(1, "ກະລຸນາປ້ອນເລກຫ້ອງ"),
  floor: z.string().optional(),
  notes: z.string().optional(),
});

export const foodOrderSchema = z.object({
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  orderType: z.enum(["banquet", "ala_carte", "mixed"]),
  eventDate: z.string().optional(),
  numTables: z.number().int().min(0).optional(),
  numGuests: z.number().int().min(0).optional(),
  notes: z.string().optional(),
  depositAmount: z.number().min(0).default(0),
  discountAmount: z.number().min(0).default(0),
  items: z.array(
    z.object({
      name: z.string().min(1, "ກະລຸນາປ້ອນຊື່ລາຍການ"),
      quantity: z.number().positive("ຈຳນວນຕ້ອງຫຼາຍກວ່າ 0"),
      unit: z.string().default("ອັນ"),
      unitPrice: z.number().min(0, "ລາຄາຕ້ອງບໍ່ຕິດລົບ"),
      notes: z.string().optional(),
    })
  ),
});

export const foodPresetSchema = z.object({
  name: z.string().min(1, "ກະລຸນາປ້ອນຊື່ເມນູ"),
  defaultPrice: z.number().positive("ລາຄາຕ້ອງຫຼາຍກວ່າ 0"),
  unit: z.string().default("ອັນ"),
  category: z.string().optional(),
});

export const settingsSchema = z.record(z.string(), z.string());

export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type RoomTypeInput = z.infer<typeof roomTypeSchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type FoodOrderInput = z.infer<typeof foodOrderSchema>;
export type FoodPresetInput = z.infer<typeof foodPresetSchema>;
