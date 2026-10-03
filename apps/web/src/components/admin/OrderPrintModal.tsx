"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Printer,
  X,
  Calendar,
  CreditCard,
  User,
  MapPin,
  Package,
  CheckCircle2,
  Banknote,
  Clock,
  ShieldCheck,
  FileText,
  Sliders,
  Scissors,
  Layers,
  Check,
} from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/currency";

interface OrderPrintModalProps {
  orders: Order[];
  isOpen: boolean;
  onClose: () => void;
}

export function OrderPrintModal({
  orders,
  isOpen,
  onClose,
}: OrderPrintModalProps) {
  const [mounted, setMounted] = useState(false);

  // Print mode: "parcel_stickers" (compact cut & stick) or "detailed_invoices" (full A4)
  const [printMode, setPrintMode] = useState<"parcel_stickers" | "detailed_invoices">(
    orders.length > 1 ? "parcel_stickers" : "parcel_stickers"
  );

  // Custom print options
  const [dateMode, setDateMode] = useState<"original" | "today" | "custom">("today");
  const [customDate, setCustomDate] = useState<string>("");
  const [gridCols, setGridCols] = useState<2 | 3>(2);
  const [customNote, setCustomNote] = useState<string>(
    "Handle with care • Luxury garment inside • Doorstep inspection enabled"
  );
  const [showItemDetails, setShowItemDetails] = useState(true);
  const [showSenderHeader, setShowSenderHeader] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (orders.length > 1) {
      setPrintMode("parcel_stickers");
    }
  }, [orders]);

  if (!isOpen || orders.length === 0 || !mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const getEffectiveDate = (order: Order) => {
    if (dateMode === "original") {
      return order.date || new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    if (dateMode === "today") {
      return new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    return customDate || order.date || "Today";
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs">
      {/* Modal Dialog */}
      <div className="max-w-5xl w-full bg-[#0A0A0A] border border-white/20 shadow-2xl flex flex-col max-h-[96vh] text-white">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="p-4 bg-[#111111] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#C5A059]" />
            <h3 className="font-sans font-black text-sm uppercase tracking-wider text-white">
              Print Dispatch Slips ({orders.length} Order{orders.length === 1 ? "" : "s"})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print {orders.length} Slip{orders.length === 1 ? "" : "s"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Print Configuration Controls (Hidden in Print) */}
        <div className="p-4 bg-[#080808] border-b border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono print:hidden">
          {/* Print Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-white/60 flex items-center gap-1">
              <Scissors className="w-3 h-3 text-[#C5A059]" />
              <span>Print Layout Mode</span>
            </label>
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value as any)}
              className="w-full px-2.5 py-1.5 bg-black border border-white/20 text-white text-[11px] font-mono focus:outline-hidden"
            >
              <option value="parcel_stickers">✂️ Compact Parcel Stickers (Multiple / Page)</option>
              <option value="detailed_invoices">📄 Full A4 Invoices (1 / Page)</option>
            </select>
          </div>

          {/* Date Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-white/60 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#C5A059]" />
              <span>Date On Slips</span>
            </label>
            <div className="flex items-center gap-1.5">
              <select
                value={dateMode}
                onChange={(e) => setDateMode(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-black border border-white/20 text-white text-[11px] font-mono focus:outline-hidden"
              >
                <option value="today">Today's Dispatch Date</option>
                <option value="original">Original Order Date</option>
                <option value="custom">Custom Date</option>
              </select>

              {dateMode === "custom" && (
                <input
                  type="text"
                  placeholder="e.g. 03 OCT"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="px-2 py-1.5 bg-black border border-white/20 text-white text-[11px] font-mono focus:outline-hidden w-28"
                />
              )}
            </div>
          </div>

          {/* Sticker Grid Density */}
          {printMode === "parcel_stickers" && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-wider text-white/60 flex items-center gap-1">
                <Layers className="w-3 h-3 text-[#C5A059]" />
                <span>Grid Density (Per Page)</span>
              </label>
              <select
                value={gridCols}
                onChange={(e) => setGridCols(parseInt(e.target.value) as any)}
                className="w-full px-2.5 py-1.5 bg-black border border-white/20 text-white text-[11px] font-mono focus:outline-hidden"
              >
                <option value={2}>2 Columns (4 labels / A4 page - Large)</option>
                <option value={3}>3 Columns (6 labels / A4 page - Compact)</option>
              </select>
            </div>
          )}

          {/* Custom Note Memo */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-white/60 flex items-center gap-1">
              <FileText className="w-3 h-3 text-[#C5A059]" />
              <span>Parcel Footer Note</span>
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-black border border-white/20 text-white text-[11px] font-mono focus:outline-hidden"
            />
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-neutral-900 print:p-0 print:bg-white print:overflow-visible">
          {/* ------------------------------------------------------------- */}
          {/* MODE 1: COMPACT PARCEL STICKERS (MULTIPLE PER PAGE / CUT & STICK) */}
          {/* ------------------------------------------------------------- */}
          {printMode === "parcel_stickers" ? (
            <div
              id="printable-invoice"
              className={`max-w-4xl mx-auto grid gap-4 print:gap-2 print:m-0 print:p-0 ${
                gridCols === 3
                  ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 print:grid-cols-3"
                  : "grid-cols-1 sm:grid-cols-2 print:grid-cols-2"
              }`}
            >
              {orders.map((ord, idx) => {
                const isCod =
                  ord.paymentMethod?.toLowerCase().includes("cash") ||
                  ord.paymentMethod?.toLowerCase().includes("cod");
                const paymentStatus =
                  ord.paymentStatus || (isCod ? "COD Due" : "Pending Verification");
                const trxId = ord.bkashTrxId || ord.paymentReference;
                const dateStr = getEffectiveDate(ord);

                return (
                  <div
                    key={ord.id || idx}
                    className="bg-white text-black p-4 border-2 border-dashed border-black relative break-inside-avoid flex flex-col justify-between shadow-sm print:shadow-none print:p-3 text-xs font-mono"
                    style={{ minHeight: "240px" }}
                  >
                    {/* Order Ref & Logistics Header */}
                    <div className="pb-2 border-b border-black/15 flex items-start justify-between gap-1 text-[11px]">
                      <div>
                        <span className="text-[9px] text-black/60 uppercase block">ORDER REF</span>
                        <strong className="font-bold text-xs uppercase">{ord.id || ord.orderNumber}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-black/60 uppercase block">DATE</span>
                        <span className="font-semibold text-[10px]">{dateStr}</span>
                      </div>
                    </div>

                    {/* Recipient Logistics (High Contrast) */}
                    <div className="py-2 border-b border-black/15 space-y-1">
                      <div className="text-[9px] text-black/60 uppercase font-bold">RECIPIENT:</div>
                      <div className="font-black text-sm text-black uppercase leading-tight">
                        {ord.customer}
                      </div>
                      <div className="font-bold text-xs text-black">
                        📞 {ord.phone}
                      </div>
                      <div className="text-[11px] text-black/90 leading-tight">
                        {ord.address}, <span className="font-bold">{ord.area}</span>, {ord.division} Div.
                      </div>
                      <div className="text-[10px] font-semibold text-black/70 uppercase">
                        Courier: {ord.division === "Dhaka" ? "Inside Dhaka (৳60)" : "Outside Dhaka All BD (৳130)"}
                      </div>
                    </div>

                    {/* Garments Breakdown */}
                    <div className="py-1.5 border-b border-black/15 text-[11px]">
                      <div className="text-[9px] text-black/60 uppercase font-bold">Item:</div>
                      <div className="font-bold text-black line-clamp-2 leading-tight mt-0.5">
                        {ord.items}
                      </div>
                    </div>

                    {/* Settlement Banner: COD Due vs Paid Online */}
                    <div className="pt-2 space-y-1">
                      {ord.dueAmount !== undefined ? (
                        ord.dueAmount > 0 ? (
                          <div className="p-2 bg-black text-white text-center font-bold uppercase tracking-wider text-xs">
                            CASH TO COLLECT: {formatPrice(ord.dueAmount)}
                            {ord.advancePaid !== undefined && ord.advancePaid > 0 && (
                              <span className="block text-[9px] font-normal text-white/80 font-mono mt-0.5">
                                (Advance Paid: {formatPrice(ord.advancePaid)})
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="p-1.5 border-2 border-black text-black text-center font-bold uppercase tracking-wider text-[11px] bg-neutral-100">
                            ✓ 100% PAID ONLINE • COLLECT ৳0
                          </div>
                        )
                      ) : isCod || paymentStatus === "COD Due" ? (
                        <div className="p-2 bg-black text-white text-center font-bold uppercase tracking-wider text-xs">
                          CASH TO COLLECT: {formatPrice(ord.total)}
                        </div>
                      ) : paymentStatus === "Payment Verified" ? (
                        <div className="p-1.5 border-2 border-black text-black text-center font-bold uppercase tracking-wider text-[11px] bg-neutral-100">
                          ✓ PAID ONLINE • COLLECT ৳0
                        </div>
                      ) : (
                        <div className="p-1.5 border border-black text-black text-center font-bold uppercase tracking-wider text-[10px] bg-neutral-100">
                          {paymentStatus} • {formatPrice(ord.total)}
                        </div>
                      )}
                      {/* Footer guarantee note */}
                      <div className="text-[8px] text-black/50 text-center uppercase tracking-tight pt-1">
                        LIFAZ Happy shopping...
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ------------------------------------------------------------- */
            /* MODE 2: DETAILED INVOICE (1 PER PAGE WITH PAGE-BREAK) */
            /* ------------------------------------------------------------- */
            <div id="printable-invoice" className="space-y-8 print:space-y-0">
              {orders.map((order, oIdx) => {
                const isCod =
                  order.paymentMethod?.toLowerCase().includes("cash") ||
                  order.paymentMethod?.toLowerCase().includes("cod");
                const paymentStatus =
                  order.paymentStatus || (isCod ? "COD Due" : "Pending Verification");
                const trxId = order.bkashTrxId || order.paymentReference;
                const dateStr = getEffectiveDate(order);

                return (
                  <div
                    key={order.id || oIdx}
                    className="max-w-3xl mx-auto bg-white text-black p-8 border border-black/15 shadow-md print:border-none print:shadow-none print:p-0 print:break-after-page mb-8 print:mb-0"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-black">
                      <div>
                        <span className="text-[9px] font-mono tracking-widest text-black/60 uppercase block font-bold">
                          DHAKA ATELIER // READY-TO-WEAR & CAPSULE DROPS
                        </span>
                        <h1 className="font-editorial-serif text-3xl font-black uppercase tracking-tight text-black mt-0.5">
                          LIFAZ
                        </h1>
                        <p className="text-[10px] font-mono text-black/60 mt-1">
                          Dhaka, Bangladesh • 64-District Insured Courier Dispatch Desk
                        </p>
                      </div>

                      <div className="text-left sm:text-right font-mono space-y-1 text-xs">
                        <div className="inline-block px-2 py-0.5 bg-black text-white text-[10px] font-bold tracking-widest uppercase">
                          DISPATCH INVOICE
                        </div>
                        <div className="font-bold text-black mt-1">
                          REF: <span className="font-mono">{order.id || order.orderNumber}</span>
                        </div>
                        <div className="text-black/70 text-[11px]">
                          Date: <span className="font-semibold text-black">{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    {/* Logistics Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 border-b border-black/15 text-xs font-mono">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-black/50 block">
                          RECIPIENT & ADDRESS
                        </span>
                        <div className="font-bold text-sm text-black">{order.customer}</div>
                        <div className="text-black/80">Phone: <strong className="text-black">{order.phone}</strong></div>
                        <div className="text-black/80 text-[11px] leading-relaxed">
                          {order.address}, {order.area}, {order.division} Division
                        </div>
                      </div>

                      <div className="space-y-1 sm:text-right">
                        <span className="text-[10px] uppercase font-bold text-black/50 block">
                          SETTLEMENT MATRIX
                        </span>
                        <div>Courier: <strong>{order.division === "Dhaka" ? "Inside Dhaka (৳60)" : "Outside Dhaka (৳130)"}</strong></div>
                        <div>Payment: <strong>{order.paymentMethod}</strong></div>
                        <div>Status: <span className="font-bold uppercase">{paymentStatus}</span></div>
                        {order.advancePaid !== undefined && order.advancePaid > 0 && (
                          <div>Advance Paid: <strong className="text-emerald-700">{formatPrice(order.advancePaid)}</strong></div>
                        )}
                        {order.dueAmount !== undefined && (
                          <div>Due on Delivery: <strong className="text-black">{formatPrice(order.dueAmount)}</strong></div>
                        )}
                        {trxId && <div>TrxID: <strong>{trxId}</strong></div>}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="py-4 border-b border-black/15 font-mono text-xs">
                      <span className="text-[10px] uppercase font-bold text-black/50 block mb-2">
                        GARMENTS ORDERED
                      </span>
                      <div className="p-3 bg-neutral-50 border border-black/10">
                        {order.items}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="py-4 flex justify-between items-center text-xs font-mono border-b border-black/15">
                      <span className="text-black/60 italic text-[11px]">{customNote}</span>
                      <div className="text-right space-y-0.5">
                        <div className="text-black/70">Total Order: <span className="font-mono font-bold text-sm text-black">{formatPrice(order.total)}</span></div>
                        {order.dueAmount !== undefined && order.dueAmount > 0 && (
                          <div className="text-[11px] font-bold text-black uppercase bg-black text-white px-2 py-0.5 mt-1 inline-block">
                            CASH TO COLLECT: {formatPrice(order.dueAmount)}
                          </div>
                        )}
                        {order.dueAmount === 0 && (
                          <div className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">
                            [100% PAID ONLINE]
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sizing Desk Footer */}
                    <div className="pt-4 flex justify-between items-center text-[9px] font-mono text-black/50 uppercase">
                      <span>7-Day Sizing Exchange Desk • support@lifaz.shop</span>
                      <span>Atelier Seal • Inspected in Dhaka</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
