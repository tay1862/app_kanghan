"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BedDouble,
  Plus,
  Edit2,
  Trash2,
  Home,
  Tent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import { ROOM_STATUS_LABELS, ROOM_CATEGORY_LABELS } from "@/lib/constants";

interface RoomType {
  id: number;
  name: string;
  description: string | null;
  basePrice: number;
  maxGuests: number;
  category: string;
  sortOrder: number;
  isActive: boolean;
  rooms: Room[];
}

interface Room {
  id: number;
  roomNumber: string;
  floor: string | null;
  status: string;
  isActive: boolean;
  notes: string | null;
}

export default function RoomsPage() {
  const { toast } = useToast();
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingType, setEditingType] = useState<RoomType | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const [typeName, setTypeName] = useState("");
  const [typeDesc, setTypeDesc] = useState("");
  const [typePrice, setTypePrice] = useState("");
  const [typeMaxGuests, setTypeMaxGuests] = useState("2");
  const [typeCategory, setTypeCategory] = useState("room");

  const [roomNumber, setRoomNumber] = useState("");
  const [roomFloor, setRoomFloor] = useState("");
  const [roomTypeId, setRoomTypeId] = useState("");
  const [roomStatus, setRoomStatus] = useState("available");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/room-types");
      const json = await res.json();
      if (json.success) setRoomTypes(json.data);
    } catch {
      toast("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function openTypeModal(type?: RoomType) {
    if (type) {
      setEditingType(type);
      setTypeName(type.name);
      setTypeDesc(type.description || "");
      setTypePrice(String(type.basePrice));
      setTypeMaxGuests(String(type.maxGuests));
      setTypeCategory(type.category);
    } else {
      setEditingType(null);
      setTypeName("");
      setTypeDesc("");
      setTypePrice("");
      setTypeMaxGuests("2");
      setTypeCategory("room");
    }
    setShowTypeModal(true);
  }

  function openRoomModal(room?: Room, typeId?: number) {
    if (room) {
      setEditingRoom(room);
      setRoomNumber(room.roomNumber);
      setRoomFloor(room.floor || "");
      setRoomStatus(room.status);
      setRoomTypeId(String(typeId || ""));
    } else {
      setEditingRoom(null);
      setRoomNumber("");
      setRoomFloor("");
      setRoomStatus("available");
      setRoomTypeId(typeId ? String(typeId) : "");
    }
    setShowRoomModal(true);
  }

  async function handleSaveType() {
    const data = {
      name: typeName,
      description: typeDesc || undefined,
      basePrice: parseFloat(typePrice),
      maxGuests: parseInt(typeMaxGuests),
      category: typeCategory,
      sortOrder: editingType?.sortOrder || roomTypes.length,
    };

    const url = editingType ? `/api/room-types/${editingType.id}` : "/api/room-types";
    const method = editingType ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (json.success) {
      toast(editingType ? "ແກ້ໄຂສຳເລັດ" : "ເພີ່ມສຳເລັດ", "success");
      setShowTypeModal(false);
      fetchData();
    } else {
      toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  }

  async function handleDeleteType(id: number) {
    if (!confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບ?")) return;
    const res = await fetch(`/api/room-types/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast("ລົບສຳເລັດ", "success");
      fetchData();
    } else {
      toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  }

  async function handleSaveRoom() {
    const data = {
      roomTypeId: parseInt(roomTypeId),
      roomNumber,
      floor: roomFloor || undefined,
      status: roomStatus,
    };

    const url = editingRoom ? `/api/rooms/${editingRoom.id}` : "/api/rooms";
    const method = editingRoom ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (json.success) {
      toast(editingRoom ? "ແກ້ໄຂສຳເລັດ" : "ເພີ່ມສຳເລັດ", "success");
      setShowRoomModal(false);
      fetchData();
    } else {
      toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  }

  async function handleDeleteRoom(id: number) {
    if (!confirm("ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລົບ?")) return;
    const res = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      toast("ລົບສຳເລັດ", "success");
      fetchData();
    } else {
      toast(json.error || "ເກີດຂໍ້ຜິດພາດ", "error");
    }
  }

  const categoryIcon = (cat: string) => {
    if (cat.includes("camping")) return <Tent className="h-5 w-5" />;
    return <Home className="h-5 w-5" />;
  };

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
          <h1 className="text-2xl font-bold">ຫ້ອງພັກ</h1>
          <p className="text-sm text-neutral-500">ຈັດການປະເພດຫ້ອງ ແລະ ຫ້ອງພັກ</p>
        </div>
        <Button onClick={() => openTypeModal()}>
          <Plus className="h-4 w-4" />
          ເພີ່ມປະເພດ
        </Button>
      </div>

      {roomTypes.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-white">
          <BedDouble className="mb-3 h-12 w-12 text-neutral-300" />
          <p className="text-neutral-500">ຍັງບໍ່ມີປະເພດຫ້ອງ</p>
          <Button variant="ghost" className="mt-2" onClick={() => openTypeModal()}>
            <Plus className="h-4 w-4" />
            ເພີ່ມປະເພດຫ້ອງທຳອິດ
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {roomTypes.map((type) => (
            <div
              key={type.id}
              className="rounded-lg border border-neutral-200 bg-white shadow-sm"
            >
              <div
                className="flex cursor-pointer items-center justify-between border-b border-neutral-100 px-6 py-4"
                onClick={() => setSelectedTypeId(selectedTypeId === type.id ? null : type.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary">
                    {categoryIcon(type.category)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{type.name}</h3>
                    <p className="text-xs text-neutral-500">
                      {ROOM_CATEGORY_LABELS[type.category] || type.category} &middot;{" "}
                      {formatCurrency(type.basePrice)}/ຄືນ &middot;{" "}
                      ສູງສຸດ {type.maxGuests} ຄົນ &middot;{" "}
                      {type.rooms.length} ຫ້ອງ
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openTypeModal(type); }}
                    className="rounded-md p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteType(type.id); }}
                    className="rounded-md p-2 text-neutral-400 hover:bg-danger-light hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {selectedTypeId === type.id && (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-500">
                      ລາຍການຫ້ອງ ({type.rooms.length})
                    </span>
                    <Button size="sm" variant="outline" onClick={() => openRoomModal(undefined, type.id)}>
                      <Plus className="h-3 w-3" />
                      ເພີ່ມຫ້ອງ
                    </Button>
                  </div>

                  {type.rooms.length === 0 ? (
                    <p className="py-4 text-center text-sm text-neutral-400">ຍັງບໍ່ມີຫ້ອງ</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {type.rooms.map((room) => (
                        <div
                          key={room.id}
                          className="group flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-medium">{room.roomNumber}</p>
                            <span
                              className={`text-xs ${
                                room.status === "available"
                                  ? "text-success"
                                  : room.status === "occupied"
                                  ? "text-danger"
                                  : "text-warning"
                              }`}
                            >
                              {ROOM_STATUS_LABELS[room.status] || room.status}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => openRoomModal(room, type.id)}
                              className="rounded p-1 text-neutral-400 hover:text-neutral-600"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
                              className="rounded p-1 text-neutral-400 hover:text-danger"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Room Type Modal */}
      <Modal
        open={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title={editingType ? "ແກ້ໄຂປະເພດຫ້ອງ" : "ເພີ່ມປະເພດຫ້ອງ"}
      >
        <div className="flex flex-col gap-4">
          <Input label="ຊື່ປະເພດ" value={typeName} onChange={(e) => setTypeName(e.target.value)} placeholder="ເຊັ່ນ: ເຮືອນກັງຫັນ" />
          <Input label="ລາຍລະອຽດ" value={typeDesc} onChange={(e) => setTypeDesc(e.target.value)} placeholder="ລາຍລະອຽດເພີ່ມ" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="ລາຄາ/ຄືນ (₭)" type="number" value={typePrice} onChange={(e) => setTypePrice(e.target.value)} />
            <Input label="ຈຳນວນຄົນສູງສຸດ" type="number" value={typeMaxGuests} onChange={(e) => setTypeMaxGuests(e.target.value)} />
          </div>
          <Select
            label="ປະເພດ"
            value={typeCategory}
            onChange={(e) => setTypeCategory(e.target.value)}
            options={[
              { value: "room", label: "ຫ້ອງພັກ" },
              { value: "camping_own_tent", label: "ກາງເຕັນ (ເອົາເຕັນມາເອງ)" },
              { value: "camping_resort_tent", label: "ກາງເຕັນ (ເຕັນຂອງຣີສອດ)" },
            ]}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowTypeModal(false)}>ຍົກເລີກ</Button>
            <Button onClick={handleSaveType}>ບັນທຶກ</Button>
          </div>
        </div>
      </Modal>

      {/* Room Modal */}
      <Modal
        open={showRoomModal}
        onClose={() => setShowRoomModal(false)}
        title={editingRoom ? "ແກ້ໄຂຫ້ອງ" : "ເພີ່ມຫ້ອງ"}
      >
        <div className="flex flex-col gap-4">
          <Select
            label="ປະເພດຫ້ອງ"
            value={roomTypeId}
            onChange={(e) => setRoomTypeId(e.target.value)}
            options={roomTypes.map((t) => ({ value: String(t.id), label: t.name }))}
            placeholder="ເລືອກປະເພດ"
          />
          <Input label="ເລກຫ້ອງ" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="ເຊັ່ນ: KH-01" />
          <Input label="ຊັ້ນ" value={roomFloor} onChange={(e) => setRoomFloor(e.target.value)} placeholder="ເຊັ່ນ: 1" />
          {editingRoom && (
            <Select
              label="ສະຖານະ"
              value={roomStatus}
              onChange={(e) => setRoomStatus(e.target.value)}
              options={[
                { value: "available", label: "ຫວ່າງ" },
                { value: "occupied", label: "ມີຄົນພັກ" },
                { value: "maintenance", label: "ສ້ອມແປງ" },
              ]}
            />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowRoomModal(false)}>ຍົກເລີກ</Button>
            <Button onClick={handleSaveRoom}>ບັນທຶກ</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
