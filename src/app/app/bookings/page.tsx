"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Plus,
  Search,
  Eye,
  LogIn,
  LogOut,
  XCircle,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BOOKING_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

interface Booking {
  id: number;
  invoiceNumber: string;
  guestName: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  totalNights: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  room: {
    roomNumber: string;
    roomType: { name: string };
  };
}

export default function BookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/bookings?${params}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
        setTotal(json.total);
      }
    } catch {
      toast("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleStatusChange(bookingId: number, newStatus: string) {
    const labels: Record<string, string> = {
      checked_in: "ເຊັກອິນ",
      checked_out: "ເຊັກເອົາ",
      cancelled: "ຍົກເລີກ",
    };
    if (!confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການ${labels[newStatus] || newStatus}?`)) return;

    const res = await fetch(`/api/bookings/${bookingId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const json = await res.json();
    if (json.success) {
      toast(`${labels[newStatus]}ສຳເລັດ`, "success");
      fetchBookings();
    } else {
      toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  }

  const statusColor: Record<string, string> = {
    confirmed: "bg-info-light text-info",
    checked_in: "bg-success-light text-success",
    checked_out: "bg-neutral-100 text-neutral-500",
    cancelled: "bg-danger-light text-danger",
  };

  const paymentColor: Record<string, string> = {
    pending: "bg-warning-light text-warning",
    partial: "bg-info-light text-info",
    paid: "bg-success-light text-success",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ຈອງຫ້ອງ</h1>
          <p className="text-sm text-neutral-500">ຈັດການການຈອງຫ້ອງພັກ</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/app/bookings/calendar">
            <Button variant="outline">
              <CalendarCheck className="h-4 w-4" />
              ປະຕິທິນ
            </Button>
          </Link>
          <Link href="/app/bookings/new">
            <Button>
              <Plus className="h-4 w-4" />
              ຈອງໃໝ່
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="ຄົ້ນຫາ ຊື່ແຂກ, ເບີໂທ, ເລກບິນ..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-neutral-400" />
          <Select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            options={[
              { value: "all", label: "ທັງໝົດ" },
              { value: "confirmed", label: "ຢືນຢັນແລ້ວ" },
              { value: "checked_in", label: "ເຊັກອິນແລ້ວ" },
              { value: "checked_out", label: "ເຊັກເອົາແລ້ວ" },
              { value: "cancelled", label: "ຍົກເລີກ" },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
                <th className="px-4 py-3">ເລກບິນ</th>
                <th className="px-4 py-3">ແຂກ</th>
                <th className="px-4 py-3">ຫ້ອງ</th>
                <th className="px-4 py-3">ເຊັກອິນ</th>
                <th className="px-4 py-3">ເຊັກເອົາ</th>
                <th className="px-4 py-3">ຍອດ</th>
                <th className="px-4 py-3">ຊຳລະ</th>
                <th className="px-4 py-3">ສະຖານະ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-neutral-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ກຳລັງໂຫຼດ...
                    </div>
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <CalendarCheck className="mx-auto mb-2 h-10 w-10 text-neutral-300" />
                    <p className="text-neutral-400">ບໍ່ພົບການຈອງ</p>
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs">{b.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{b.guestName}</p>
                        <p className="text-xs text-neutral-400">{b.guestPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {b.room.roomType.name} - {b.room.roomNumber}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDate(b.checkIn)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDate(b.checkOut)}</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(b.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${paymentColor[b.paymentStatus] || ""}`}>
                        {PAYMENT_STATUS_LABELS[b.paymentStatus] || b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[b.status] || ""}`}>
                        {BOOKING_STATUS_LABELS[b.status] || b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/app/bookings/${b.id}`}
                          className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                          title="ເບິ່ງລາຍລະອຽດ"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {b.status === "confirmed" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(b.id, "checked_in")}
                              className="rounded-md p-1.5 text-neutral-400 hover:bg-success-light hover:text-success"
                              title="ເຊັກອິນ"
                            >
                              <LogIn className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(b.id, "cancelled")}
                              className="rounded-md p-1.5 text-neutral-400 hover:bg-danger-light hover:text-danger"
                              title="ຍົກເລີກ"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {b.status === "checked_in" && (
                          <button
                            onClick={() => handleStatusChange(b.id, "checked_out")}
                            className="rounded-md p-1.5 text-neutral-400 hover:bg-warning-light hover:text-warning"
                            title="ເຊັກເອົາ"
                          >
                            <LogOut className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
            <p className="text-xs text-neutral-500">
              ທັງໝົດ {total} ລາຍການ
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ກ່ອນ
              </Button>
              <span className="text-sm text-neutral-500">ໜ້າ {page}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={page * 20 >= total}
                onClick={() => setPage(page + 1)}
              >
                ຕໍ່ໄປ
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
