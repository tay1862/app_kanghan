"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Trash2,
  GripVertical,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface MenuPage {
  id: number;
  title: string | null;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function MenuAdminPage() {
  const { toast } = useToast();
  const [pages, setPages] = useState<MenuPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/menu-pages");
      const json = await res.json();
      if (json.success) setPages(json.data);
    } catch {
      toast("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  async function handleUpload() {
    if (!uploadFile) {
      toast("ກະລຸນາເລືອກຮູບ", "warning");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", uploadFile);
      formData.append("title", uploadTitle);
      formData.append("sortOrder", String(pages.length));

      const res = await fetch("/api/menu-pages", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (json.success) {
        toast("ອັບໂຫຼດສຳເລັດ", "success");
        setShowUploadModal(false);
        setUploadTitle("");
        setUploadFile(null);
        fetchPages();
      } else {
        toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
      }
    } catch {
      toast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບ?")) return;
    const res = await fetch(`/api/menu-pages/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast("ລົບສຳເລັດ", "success");
      fetchPages();
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ຈັດການເມນູ</h1>
          <p className="text-sm text-neutral-500">
            ອັບໂຫຼດຮູບເມນູສຳລັບ menu.kanghan.site
          </p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <Plus className="h-4 w-4" />
          ເພີ່ມໜ້າ
        </Button>
      </div>

      {pages.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white">
          <BookOpen className="mb-3 h-12 w-12 text-neutral-300" />
          <p className="text-neutral-500">ຍັງບໍ່ມີໜ້າເມນູ</p>
          <Button
            variant="ghost"
            className="mt-2"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4" />
            ອັບໂຫຼດໜ້າເມນູທຳອິດ
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {pages.map((page, idx) => (
            <div
              key={page.id}
              className="group relative overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[3/4]">
                <Image
                  src={page.imageUrl}
                  alt={page.title || `ໜ້າ ${idx + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
                <div className="absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs font-bold text-white">
                  {idx + 1}
                </div>
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded-md bg-white/90 p-1.5 text-neutral-500 hover:text-neutral-700">
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="rounded-md bg-white/90 p-1.5 text-neutral-500 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              {page.title && (
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{page.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="ເພີ່ມໜ້າເມນູ"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="ຊື່ໜ້າ (ບໍ່ບັງຄັບ)"
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            placeholder="ເຊັ່ນ: ອາຫານຫຼັກ"
          />
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">
              ຮູບເມນູ
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-neutral-500 file:mr-3 file:rounded-md file:border-0 file:bg-primary-light file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
            />
          </div>
          {uploadFile && (
            <div className="rounded-md bg-neutral-50 p-2">
              <p className="text-xs text-neutral-500">
                {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(1)} MB)
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
              ຍົກເລີກ
            </Button>
            <Button onClick={handleUpload} loading={uploading}>
              <Upload className="h-4 w-4" />
              ອັບໂຫຼດ
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
