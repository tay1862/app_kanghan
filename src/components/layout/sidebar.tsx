"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  UtensilsCrossed,
  Music,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  UtensilsCrossed,
  Music,
  BookOpen,
  Settings,
};

const navItems = [
  { href: "/app/dashboard", label: "ໜ້າຫຼັກ", icon: "LayoutDashboard" },
  { href: "/app/bookings", label: "ຈອງຫ້ອງ", icon: "CalendarCheck" },
  { href: "/app/rooms", label: "ຫ້ອງພັກ", icon: "BedDouble" },
  { href: "/app/food-orders", label: "ບິນອາຫານ", icon: "UtensilsCrossed" },
  { href: "/app/music", label: "ເພງ", icon: "Music" },
  { href: "/app/menu-admin", label: "ເມນູ", icon: "BookOpen" },
  { href: "/app/settings", label: "ຕັ້ງຄ່າ", icon: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-md p-2 text-neutral-500 hover:bg-neutral-100"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Logo" width={28} height={28} />
          <span className="text-sm font-semibold text-neutral-900">
            Kanghan
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 z-50 flex h-full flex-col border-r border-neutral-200 bg-white transition-all duration-300",
          "lg:relative lg:z-auto",
          collapsed ? "w-[72px]" : "w-[240px]",
          mobileOpen
            ? "left-0"
            : "-left-[240px] lg:left-0"
        )}
      >
        {/* Logo section */}
        <div className="flex h-14 items-center justify-between border-b border-neutral-200 px-4">
          <Link
            href="/app/dashboard"
            className="flex items-center gap-2 overflow-hidden"
          >
            <Image
              src="/logo.png"
              alt="Kanghan Logo"
              width={32}
              height={32}
              className="shrink-0"
            />
            {!collapsed && (
              <span className="truncate text-sm font-bold text-neutral-900">
                Kanghan
              </span>
            )}
          </Link>
          <button
            onClick={() => {
              setCollapsed(!collapsed);
              setMobileOpen(false);
            }}
            className="hidden rounded-md p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 lg:block"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-md p-1 text-neutral-400 hover:bg-neutral-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive =
                pathname === item.href ||
                (item.href !== "/app/dashboard" &&
                  pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="border-t border-neutral-200 px-3 py-3">
          <button
            onClick={() => signOut({ callbackUrl: "/app/login" })}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-danger-light hover:text-danger"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>ອອກຈາກລະບົບ</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
