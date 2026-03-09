export const APP_NAME = "Kanghan Valley Resort & Camping";
export const APP_NAME_LAO = "ກັງຫັນ ວາເລ ຣີສອດ ແອນ ແຄັມປິງ";

export const CURRENCY = "LAK";
export const CURRENCY_SYMBOL = "₭";

export const DEFAULT_CHECK_IN_TIME = "14:00";
export const DEFAULT_CHECK_OUT_TIME = "11:00";
export const DEFAULT_DEPOSIT_PERCENT = 30;

export const INVOICE_PREFIX_BOOKING = "BK";
export const INVOICE_PREFIX_FOOD = "FB";

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  confirmed: "ຢືນຢັນແລ້ວ",
  checked_in: "ເຊັກອິນແລ້ວ",
  checked_out: "ເຊັກເອົາແລ້ວ",
  cancelled: "ຍົກເລີກ",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "ລໍຖ້າ",
  partial: "ຈ່າຍບາງສ່ວນ",
  paid: "ຈ່າຍແລ້ວ",
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "ເງິນສົດ",
  transfer: "ໂອນ",
  other: "ອື່ນໆ",
};

export const FOOD_ORDER_TYPE_LABELS: Record<string, string> = {
  banquet: "ໂຕະຈີນ",
  ala_carte: "ສັ່ງເມນູ",
  mixed: "ປະສົມ",
};

export const FOOD_ORDER_STATUS_LABELS: Record<string, string> = {
  draft: "ແບບຮ່າງ",
  confirmed: "ຢືນຢັນແລ້ວ",
  completed: "ສຳເລັດ",
  cancelled: "ຍົກເລີກ",
};

export const ROOM_CATEGORY_LABELS: Record<string, string> = {
  room: "ຫ້ອງພັກ",
  camping_own_tent: "ກາງເຕັນ (ເອົາເຕັນມາເອງ)",
  camping_resort_tent: "ກາງເຕັນ (ເຕັນຂອງຣີສອດ)",
};

export const ROOM_STATUS_LABELS: Record<string, string> = {
  available: "ຫວ່າງ",
  occupied: "ມີຄົນພັກ",
  maintenance: "ສ້ອມແປງ",
};

export const UNIT_OPTIONS = [
  { value: "ອັນ", label: "ອັນ" },
  { value: "ຈານ", label: "ຈານ" },
  { value: "ກິໂລ", label: "ກິໂລ" },
  { value: "ແພັກ", label: "ແພັກ" },
  { value: "ຂວດ", label: "ຂວດ" },
  { value: "ແກ້ວ", label: "ແກ້ວ" },
  { value: "ໂຕະ", label: "ໂຕະ" },
  { value: "ຊຸດ", label: "ຊຸດ" },
];

export const NAV_ITEMS = [
  { href: "/app/dashboard", label: "ໜ້າຫຼັກ", icon: "LayoutDashboard" },
  { href: "/app/bookings", label: "ຈອງຫ້ອງ", icon: "CalendarCheck" },
  { href: "/app/rooms", label: "ຫ້ອງພັກ", icon: "BedDouble" },
  { href: "/app/food-orders", label: "ບິນອາຫານ", icon: "UtensilsCrossed" },
  { href: "/app/music", label: "ເພງ", icon: "Music" },
  { href: "/app/menu-admin", label: "ເມນູ", icon: "BookOpen" },
  { href: "/app/settings", label: "ຕັ້ງຄ່າ", icon: "Settings" },
] as const;
