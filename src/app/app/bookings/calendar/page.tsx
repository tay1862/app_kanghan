"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS_LABELS } from "@/lib/constants";

interface CalendarBooking {
  id: number;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  roomId: number;
  roomNumber: string;
  roomTypeName: string;
}

const DAY_NAMES = ["ອາ", "ຈ", "ອ", "ພ", "ພຫ", "ສ", "ສ"];
const MONTH_NAMES = [
  "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
  "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ",
];

export default function BookingCalendarPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<CalendarBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      const params = new URLSearchParams({
        from: startDate.toISOString().split("T")[0],
        to: endDate.toISOString().split("T")[0],
      });
      const res = await fetch(`/api/bookings/calendar?${params}`);
      const json = await res.json();
      if (json.success) setBookings(json.data);
    } catch {
      toast("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້", "error");
    } finally {
      setLoading(false);
    }
  }, [year, month, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  function prevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  function getBookingsForDay(day: number): CalendarBooking[] {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];
    return bookings.filter((b) => {
      const checkIn = b.checkIn.split("T")[0];
      const checkOut = b.checkOut.split("T")[0];
      return dateStr >= checkIn && dateStr < checkOut;
    });
  }

  const statusColors: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-700 border-blue-200",
    checked_in: "bg-green-100 text-green-700 border-green-200",
    checked_out: "bg-neutral-100 text-neutral-500 border-neutral-200",
    cancelled: "bg-red-50 text-red-400 border-red-100 line-through",
  };

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ປະຕິທິນການຈອງ</h1>
          <p className="text-sm text-neutral-500">ເບິ່ງການຈອງແບບປະຕິທິນ</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/bookings">
            <Button variant="outline" size="sm">
              <CalendarCheck className="h-4 w-4" />
              ລາຍການ
            </Button>
          </Link>
          <Link href="/app/bookings/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              ຈອງໃໝ່
            </Button>
          </Link>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <button onClick={prevMonth} className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold">
            {MONTH_NAMES[month]} {year}
          </h2>
          <Button size="sm" variant="ghost" onClick={goToday}>
            ມື້ນີ້
          </Button>
        </div>
        <button onClick={nextMonth} className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-neutral-100 bg-neutral-50">
          {DAY_NAMES.map((day, i) => (
            <div
              key={i}
              className={cn(
                "px-2 py-2.5 text-center text-xs font-semibold uppercase",
                i === 0 ? "text-danger" : "text-neutral-500"
              )}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              if (day === null) {
                return <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-neutral-100 bg-neutral-50/50" />;
              }

              const dayBookings = getBookingsForDay(day);

              return (
                <div
                  key={day}
                  className={cn(
                    "min-h-[100px] border-b border-r border-neutral-100 p-1",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  <div className={cn(
                    "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    isToday(day) ? "bg-primary text-white" : "text-neutral-600"
                  )}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <Link
                        key={b.id}
                        href={`/app/bookings/${b.id}`}
                        className={cn(
                          "block truncate rounded border px-1 py-0.5 text-[10px] font-medium leading-tight transition-opacity hover:opacity-80",
                          statusColors[b.status] || "bg-neutral-100 text-neutral-500"
                        )}
                        title={`${b.roomNumber} - ${b.guestName} (${BOOKING_STATUS_LABELS[b.status]})`}
                      >
                        {b.roomNumber} {b.guestName}
                      </Link>
                    ))}
                    {dayBookings.length > 3 && (
                      <p className="text-center text-[9px] text-neutral-400">
                        +{dayBookings.length - 3} ເພີ່ມ
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        {Object.entries(BOOKING_STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn("h-3 w-3 rounded border", statusColors[key])} />
            <span className="text-neutral-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
