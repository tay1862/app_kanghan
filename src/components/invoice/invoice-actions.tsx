"use client";

import { useRef, useState } from "react";
import { FileText, Download, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { InvoiceTemplate } from "./invoice-template";
import type { InvoiceData } from "./invoice-template";

interface InvoiceActionsProps {
  data: InvoiceData;
}

export function InvoiceActions({ data }: InvoiceActionsProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function exportAsImage() {
    if (!invoiceRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `${data.invoiceNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("ບໍ່ສາມາດສ້າງຮູບໄດ້");
    } finally {
      setExporting(false);
    }
  }

  function printInvoice() {
    if (!invoiceRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data.invoiceNumber}</title>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Lao:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Noto Sans Lao', sans-serif; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>${invoiceRef.current.outerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={() => setShowPreview(true)}>
          <FileText className="h-4 w-4" />
          ເບິ່ງບິນ
        </Button>
      </div>

      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="ໃບບິນ"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{data.invoiceNumber}</h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={printInvoice}>
                <FileText className="h-4 w-4" />
                ພິມ
              </Button>
              <Button size="sm" variant="outline" onClick={exportAsImage} loading={exporting}>
                <ImageIcon className="h-4 w-4" />
                ບັນທຶກຮູບ
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-[70vh] overflow-auto rounded-lg border border-neutral-200 bg-neutral-100 p-4">
            <div className="mx-auto" style={{ maxWidth: "210mm" }}>
              <InvoiceTemplate ref={invoiceRef} data={data} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={exportAsImage} loading={exporting}>
              <Download className="h-4 w-4" />
              ດາວໂຫຼດຮູບ PNG
            </Button>
            <Button size="sm" onClick={printInvoice}>
              <FileText className="h-4 w-4" />
              ພິມ / PDF
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
