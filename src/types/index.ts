export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export interface SessionUser {
  id: number;
  username: string;
  displayName: string;
  role: "admin" | "staff";
}

export interface RoomTypeWithRooms {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  maxGuests: number;
  category: "room" | "camping_own_tent" | "camping_resort_tent";
  amenities: unknown;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  rooms: RoomBasic[];
}

export interface RoomBasic {
  id: number;
  roomNumber: string;
  floor: string | null;
  status: "available" | "occupied" | "maintenance";
  isActive: boolean;
}

export interface BookingWithRoom {
  id: number;
  invoiceNumber: string;
  roomId: number;
  guestName: string;
  guestPhone: string;
  guestNotes: string | null;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  nightPrice: number;
  totalNights: number;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  depositPercent: number | null;
  depositAmount: number;
  depositMethod: string | null;
  remainingAmount: number;
  status: "confirmed" | "checked_in" | "checked_out" | "cancelled";
  paymentStatus: "pending" | "partial" | "paid";
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  room: {
    id: number;
    roomNumber: string;
    roomType: {
      id: number;
      name: string;
      category: string;
    };
  };
}

export interface FoodOrderWithItems {
  id: number;
  invoiceNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  orderType: "banquet" | "ala_carte" | "mixed";
  eventDate: string | null;
  numTables: number | null;
  numGuests: number | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: "pending" | "partial" | "paid";
  status: "draft" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  createdAt: string;
  items: FoodOrderItemData[];
}

export interface FoodOrderItemData {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
  sortOrder: number;
}

export interface CalendarBooking {
  id: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
}

export interface DashboardStats {
  totalRooms: number;
  occupiedToday: number;
  checkInsToday: number;
  checkOutsToday: number;
  monthlyRevenue: number;
  pendingBookings: number;
}

export interface MusicSong {
  youtubeId: string;
  title: string;
  thumbnailUrl: string | null;
  duration: number | null;
}

export interface QueueItem extends MusicSong {
  id: number;
  position: number;
  status: "pending" | "playing" | "played" | "skipped";
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: MusicSong | null;
  position: number;
  duration: number;
  volume: number;
  queue: QueueItem[];
}
