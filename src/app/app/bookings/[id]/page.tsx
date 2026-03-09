"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LogIn,
  LogOut,
  XCircle,
  FileText,
  Phone,
  User,
  Calendar,
  BedDouble,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import type { InvoiceData } from "@/components/invoice/invoice-template";

interface BookingDetail {
  id: number;
  invoiceNumber: string;
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
  status: string;
  paymentStatus: string;
  createdAt: string;
  room: {
    roomNumber: string;
    roomType: { name: string; category: string };
  };
  payments: { id: number; amount: number; method: string; note: string | null; paidAt: string }[];
  creator: { displayName: string };
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${id}`);
      const json = await res.json();
      if (json.success) setBooking(json.data);
      else toast("ບໍ່ພົບການຈອງ", "error");
    } catch {
      toast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchBooking();
  }, [fetchBooking]);

  async function handleStatusChange(newStatus: string) {
    const labels: Record<string, string> = {
      checked_in: "ເຊັກອິນ",
      checked_out: "ເຊັກເອົາ",
      cancelled: "ຍົກເລີກ",
    };
    if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ${labels[newStatus]}?`)) return;

    const res = await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (json.success) {
      toast(`${labels[newStatus]}ສຳເລັດ`, "success");
      fetchBooking();
    } else {
      toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-12 text-center text-neutral-400">ບໍ່ພົບການຈອງ</div>
    );
  }

  function buildInvoiceData(b: BookingDetail): InvoiceData {
    return {
      invoiceNumber: b.invoiceNumber,
      type: "booking",
      date: b.createdAt,
      customerName: b.guestName,
      customerPhone: b.guestPhone,
      items: [{
        name: `${b.room.roomType.name} - ຫ້ອງ ${b.room.roomNumber}`,
        quantity: b.totalNights,
        unit: "ຄືນ",
        unitPrice: Number(b.nightPrice),
        totalPrice: Number(b.subtotal),
      }],
      subtotal: Number(b.subtotal),
      discountAmount: Number(b.discountAmount),
      totalAmount: Number(b.totalAmount),
      depositAmount: Number(b.depositAmount),
      remainingAmount: Number(b.remainingAmount),
      notes: b.guestNotes || undefined,
      roomInfo: `${b.room.roomType.name} - ${b.room.roomNumber}`,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      totalNights: b.totalNights,
      numGuests: b.numGuests,
      createdBy: b.creator.displayName,
    };
  }

  const statusColor: Record<string, string> = {
    confirmed: "bg-info-light text-info",
    checked_in: "bg-success-light text-success",
    checked_out: "bg-neutral-100 text-neutral-500",
    cancelled: "bg-danger-light text-danger",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/bookings" className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{booking.invoiceNumber}</h1>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[booking.status] || ""}`}>
                {BOOKING_STATUS_LABELS[booking.status] || booking.status}
              </span>
            </div>
            <p className="text-sm text-neutral-500">ສ້າງໂດຍ {booking.creator.displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceActions data={buildInvoiceData(booking)} />
          {booking.status === "confirmed" && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleStatusChange("checked_in")}>
                <LogIn className="h-4 w-4" />
                ເຊັກອິນ
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleStatusChange("cancelled")}>
                <XCircle className="h-4 w-4" />
                ຍົກເລີກ
              </Button>
            </>
          )}
          {booking.status === "checked_in" && (
            <Button size="sm" variant="secondary" onClick={() => handleStatusChange("checked_out")}>
              <LogOut className="h-4 w-4" />
              ເຊັກເອົາ
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guest info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <User className="h-4 w-4 text-primary" />
            ຂໍ້ມູນແຂກ
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">ຊື່</span>
              <span className="font-medium">{booking.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">ເບີໂທ</span>
              <span className="flex items-center gap-1 font-medium">
                <Phone className="h-3 w-3" />
                {booking.guestPhone}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">ຈຳນວນແຂກ</span>
              <span className="font-medium">{booking.numGuests} ຄົນ</span>
            </div>
            {booking.guestNotes && (
              <div className="pt-1">
                <span className="text-neutral-500">ໝາຍເຫດ: </span>
                <span>{booking.guestNotes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Room info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <BedDouble className="h-4 w-4 text-primary" />
            ຂໍ້ມູນຫ້ອງ
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">ປະເພດ</span>
              <span className="font-medium">{booking.room.roomType.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">ຫ້ອງ</span>
              <span className="font-medium">{booking.room.roomNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-neutral-500">
                <Calendar className="h-3 w-3" />
                ເຊັກອິນ
              </span>
              <span className="font-medium">{formatDate(booking.checkIn)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-neutral-500">
                <Calendar className="h-3 w-3" />
                ເຊັກເອົາ
              </span>
              <span className="font-medium">{formatDate(booking.checkOut)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">ຈຳນວນຄືນ</span>
              <span className="font-medium">{booking.totalNights} ຄືນ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial details */}
      <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <FileText className="h-4 w-4 text-primary" />
          ລາຍລະອຽດການເງິນ
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">{formatCurrency(booking.nightPrice)} x {booking.totalNights} ຄືນ</span>
            <span>{formatCurrency(booking.subtotal)}</span>
          </div>
          {Number(booking.discountAmount) > 0 && (
            <div className="flex justify-between text-danger">
              <span>ສ່ວນຫຼຸດ</span>
              <span>-{formatCurrency(booking.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold">
            <span>ຍອດລວມ</span>
            <span>{formatCurrency(booking.totalAmount)}</span>
          </div>
          <div className="flex justify-between text-primary">
            <span>ມັດຈຳ {booking.depositPercent ? `(${booking.depositPercent}%)` : ""}</span>
            <span>{formatCurrency(booking.depositAmount)}</span>
          </div>
          {booking.depositMethod && (
            <div className="flex justify-between text-xs text-neutral-400">
              <span>ວິທີຊຳລະ</span>
              <span>{PAYMENT_METHOD_LABELS[booking.depositMethod] || booking.depositMethod}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-danger">
            <span>ຍອດຄ້າງ</span>
            <span>{formatCurrency(booking.remainingAmount)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-neutral-500">ສະຖານະຊຳລະ</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              booking.paymentStatus === "paid" ? "bg-success-light text-success" :
              booking.paymentStatus === "partial" ? "bg-info-light text-info" :
              "bg-warning-light text-warning"
            }`}>
              {PAYMENT_STATUS_LABELS[booking.paymentStatus] || booking.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Payment history */}
      {booking.payments.length > 0 && (
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold">ປະຫວັດການຊຳລະ</h3>
          <div className="space-y-2">
            {booking.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md bg-neutral-50 px-3 py-2 text-sm">
                <div>
                  <span className="font-medium">{formatCurrency(p.amount)}</span>
                  <span className="ml-2 text-neutral-400">
                    {PAYMENT_METHOD_LABELS[p.method] || p.method}
                  </span>
                  {p.note && <span className="ml-2 text-neutral-400">({p.note})</span>}
                </div>
                <span className="text-xs text-neutral-400">{formatDate(p.paidAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
