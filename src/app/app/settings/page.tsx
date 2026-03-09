"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings");
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch {
      toast("ບໍ່ສາມາດໂຫຼດການຕັ້ງຄ່າ", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function updateSetting(key: string, value: string) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        toast("ບັນທຶກສຳເລັດ", "success");
      } else {
        toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
      }
    } catch {
      toast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ຕັ້ງຄ່າ</h1>
          <p className="text-sm text-neutral-500">ການຕັ້ງຄ່າທົ່ວໄປຂອງລະບົບ</p>
        </div>
        <Button onClick={handleSave} loading={saving}>
          <Save className="h-4 w-4" />
          ບັນທຶກ
        </Button>
      </div>

      {/* Business Info */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 font-semibold">
          <Settings className="h-4 w-4 text-primary" />
          ຂໍ້ມູນທຸລະກິດ
        </h3>
        <div className="space-y-4">
          <Input
            label="ຊື່ທຸລະກິດ"
            value={settings.business_name || ""}
            onChange={(e) => updateSetting("business_name", e.target.value)}
          />
          <Input
            label="ຊື່ທຸລະກິດ (ພາສາລາວ)"
            value={settings.business_name_lao || ""}
            onChange={(e) => updateSetting("business_name_lao", e.target.value)}
          />
          <Textarea
            label="ທີ່ຢູ່"
            value={settings.business_address || ""}
            onChange={(e) => updateSetting("business_address", e.target.value)}
          />
          <Input
            label="ເບີໂທ"
            value={settings.business_phone || ""}
            onChange={(e) => updateSetting("business_phone", e.target.value)}
          />
        </div>
      </div>

      {/* Booking Settings */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">ການຕັ້ງຄ່າການຈອງ</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="ເວລາເຊັກອິນ"
            type="time"
            value={settings.check_in_time || "14:00"}
            onChange={(e) => updateSetting("check_in_time", e.target.value)}
          />
          <Input
            label="ເວລາເຊັກເອົາ"
            type="time"
            value={settings.check_out_time || "11:00"}
            onChange={(e) => updateSetting("check_out_time", e.target.value)}
          />
          <Input
            label="ມັດຈຳເລີ່ມຕົ້ນ (%)"
            type="number"
            value={settings.default_deposit_percent || "30"}
            onChange={(e) => updateSetting("default_deposit_percent", e.target.value)}
            min={0}
            max={100}
          />
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold">ການຕັ້ງຄ່າບິນ</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="ນຳໜ້າບິນຈອງຫ້ອງ"
            value={settings.invoice_prefix_booking || "BK"}
            onChange={(e) => updateSetting("invoice_prefix_booking", e.target.value)}
            hint="ເຊັ່ນ: BK-2025-0001"
          />
          <Input
            label="ນຳໜ້າບິນອາຫານ"
            value={settings.invoice_prefix_food || "FB"}
            onChange={(e) => updateSetting("invoice_prefix_food", e.target.value)}
            hint="ເຊັ່ນ: FB-2025-0001"
          />
          <Input
            label="ສະກຸນເງິນ"
            value={settings.currency || "LAK"}
            onChange={(e) => updateSetting("currency", e.target.value)}
          />
          <Input
            label="ສັນຍາລັກສະກຸນເງິນ"
            value={settings.currency_symbol || "₭"}
            onChange={(e) => updateSetting("currency_symbol", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">
          <Save className="h-4 w-4" />
          ບັນທຶກການຕັ້ງຄ່າ
        </Button>
      </div>
    </div>
  );
}
