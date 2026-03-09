"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UtensilsCrossed,
  Phone,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  FOOD_ORDER_STATUS_LABELS,
  FOOD_ORDER_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/constants";
import { InvoiceActions } from "@/components/invoice/invoice-actions";
import type { InvoiceData } from "@/components/invoice/invoice-template";

interface FoodOrderDetail {
  id: number;
  invoiceNumber: string;
  customerName: string | null;
  customerPhone: string | null;
  orderType: string;
  eventDate: string | null;
  numTables: number | null;
  numGuests: number | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  paymentStatus: string;
  status: string;
  notes: string | null;
  createdAt: string;
  items: {
    id: number;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    notes: string | null;
    sortOrder: number;
  }[];
  creator: { displayName: string };
}

export default function FoodOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { toast } = useToast();
  const [order, setOrder] = useState<FoodOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/food-orders/${id}`);
      const json = await res.json();
      if (json.success) setOrder(json.data);
      else toast("ບໍ່ພົບອໍເດີ", "error");
    } catch {
      toast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  async function handleStatusChange(newStatus: string) {
    const res = await fetch(`/api/food-orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...order, status: newStatus }),
    });
    const json = await res.json();
    if (json.success) {
      toast("ອັບເດດສຳເລັດ", "success");
      fetchOrder();
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

  if (!order) {
    return <div className="py-12 text-center text-neutral-400">ບໍ່ພົບອໍເດີ</div>;
  }

  function buildInvoiceData(o: FoodOrderDetail): InvoiceData {
    return {
      invoiceNumber: o.invoiceNumber,
      type: "food",
      date: o.createdAt,
      customerName: o.customerName || "-",
      customerPhone: o.customerPhone || undefined,
      items: o.items.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
      subtotal: Number(o.subtotal),
      discountAmount: Number(o.discountAmount),
      totalAmount: Number(o.totalAmount),
      depositAmount: Number(o.depositAmount),
      remainingAmount: Number(o.remainingAmount),
      notes: o.notes || undefined,
      orderType: FOOD_ORDER_TYPE_LABELS[o.orderType] || o.orderType,
      eventDate: o.eventDate || undefined,
      numTables: o.numTables || undefined,
      createdBy: o.creator.displayName,
    };
  }

  const statusColor: Record<string, string> = {
    draft: "bg-neutral-100 text-neutral-500",
    confirmed: "bg-info-light text-info",
    completed: "bg-success-light text-success",
    cancelled: "bg-danger-light text-danger",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/app/food-orders" className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{order.invoiceNumber}</h1>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[order.status] || ""}`}>
                {FOOD_ORDER_STATUS_LABELS[order.status] || order.status}
              </span>
            </div>
            <p className="text-sm text-neutral-500">ສ້າງໂດຍ {order.creator.displayName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <InvoiceActions data={buildInvoiceData(order)} />
          {order.status === "draft" && (
            <Button size="sm" onClick={() => handleStatusChange("confirmed")}>ຢືນຢັນ</Button>
          )}
          {order.status === "confirmed" && (
            <Button size="sm" variant="secondary" onClick={() => handleStatusChange("completed")}>ສຳເລັດ</Button>
          )}
          {(order.status === "draft" || order.status === "confirmed") && (
            <Button size="sm" variant="danger" onClick={() => handleStatusChange("cancelled")}>ຍົກເລີກ</Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <User className="h-4 w-4 text-primary" />
            ຂໍ້ມູນລູກຄ້າ
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">ຊື່</span>
              <span className="font-medium">{order.customerName || "-"}</span>
            </div>
            {order.customerPhone && (
              <div className="flex justify-between">
                <span className="text-neutral-500">ເບີໂທ</span>
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="h-3 w-3" /> {order.customerPhone}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-neutral-500">ປະເພດ</span>
              <span className="font-medium">{FOOD_ORDER_TYPE_LABELS[order.orderType] || order.orderType}</span>
            </div>
            {order.eventDate && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-neutral-500"><Calendar className="h-3 w-3" /> ວັນງານ</span>
                <span className="font-medium">{formatDate(order.eventDate)}</span>
              </div>
            )}
            {order.numTables && (
              <div className="flex justify-between">
                <span className="text-neutral-500">ຈຳນວນໂຕະ</span>
                <span className="font-medium">{order.numTables}</span>
              </div>
            )}
            {order.numGuests && (
              <div className="flex justify-between">
                <span className="text-neutral-500">ຈຳນວນຄົນ</span>
                <span className="font-medium">{order.numGuests}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            ການເງິນ
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">ຍອດລວມລາຍການ</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-danger">
                <span>ສ່ວນຫຼຸດ</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-base font-bold">
              <span>ຍອດລວມ</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
            {Number(order.depositAmount) > 0 && (
              <div className="flex justify-between text-primary">
                <span>ມັດຈຳ</span>
                <span>{formatCurrency(order.depositAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-danger">
              <span>ຍອດຄ້າງ</span>
              <span>{formatCurrency(order.remainingAmount)}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-neutral-500">ສະຖານະຊຳລະ</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                order.paymentStatus === "paid" ? "bg-success-light text-success" :
                order.paymentStatus === "partial" ? "bg-info-light text-info" :
                "bg-warning-light text-warning"
              }`}>
                {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-6 py-4">
          <h3 className="flex items-center gap-2 font-semibold">
            <UtensilsCrossed className="h-4 w-4 text-primary" />
            ລາຍການ ({order.items.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 text-left text-xs font-medium uppercase text-neutral-500">
                <th className="px-6 py-3">#</th>
                <th className="px-6 py-3">ລາຍການ</th>
                <th className="px-6 py-3 text-right">ຈຳນວນ</th>
                <th className="px-6 py-3 text-right">ລາຄາ</th>
                <th className="px-6 py-3 text-right">ລວມ</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={item.id} className="border-b border-neutral-50">
                  <td className="px-6 py-3 text-neutral-400">{idx + 1}</td>
                  <td className="px-6 py-3 font-medium">
                    {item.name}
                    {item.notes && <span className="ml-2 text-xs text-neutral-400">({item.notes})</span>}
                  </td>
                  <td className="px-6 py-3 text-right">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-3 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {order.notes && (
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 font-semibold">ໝາຍເຫດ</h3>
          <p className="text-sm text-neutral-500">{order.notes}</p>
        </div>
      )}
    </div>
  );
}
