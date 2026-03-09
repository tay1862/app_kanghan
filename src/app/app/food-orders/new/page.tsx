"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UtensilsCrossed,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { UNIT_OPTIONS } from "@/lib/constants";

interface OrderItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  notes: string;
}

export default function NewFoodOrderPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderType, setOrderType] = useState("ala_carte");
  const [eventDate, setEventDate] = useState("");
  const [numTables, setNumTables] = useState("");
  const [numGuests, setNumGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [depositAmount, setDepositAmount] = useState("0");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [items, setItems] = useState<OrderItem[]>([
    { name: "", quantity: 1, unit: "ອັນ", unitPrice: 0, notes: "" },
  ]);

  function addItem() {
    setItems([...items, { name: "", quantity: 1, unit: "ອັນ", unitPrice: 0, notes: "" }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  }

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const discount = parseFloat(discountAmount) || 0;
  const totalAmount = subtotal - discount;
  const deposit = parseFloat(depositAmount) || 0;
  const remaining = totalAmount - deposit;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items.filter((item) => item.name.trim());
    if (validItems.length === 0) {
      toast("ກະລຸນາເພີ່ມລາຍການອາຫານ", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/food-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
          orderType,
          eventDate: eventDate || undefined,
          numTables: numTables ? parseInt(numTables) : undefined,
          numGuests: numGuests ? parseInt(numGuests) : undefined,
          notes: notes || undefined,
          depositAmount: deposit,
          discountAmount: discount,
          items: validItems,
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast("ສ້າງບິນສຳເລັດ", "success");
        router.push(`/app/food-orders/${json.data.id}`);
      } else {
        toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
      }
    } catch {
      toast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/food-orders" className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">ອອກບິນອາຫານໃໝ່</h1>
          <p className="text-sm text-neutral-500">ສ້າງບິນອາຫານ ຫຼື ໂຕະຈີນ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">ຂໍ້ມູນລູກຄ້າ</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="ຊື່ລູກຄ້າ" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="ຊື່ (ຖ້າມີ)" />
            <Input label="ເບີໂທ" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="ເບີໂທ (ຖ້າມີ)" />
            <Select
              label="ປະເພດອໍເດີ"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              options={[
                { value: "ala_carte", label: "ສັ່ງເມນູ" },
                { value: "banquet", label: "ໂຕະຈີນ" },
                { value: "mixed", label: "ປະສົມ" },
              ]}
            />
            <Input label="ວັນງານ" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            {(orderType === "banquet" || orderType === "mixed") && (
              <>
                <Input label="ຈຳນວນໂຕະ" type="number" value={numTables} onChange={(e) => setNumTables(e.target.value)} />
                <Input label="ຈຳນວນຄົນ" type="number" value={numGuests} onChange={(e) => setNumGuests(e.target.value)} />
              </>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              ລາຍການ ({items.length})
            </h3>
            <Button type="button" size="sm" variant="outline" onClick={addItem}>
              <Plus className="h-3 w-3" />
              ເພີ່ມລາຍການ
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 rounded-md border border-neutral-100 bg-neutral-50 p-3">
                <div className="col-span-12 sm:col-span-4">
                  <input
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="ຊື່ລາຍການ"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <input
                    type="number"
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="ຈຳນວນ"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                    min={0}
                    step="0.5"
                  />
                </div>
                <div className="col-span-4 sm:col-span-2">
                  <select
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white px-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={item.unit}
                    onChange={(e) => updateItem(index, "unit", e.target.value)}
                  >
                    {UNIT_OPTIONS.map((u) => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3 sm:col-span-3">
                  <input
                    type="number"
                    className="h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="ລາຄາ"
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded p-1 text-neutral-400 hover:text-danger"
                    disabled={items.length <= 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="col-span-12 text-right text-xs text-neutral-500">
                  = {formatCurrency(item.quantity * item.unitPrice)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">ການຊຳລະ</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="ສ່ວນຫຼຸດ (₭)" type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
            <Input label="ມັດຈຳ (₭)" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          </div>
          <Textarea label="ໝາຍເຫດ" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ໝາຍເຫດເພີ່ມ..." className="mt-4" />

          <div className="mt-4 rounded-md bg-neutral-50 p-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">ຍອດລວມລາຍການ</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-danger">
                  <span>ສ່ວນຫຼຸດ</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-neutral-200 pt-1 font-semibold">
                <span>ຍອດລວມ</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
              {deposit > 0 && (
                <div className="flex justify-between text-primary">
                  <span>ມັດຈຳ</span>
                  <span>{formatCurrency(deposit)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-danger">
                <span>ຍອດຄ້າງ</span>
                <span>{formatCurrency(remaining)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/app/food-orders">
            <Button type="button" variant="ghost">ຍົກເລີກ</Button>
          </Link>
          <Button type="submit" loading={loading} size="lg">
            <UtensilsCrossed className="h-4 w-4" />
            ບັນທຶກບິນ
          </Button>
        </div>
      </form>
    </div>
  );
}
