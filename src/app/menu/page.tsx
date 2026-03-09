"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MenuPage {
  id: number;
  title: string | null;
  imageUrl: string;
  sortOrder: number;
}

export default function PublicMenuPage() {
  const [pages, setPages] = useState<MenuPage[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/menu-pages");
      const json = await res.json();
      if (json.success) setPages(json.data);
    } catch {
      console.error("Failed to load menu pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  function goNext() {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  }

  function goPrev() {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-neutral-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-neutral-900 text-white">
        <Image src="/logo.png" alt="Kanghan" width={80} height={80} />
        <h1 className="mt-4 text-2xl font-bold">Kanghan Valley</h1>
        <p className="mt-2 text-neutral-400">ເມນູກຳລັງອັບເດດ...</p>
      </div>
    );
  }

  const page = pages[currentPage];

  return (
    <div
      className="relative flex h-screen select-none items-center justify-center overflow-hidden bg-neutral-900"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Menu image */}
      <div className="relative h-full w-full max-w-[800px]">
        <Image
          src={page.imageUrl}
          alt={page.title || `ໜ້າ ${currentPage + 1}`}
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      {currentPage > 0 && (
        <button
          onClick={goPrev}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-4 sm:p-3"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}
      {currentPage < pages.length - 1 && (
        <button
          onClick={goNext}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-4 sm:p-3"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      )}

      {/* Page indicator */}
      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
        {pages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentPage(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentPage ? "w-6 bg-white" : "w-2 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Title */}
      {page.title && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 backdrop-blur-sm">
          <p className="text-sm font-medium text-white">{page.title}</p>
        </div>
      )}
    </div>
  );
}
