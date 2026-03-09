"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

interface RoomType {
  id: number;
  name: string;
  basePrice: number;
  maxGuests: number;
  category: string;
  rooms: { id: number; roomNumber: string; status: string }[];
}

export default function NewBookingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestNotes, setGuestNotes] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [numGuests, setNumGuests] = useState("1");
  const [nightPrice, setNightPrice] = useState("");
  const [depositPercent, setDepositPercent] = useState("30");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("cash");
  const [discountAmount, setDiscountAmount] = useState("0");

  const fetchRoomTypes = useCallback(async () => {
    const res = await fetch("/api/room-types");
    const json = await res.json();
    if (json.success) setRoomTypes(json.data);
  }, []);

  useEffect(() => {
    fetchRoomTypes();
  }, [fetchRoomTypes]);

  const selectedType = roomTypes.find((t) => t.id === parseInt(selectedTypeId));
  const availableRooms = selectedType?.rooms.filter((r) => r.status === "available") || [];

  useEffect(() => {
    if (selectedType) {
      setNightPrice(String(selectedType.basePrice));
    }
  }, [selectedType]);

  const totalNights = checkIn && checkOut
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const subtotal = (parseFloat(nightPrice) || 0) * totalNights;
  const discount = parseFloat(discountAmount) || 0;
  const totalAmount = subtotal - discount;
  const deposit = parseFloat(depositAmount) || 0;
  const remaining = totalAmount - deposit;

  useEffect(() => {
    if (subtotal > 0 && depositPercent) {
      const pct = parseFloat(depositPercent) || 0;
      setDepositAmount(String(Math.round(subtotal * pct / 100)));
    }
  }, [subtotal, depositPercent]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedRoomId || !guestName || !guestPhone || !checkIn || !checkOut) {
      toast("ກະລຸນາກອກຂໍ້ມູນໃຫ້ຄົບ", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: parseInt(selectedRoomId),
          guestName,
          guestPhone,
          guestNotes: guestNotes || undefined,
          checkIn,
          checkOut,
          numGuests: parseInt(numGuests),
          nightPrice: parseFloat(nightPrice),
          depositPercent: parseFloat(depositPercent) || undefined,
          depositAmount: deposit,
          depositMethod: deposit > 0 ? depositMethod : undefined,
          discountAmount: discount,
        }),
      });
      const json = await res.json();

      if (json.success) {
        toast("ຈອງສຳເລັດ", "success");
        router.push(`/app/bookings/${json.data.id}`);
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/app/bookings" className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">ຈອງຫ້ອງໃໝ່</h1>
          <p className="text-sm text-neutral-500">ສ້າງການຈອງຫ້ອງພັກ</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room selection */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <CalendarCheck className="h-5 w-5 text-primary" />
            ຂໍ້ມູນຫ້ອງ
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="ປະເພດຫ້ອງ"
              value={selectedTypeId}
              onChange={(e) => { setSelectedTypeId(e.target.value); setSelectedRoomId(""); }}
              options={roomTypes.map((t) => ({ value: String(t.id), label: `${t.name} (${formatCurrency(t.basePrice)}/ຄືນ)` }))}
              placeholder="ເລືອກປະເພດ"
            />
            <Select
              label="ຫ້ອງ"
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              options={availableRooms.map((r) => ({ value: String(r.id), label: r.roomNumber }))}
              placeholder={availableRooms.length === 0 ? "ບໍ່ມີຫ້ອງຫວ່າງ" : "ເລືອກຫ້ອງ"}
              disabled={!selectedTypeId}
            />
            <Input label="ເຊັກອິນ" type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            <Input label="ເຊັກເອົາ" type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            <Input label="ຈຳນວນແຂກ" type="number" value={numGuests} onChange={(e) => setNumGuests(e.target.value)} min={1} />
            <Input label="ລາຄາ/ຄືນ (₭)" type="number" value={nightPrice} onChange={(e) => setNightPrice(e.target.value)} />
          </div>
        </div>

        {/* Guest info */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">ຂໍ້ມູນແຂກ</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="ຊື່ແຂກ" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="ຊື່ ແລະ ນາມສະກຸນ" />
            <Input label="ເບີໂທ" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="020XXXXXXXX" />
          </div>
          <div className="mt-4">
            <Textarea label="ໝາຍເຫດ" value={guestNotes} onChange={(e) => setGuestNotes(e.target.value)} placeholder="ໝາຍເຫດເພີ່ມ..." />
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold">ການຊຳລະ</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="ສ່ວນຫຼຸດ (₭)" type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
            <Input label="ມັດຈຳ %" type="number" value={depositPercent} onChange={(e) => setDepositPercent(e.target.value)} min={0} max={100} />
            <Input label="ຍອດມັດຈຳ (₭)" type="number" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
            <Select
              label="ວິທີຊຳລະ"
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value)}
              options={[
                { value: "cash", label: "ເງິນສົດ" },
                { value: "transfer", label: "ໂອນ" },
                { value: "other", label: "ອື່ນໆ" },
              ]}
            />
          </div>

          {/* Summary */}
          {totalNights > 0 && (
            <div className="mt-4 rounded-md bg-neutral-50 p-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{formatCurrency(parseFloat(nightPrice) || 0)} x {totalNights} ຄືນ</span>
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
                <div className="flex justify-between text-primary">
                  <span>ມັດຈຳ</span>
                  <span>{formatCurrency(deposit)}</span>
                </div>
                <div className="flex justify-between font-semibold text-danger">
                  <span>ຍອດຄ້າງ</span>
                  <span>{formatCurrency(remaining)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/app/bookings">
            <Button type="button" variant="ghost">ຍົກເລີກ</Button>
          </Link>
          <Button type="submit" loading={loading} size="lg">
            <CalendarCheck className="h-4 w-4" />
            ຢືນຢັນການຈອງ
          </Button>
        </div>
      </form>
    </div>
  );
}
