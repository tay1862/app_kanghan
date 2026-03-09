"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Eye,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FOOD_ORDER_STATUS_LABELS, FOOD_ORDER_TYPE_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";

interface FoodOrder {
  id: number;
  invoiceNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  orderType: string;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  status: string;
  createdAt: string;
  items: { id: number; name: string }[];
}

export default function FoodOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<FoodOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));

      const res = await fetch(`/api/food-orders?${params}`);
      const json = await res.json();
      if (json.success) {
        setOrders(json.data);
        setTotal(json.total);
      }
    } catch {
      toast("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້", "error");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const statusColor: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    confirmed: "bg-info-light text-info",
    completed: "bg-success-light text-success",
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
          <h1 className="text-2xl font-bold">ບິນອາຫານ</h1>
          <p className="text-sm text-neutral-500">ຈັດການອໍເດີອາຫານ ແລະ ໂຕະຈີນ</p>
        </div>
        <Link href="/app/food-orders/new">
          <Button>
            <Plus className="h-4 w-4" />
            ອອກບິນໃໝ່
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="ຄົ້ນຫາ ຊື່ລູກຄ້າ, ເບີໂທ, ເລກບິນ..."
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
              { value: "draft", label: "ແບບຮ່າງ" },
              { value: "confirmed", label: "ຢືນຢັນແລ້ວ" },
              { value: "completed", label: "ສຳເລັດ" },
              { value: "cancelled", label: "ຍົກເລີກ" },
            ]}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
                <th className="px-4 py-3">ເລກບິນ</th>
                <th className="px-4 py-3">ລູກຄ້າ</th>
                <th className="px-4 py-3">ປະເພດ</th>
                <th className="px-4 py-3">ລາຍການ</th>
                <th className="px-4 py-3">ຍອດ</th>
                <th className="px-4 py-3">ຊຳລະ</th>
                <th className="px-4 py-3">ສະຖານະ</th>
                <th className="px-4 py-3">ວັນທີ</th>
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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center">
                    <UtensilsCrossed className="mx-auto mb-2 h-10 w-10 text-neutral-300" />
                    <p className="text-neutral-400">ບໍ່ພົບບິນອາຫານ</p>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-b border-neutral-50 hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-xs">{o.invoiceNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{o.customerName || "-"}</p>
                      {o.customerPhone && <p className="text-xs text-neutral-400">{o.customerPhone}</p>}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {FOOD_ORDER_TYPE_LABELS[o.orderType] || o.orderType}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{o.items.length} ລາຍການ</td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(o.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${paymentColor[o.paymentStatus] || ""}`}>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus] || o.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[o.status] || ""}`}>
                        {FOOD_ORDER_STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-neutral-400">{formatDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/app/food-orders/${o.id}`}
                        className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3">
            <p className="text-xs text-neutral-500">ທັງໝົດ {total} ລາຍການ</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>ກ່ອນ</Button>
              <span className="text-sm text-neutral-500">ໜ້າ {page}</span>
              <Button size="sm" variant="outline" disabled={page * 20 >= total} onClick={() => setPage(page + 1)}>ຕໍ່ໄປ</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
