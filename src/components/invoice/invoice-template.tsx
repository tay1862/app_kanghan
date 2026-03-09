"use client";

import { forwardRef } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface InvoiceItem {
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  type: "booking" | "food";
  date: string;
  customerName: string;
  customerPhone?: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  notes?: string;
  // Booking specific
  roomInfo?: string;
  checkIn?: string;
  checkOut?: string;
  totalNights?: number;
  numGuests?: number;
  // Food specific
  orderType?: string;
  eventDate?: string;
  numTables?: number;
  // Business info
  businessName?: string;
  businessNameLao?: string;
  businessAddress?: string;
  businessPhone?: string;
  createdBy?: string;
}

const InvoiceTemplate = forwardRef<HTMLDivElement, { data: InvoiceData }>(
  ({ data }, ref) => {
    return (
      <div
        ref={ref}
        className="mx-auto bg-white"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "15mm 20mm",
          fontFamily: "'Noto Sans Lao', sans-serif",
          fontSize: "11px",
          color: "#1a1a1a",
          lineHeight: 1.6,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", borderBottom: "2px solid #2D5016", paddingBottom: "15px" }}>
          <div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#2D5016", margin: 0 }}>
              {data.businessNameLao || "ກັງຫັນ ວາເລ ຣີສອດ ແອນ ແຄັມປິງ"}
            </h1>
            <p style={{ fontSize: "12px", color: "#C4A06A", margin: "2px 0 0", fontWeight: 600 }}>
              {data.businessName || "Kanghan Valley Resort & Camping"}
            </p>
            {data.businessAddress && (
              <p style={{ fontSize: "10px", color: "#666", margin: "4px 0 0" }}>{data.businessAddress}</p>
            )}
            {data.businessPhone && (
              <p style={{ fontSize: "10px", color: "#666", margin: "2px 0 0" }}>ໂທ: {data.businessPhone}</p>
            )}
          </div>
          <div style={{ textAlign: "right" }}>
            <h2 style={{ fontSize: "16px", fontWeight: "bold", color: "#2D5016", margin: 0 }}>
              {data.type === "booking" ? "ໃບບິນຈອງຫ້ອງ" : "ໃບບິນອາຫານ"}
            </h2>
            <p style={{ fontSize: "14px", fontWeight: "bold", margin: "4px 0 0", fontFamily: "monospace" }}>
              {data.invoiceNumber}
            </p>
            <p style={{ fontSize: "10px", color: "#666", margin: "4px 0 0" }}>
              ວັນທີ: {formatDate(data.date)}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div style={{ display: "flex", gap: "30px", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: "11px", fontWeight: "bold", color: "#2D5016", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              ຂໍ້ມູນ{data.type === "booking" ? "ແຂກ" : "ລູກຄ້າ"}
            </h3>
            <table style={{ fontSize: "10px" }}>
              <tbody>
                <tr>
                  <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ຊື່:</td>
                  <td style={{ fontWeight: 600 }}>{data.customerName || "-"}</td>
                </tr>
                {data.customerPhone && (
                  <tr>
                    <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ໂທ:</td>
                    <td>{data.customerPhone}</td>
                  </tr>
                )}
                {data.numGuests && (
                  <tr>
                    <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ຈຳນວນແຂກ:</td>
                    <td>{data.numGuests} ຄົນ</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {data.type === "booking" && (
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "11px", fontWeight: "bold", color: "#2D5016", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ຂໍ້ມູນການຈອງ
              </h3>
              <table style={{ fontSize: "10px" }}>
                <tbody>
                  {data.roomInfo && (
                    <tr>
                      <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ຫ້ອງ:</td>
                      <td style={{ fontWeight: 600 }}>{data.roomInfo}</td>
                    </tr>
                  )}
                  {data.checkIn && (
                    <tr>
                      <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ເຊັກອິນ:</td>
                      <td>{formatDate(data.checkIn)}</td>
                    </tr>
                  )}
                  {data.checkOut && (
                    <tr>
                      <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ເຊັກເອົາ:</td>
                      <td>{formatDate(data.checkOut)}</td>
                    </tr>
                  )}
                  {data.totalNights && (
                    <tr>
                      <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ຈຳນວນຄືນ:</td>
                      <td>{data.totalNights} ຄືນ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {data.type === "food" && (
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "11px", fontWeight: "bold", color: "#2D5016", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ຂໍ້ມູນອໍເດີ
              </h3>
              <table style={{ fontSize: "10px" }}>
                <tbody>
                  {data.orderType && (
                    <tr>
                      <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ປະເພດ:</td>
                      <td style={{ fontWeight: 600 }}>{data.orderType}</td>
                    </tr>
                  )}
                  {data.eventDate && (
                    <tr>
                      <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ວັນງານ:</td>
                      <td>{formatDate(data.eventDate)}</td>
                    </tr>
                  )}
                  {data.numTables && (
                    <tr>
                      <td style={{ padding: "2px 10px 2px 0", color: "#666" }}>ຈຳນວນໂຕະ:</td>
                      <td>{data.numTables} ໂຕະ</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#2D5016", color: "white" }}>
              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10px", fontWeight: 600 }}>#</th>
              <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "10px", fontWeight: 600 }}>ລາຍການ</th>
              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "10px", fontWeight: 600 }}>ຈຳນວນ</th>
              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "10px", fontWeight: 600 }}>ລາຄາ</th>
              <th style={{ padding: "8px 10px", textAlign: "right", fontSize: "10px", fontWeight: 600 }}>ລວມ</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #e5e5e5" }}>
                <td style={{ padding: "8px 10px", fontSize: "10px", color: "#666" }}>{idx + 1}</td>
                <td style={{ padding: "8px 10px", fontSize: "10px", fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: "8px 10px", fontSize: "10px", textAlign: "right" }}>
                  {item.quantity} {item.unit}
                </td>
                <td style={{ padding: "8px 10px", fontSize: "10px", textAlign: "right" }}>
                  {formatCurrency(item.unitPrice)}
                </td>
                <td style={{ padding: "8px 10px", fontSize: "10px", textAlign: "right", fontWeight: 600 }}>
                  {formatCurrency(item.totalPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
          <div style={{ width: "250px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "10px" }}>
              <span style={{ color: "#666" }}>ຍອດລວມ:</span>
              <span>{formatCurrency(data.subtotal)}</span>
            </div>
            {data.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "10px", color: "#dc2626" }}>
                <span>ສ່ວນຫຼຸດ:</span>
                <span>-{formatCurrency(data.discountAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: "13px", fontWeight: "bold", borderTop: "2px solid #2D5016", borderBottom: "2px solid #2D5016", margin: "4px 0" }}>
              <span>ຍອດສຸດທິ:</span>
              <span>{formatCurrency(data.totalAmount)}</span>
            </div>
            {data.depositAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "10px", color: "#2D5016" }}>
                <span>ມັດຈຳ:</span>
                <span>{formatCurrency(data.depositAmount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: "11px", fontWeight: "bold", color: "#dc2626" }}>
              <span>ຍອດຄ້າງ:</span>
              <span>{formatCurrency(data.remainingAmount)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
            <p style={{ fontSize: "10px", color: "#666", margin: 0 }}>
              <strong>ໝາຍເຫດ:</strong> {data.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: "auto", borderTop: "1px solid #e5e5e5", paddingTop: "15px", display: "flex", justifyContent: "space-between" }}>
          <div style={{ textAlign: "center", width: "45%" }}>
            <p style={{ fontSize: "10px", color: "#666", margin: "0 0 30px" }}>ຜູ້ຮັບເງິນ</p>
            <div style={{ borderBottom: "1px dotted #999", marginBottom: "5px" }} />
            <p style={{ fontSize: "9px", color: "#999", margin: 0 }}>{data.createdBy || ""}</p>
          </div>
          <div style={{ textAlign: "center", width: "45%" }}>
            <p style={{ fontSize: "10px", color: "#666", margin: "0 0 30px" }}>ຜູ້ຈ່າຍເງິນ</p>
            <div style={{ borderBottom: "1px dotted #999", marginBottom: "5px" }} />
            <p style={{ fontSize: "9px", color: "#999", margin: 0 }}>{data.customerName || ""}</p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ fontSize: "8px", color: "#999", margin: 0 }}>
            ຂອບໃຈທີ່ໃຊ້ບໍລິການ {data.businessNameLao || "ກັງຫັນ ວາເລ ຣີສອດ ແອນ ແຄັມປິງ"}
          </p>
        </div>
      </div>
    );
  }
);

InvoiceTemplate.displayName = "InvoiceTemplate";

export { InvoiceTemplate };
export type { InvoiceData, InvoiceItem };
