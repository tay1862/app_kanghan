import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import {
  BedDouble,
  CalendarCheck,
  LogIn,
  LogOut,
  DollarSign,
  Clock,
} from "lucide-react";
import Link from "next/link";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [
    totalRooms,
    occupiedToday,
    checkInsToday,
    checkOutsToday,
    monthlyBookings,
    recentBookings,
  ] = await Promise.all([
    prisma.room.count({ where: { isActive: true } }),
    prisma.booking.count({
      where: {
        status: "checked_in",
        checkIn: { lte: today },
        checkOut: { gt: today },
      },
    }),
    prisma.booking.count({
      where: {
        checkIn: { gte: today, lt: tomorrow },
        status: { not: "cancelled" },
      },
    }),
    prisma.booking.count({
      where: {
        checkOut: { gte: today, lt: tomorrow },
        status: { in: ["checked_in", "checked_out"] },
      },
    }),
    prisma.booking.aggregate({
      _sum: { totalAmount: true },
      where: {
        createdAt: { gte: monthStart },
        status: { not: "cancelled" },
      },
    }),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        room: {
          include: { roomType: true },
        },
      },
    }),
  ]);

  return {
    totalRooms,
    occupiedToday,
    checkInsToday,
    checkOutsToday,
    monthlyRevenue: Number(monthlyBookings._sum.totalAmount || 0),
    recentBookings,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/app/login");

  let stats;
  try {
    stats = await getStats();
  } catch {
    stats = {
      totalRooms: 0,
      occupiedToday: 0,
      checkInsToday: 0,
      checkOutsToday: 0,
      monthlyRevenue: 0,
      recentBookings: [],
    };
  }

  const statCards = [
    {
      label: "ຫ້ອງທັງໝົດ",
      value: stats.totalRooms,
      icon: BedDouble,
      color: "text-primary",
      bg: "bg-primary-light",
    },
    {
      label: "ມີຄົນພັກວັນນີ້",
      value: stats.occupiedToday,
      icon: CalendarCheck,
      color: "text-info",
      bg: "bg-info-light",
    },
    {
      label: "ເຊັກອິນວັນນີ້",
      value: stats.checkInsToday,
      icon: LogIn,
      color: "text-success",
      bg: "bg-success-light",
    },
    {
      label: "ເຊັກເອົາວັນນີ້",
      value: stats.checkOutsToday,
      icon: LogOut,
      color: "text-warning",
      bg: "bg-warning-light",
    },
    {
      label: "ລາຍຮັບເດືອນນີ້",
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: "text-secondary-dark",
      bg: "bg-secondary-light",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ໜ້າຫຼັກ</h1>
        <p className="text-sm text-neutral-500">
          ພາບລວມຂອງລະບົບ Kanghan Valley Resort & Camping
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.bg}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div>
                  <p className="text-xs text-neutral-500">{card.label}</p>
                  <p className="text-lg font-bold text-neutral-900">
                    {card.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href="/app/bookings/new"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-primary hover:bg-primary-light"
        >
          <CalendarCheck className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">ຈອງຫ້ອງໃໝ່</span>
        </Link>
        <Link
          href="/app/food-orders/new"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-primary hover:bg-primary-light"
        >
          <DollarSign className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">ອອກບິນອາຫານ</span>
        </Link>
        <Link
          href="/app/bookings"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-primary hover:bg-primary-light"
        >
          <Clock className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium">ປະຫວັດການຈອງ</span>
        </Link>
        <Link
          href="/app/music"
          className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm transition-colors hover:border-primary hover:bg-primary-light"
        >
          <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          <span className="text-sm font-medium">ເປີດເພງ</span>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-neutral-900">
            ການຈອງລ່າສຸດ
          </h2>
          <Link
            href="/app/bookings"
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            ເບິ່ງທັງໝົດ
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-left text-xs font-medium uppercase text-neutral-500">
                <th className="px-6 py-3">ເລກບິນ</th>
                <th className="px-6 py-3">ແຂກ</th>
                <th className="px-6 py-3">ຫ້ອງ</th>
                <th className="px-6 py-3">ສະຖານະ</th>
                <th className="px-6 py-3">ຍອດລວມ</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-neutral-400"
                  >
                    ຍັງບໍ່ມີການຈອງ
                  </td>
                </tr>
              ) : (
                stats.recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-neutral-50 hover:bg-neutral-50"
                  >
                    <td className="px-6 py-3 font-mono text-xs">
                      {booking.invoiceNumber}
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {booking.guestName}
                    </td>
                    <td className="px-6 py-3 text-neutral-500">
                      {booking.room.roomType.name} - {booking.room.roomNumber}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="px-6 py-3 font-medium">
                      {formatCurrency(Number(booking.totalAmount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-info-light text-info",
    checked_in: "bg-success-light text-success",
    checked_out: "bg-neutral-100 text-neutral-500",
    cancelled: "bg-danger-light text-danger",
  };
  const labels: Record<string, string> = {
    confirmed: "ຢືນຢັນແລ້ວ",
    checked_in: "ເຊັກອິນແລ້ວ",
    checked_out: "ເຊັກເອົາແລ້ວ",
    cancelled: "ຍົກເລີກ",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || "bg-neutral-100 text-neutral-500"}`}
    >
      {labels[status] || status}
    </span>
  );
}
