"use client";

import React, { useState, useEffect } from "react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Banknote,
  RotateCcw,
  Check,
  Search,
  Printer,
  Scissors,
  CheckSquare,
  Square,
  Sparkles,
  XCircle,
} from "lucide-react";
import { OrderPrintModal } from "@/components/admin/OrderPrintModal";

interface OrderManagerProps {
  orders: Order[];
  passkey: string;
  onRefresh: () => void;
}

export function OrderManager({ orders, passkey, onRefresh }: OrderManagerProps) {
  // Local state for optimistic updates with zero UI flicker
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [printingOrders, setPrintingOrders] = useState<Order[]>([]);
  const [batchTargetStatus, setBatchTargetStatus] = useState<Order["status"]>("Dispatched via Courier");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Sync with prop when parent silent-refreshes in background
  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Filter States
  const [filterTab, setFilterTab] = useState<
    "all" | "today" | "2days" | "3days" | "pending_verification" | "cod_due" | "verified" | "dispatched" | "delivered"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  const broadcastOrderSync = () => {
    try {
      localStorage.setItem("lifaz_order_sync", String(Date.now()));
      window.dispatchEvent(new Event("lifaz:order-sync"));
    } catch {
      // ignore
    }
  };

  const handleUpdate = async (
    orderId: string,
    updates: {
      status?: Order["status"];
      paymentStatus?: Order["paymentStatus"];
      trxId?: string;
    }
  ) => {
    // 1. Instant optimistic update
    const previousOrders = [...localOrders];
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
    setUpdatingId(orderId);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": passkey,
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        showFeedback(`Order ${orderId} updated.`);
        broadcastOrderSync();
        onRefresh();
      } else {
        const data = await res.json();
        // Revert on error
        setLocalOrders(previousOrders);
        alert(data.error || "Failed to update order");
      }
    } catch (err) {
      console.error("Status update failed", err);
      setLocalOrders(previousOrders);
      alert("Network error updating order status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBatchStatusUpdate = async () => {
    if (selectedOrderIds.length === 0) return;
    const previousOrders = [...localOrders];
    // Optimistic batch update
    setLocalOrders((prev) =>
      prev.map((o) =>
        selectedOrderIds.includes(o.id) ? { ...o, status: batchTargetStatus } : o
      )
    );
    setBatchUpdating(true);
    let count = 0;
    try {
      for (const id of selectedOrderIds) {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": passkey,
          },
          body: JSON.stringify({ status: batchTargetStatus }),
        });
        if (res.ok) count++;
      }
      showFeedback(`Updated status to "${batchTargetStatus}" for ${count} order(s).`);
      setSelectedOrderIds([]);
      broadcastOrderSync();
      onRefresh();
    } catch (err) {
      console.error("Batch update error", err);
      setLocalOrders(previousOrders);
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleBatchPaymentVerify = async () => {
    if (selectedOrderIds.length === 0) return;
    const previousOrders = [...localOrders];
    // Optimistic batch payment verify
    setLocalOrders((prev) =>
      prev.map((o) =>
        selectedOrderIds.includes(o.id)
          ? { ...o, paymentStatus: "Payment Verified" }
          : o
      )
    );
    setBatchUpdating(true);
    let count = 0;
    try {
      for (const id of selectedOrderIds) {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": passkey,
          },
          body: JSON.stringify({ paymentStatus: "Payment Verified" }),
        });
        if (res.ok) count++;
      }
      showFeedback(`Verified payment for ${count} order(s).`);
      setSelectedOrderIds([]);
      broadcastOrderSync();
      onRefresh();
    } catch (err) {
      console.error("Batch payment update error", err);
      setLocalOrders(previousOrders);
    } finally {
      setBatchUpdating(false);
    }
  };

  const isWithinDays = (dateStr?: string, createdAt?: string, days = 1) => {
    const raw = createdAt || dateStr;
    if (!raw) return true;
    const parsed = new Date(raw).getTime();
    if (isNaN(parsed)) return true;
    const now = Date.now();
    const diffHours = (now - parsed) / (1000 * 60 * 60);
    return diffHours <= days * 24 + 12;
  };

  // 1. Dispatch Status Color Badges
  const getOrderStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "Order Confirmed":
        return {
          label: "Confirmed",
          bg: "bg-blue-100/90 text-blue-900 border-blue-300",
          dot: "bg-blue-600",
          icon: Package,
        };
      case "In Atelier Prep":
        return {
          label: "In Prep",
          bg: "bg-purple-100/90 text-purple-900 border-purple-300",
          dot: "bg-purple-600",
          icon: Sparkles,
        };
      case "Dispatched via Courier":
        return {
          label: "Dispatched",
          bg: "bg-amber-100/90 text-amber-950 border-amber-400",
          dot: "bg-amber-600",
          icon: Truck,
        };
      case "Delivered":
        return {
          label: "Delivered",
          bg: "bg-emerald-100/90 text-emerald-950 border-emerald-400",
          dot: "bg-emerald-600",
          icon: CheckCircle2,
        };
      case "Cancelled":
        return {
          label: "Cancelled",
          bg: "bg-rose-100/90 text-rose-950 border-rose-300",
          dot: "bg-rose-600",
          icon: XCircle,
        };
      default:
        return {
          label: status || "Pending",
          bg: "bg-neutral-100 text-neutral-800 border-neutral-300",
          dot: "bg-neutral-500",
          icon: Clock,
        };
    }
  };

  // 2. Payment Status Color Badges
  const getPaymentStatusBadge = (status?: string, method?: string) => {
    const isCod =
      (method || "").toLowerCase().includes("cash") ||
      (method || "").toLowerCase().includes("cod");
    const current = status || (isCod ? "COD Due" : "Pending Verification");

    switch (current) {
      case "Payment Verified":
        return {
          label: "Payment Verified",
          bg: "bg-emerald-600 text-white border-emerald-700 shadow-xs",
          icon: CheckCircle2,
        };
      case "COD Due":
        return {
          label: "COD Due",
          bg: "bg-amber-100 text-amber-900 border-amber-300",
          icon: Banknote,
        };
      case "Refunded":
        return {
          label: "Refunded",
          bg: "bg-rose-100 text-rose-900 border-rose-300",
          icon: RotateCcw,
        };
      case "Pending Verification":
      default:
        return {
          label: "Pending Verification",
          bg: "bg-orange-100 text-orange-900 border-orange-300 animate-pulse",
          icon: Clock,
        };
    }
  };

  // 3. Next Action Progression Colors
  const getNextStageAction = (status: Order["status"]) => {
    switch (status) {
      case "Order Confirmed":
        return {
          nextStatus: "In Atelier Prep" as Order["status"],
          label: "Start Prep",
          icon: Sparkles,
          bg: "bg-purple-600 hover:bg-purple-700 text-white border-purple-700 shadow-xs",
        };
      case "In Atelier Prep":
        return {
          nextStatus: "Dispatched via Courier" as Order["status"],
          label: "Dispatch",
          icon: Truck,
          bg: "bg-amber-600 hover:bg-amber-700 text-white border-amber-700 shadow-xs",
        };
      case "Dispatched via Courier":
        return {
          nextStatus: "Delivered" as Order["status"],
          label: "Mark Delivered",
          icon: CheckCircle2,
          bg: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs",
        };
      default:
        return null;
    }
  };

  // Counts
  const todayCount = localOrders.filter((o) => isWithinDays(o.date, o.createdAt, 1)).length;
  const twoDaysCount = localOrders.filter((o) => isWithinDays(o.date, o.createdAt, 2)).length;
  const threeDaysCount = localOrders.filter((o) => isWithinDays(o.date, o.createdAt, 3)).length;
  const pendingCount = localOrders.filter(
    (o) =>
      o.paymentStatus === "Pending Verification" ||
      (!o.paymentStatus && !o.paymentMethod?.toLowerCase().includes("cash"))
  ).length;

  // Filtered Orders
  const filteredOrders = localOrders.filter((order) => {
    const isCod =
      order.paymentMethod?.toLowerCase().includes("cash") ||
      order.paymentMethod?.toLowerCase().includes("cod");
    const paymentStatus =
      order.paymentStatus || (isCod ? "COD Due" : "Pending Verification");

    if (filterTab === "today" && !isWithinDays(order.date, order.createdAt, 1)) {
      return false;
    }
    if (filterTab === "2days" && !isWithinDays(order.date, order.createdAt, 2)) {
      return false;
    }
    if (filterTab === "3days" && !isWithinDays(order.date, order.createdAt, 3)) {
      return false;
    }
    if (filterTab === "pending_verification" && paymentStatus !== "Pending Verification") {
      return false;
    }
    if (filterTab === "cod_due" && paymentStatus !== "COD Due") {
      return false;
    }
    if (filterTab === "verified" && paymentStatus !== "Payment Verified") {
      return false;
    }
    if (filterTab === "dispatched" && order.status !== "Dispatched via Courier") {
      return false;
    }
    if (filterTab === "delivered" && order.status !== "Delivered") {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = (order.id || "").toLowerCase().includes(q);
      const matchCustomer = (order.customer || "").toLowerCase().includes(q);
      const matchPhone = (order.phone || "").toLowerCase().includes(q);
      const matchTrx = (order.bkashTrxId || order.paymentReference || "").toLowerCase().includes(q);
      return matchId || matchCustomer || matchPhone || matchTrx;
    }

    return true;
  });

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredOrders.map((o) => o.id);
    const areAllSelected = allFilteredIds.every((id) => selectedOrderIds.includes(id));
    if (areAllSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
    } else {
      const merged = Array.from(new Set([...selectedOrderIds, ...allFilteredIds]));
      setSelectedOrderIds(merged);
    }
  };

  const handlePrintSelected = () => {
    const selected = localOrders.filter((o) => selectedOrderIds.includes(o.id));
    if (selected.length > 0) {
      setPrintingOrders(selected);
    }
  };

  const handlePrintSingle = (order: Order) => {
    setPrintingOrders([order]);
  };

  return (
    <div className="space-y-4 text-black">
      {/* Feedback Toast */}
      {feedbackMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Top Header & Actions Bar */}
      <div className="bg-white p-5 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-black" />
            <h3 className="font-sans font-bold text-base uppercase tracking-wider text-black">
              Orders & Dispatch ({localOrders.length})
            </h3>
          </div>
          <p className="text-xs text-black/60 font-mono mt-0.5">
            Real-time status progression, color-coded stage badges, and parcel slip printing.
          </p>
        </div>

        {/* Global Print & Batch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedOrderIds.length > 0 && (
            <button
              onClick={handlePrintSelected}
              className="px-3.5 py-2 bg-black text-white font-bold text-xs uppercase tracking-wider hover:bg-black/85 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Print {selectedOrderIds.length} Slips</span>
            </button>
          )}

          <button
            onClick={() => setPrintingOrders(filteredOrders)}
            className="px-3 py-2 bg-[#F5F4EE] text-black font-bold text-xs uppercase tracking-wider hover:bg-black/10 border border-black/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Filtered ({filteredOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Batch Operations Bar (When multiple orders are checked) */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-[#FAF9F5] p-3 border border-black/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-black text-white font-bold text-[10px]">
              {selectedOrderIds.length} SELECTED
            </span>
            <span className="text-black/70 font-bold">Batch Actions:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Batch Status Changer */}
            <div className="flex items-center gap-1 bg-white p-1 border border-black/15">
              <span className="text-[10px] text-black/50 uppercase pl-1 font-bold">Stage:</span>
              <select
                value={batchTargetStatus}
                onChange={(e) => setBatchTargetStatus(e.target.value as any)}
                className="bg-transparent text-black text-[11px] font-mono px-2 py-0.5 focus:outline-hidden"
              >
                <option value="Order Confirmed">Order Confirmed</option>
                <option value="In Atelier Prep">In Atelier Prep</option>
                <option value="Dispatched via Courier">Dispatched via Courier</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                type="button"
                disabled={batchUpdating}
                onClick={handleBatchStatusUpdate}
                className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-black/85 transition-colors cursor-pointer"
              >
                {batchUpdating ? "Applying..." : "Apply"}
              </button>
            </div>

            {/* Batch Payment Verify */}
            <button
              type="button"
              disabled={batchUpdating}
              onClick={handleBatchPaymentVerify}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3 h-3" />
              <span>Verify Payment ({selectedOrderIds.length})</span>
            </button>

            {/* Clear selection */}
            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="px-2 py-1 text-black/50 hover:text-black text-[10px] uppercase transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs & Quick Date Selectors Bar */}
      <div className="bg-white p-3 border border-black/10 flex flex-col lg:flex-row lg:items-center justify-between gap-3 font-mono text-xs">
        {/* Left: Quick Date & Status Filters */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { key: "all", label: `All (${localOrders.length})` },
            { key: "today", label: `Today (${todayCount})` },
            { key: "2days", label: `2 Days (${twoDaysCount})` },
            { key: "3days", label: `3 Days (${threeDaysCount})` },
            {
              key: "pending_verification",
              label: `⚠️ Pending (${pendingCount})`,
              badgeColor: "bg-orange-100 text-orange-900 border-orange-300",
              highlight: pendingCount > 0,
            },
            {
              key: "cod_due",
              label: "COD Due",
              badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
            },
            {
              key: "verified",
              label: "Verified",
              badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
            },
            {
              key: "dispatched",
              label: "Dispatched",
              badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
            },
            {
              key: "delivered",
              label: "Delivered",
              badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
            },
          ].map((tab) => {
            const active = filterTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterTab(tab.key as any)}
                className={`px-2.5 py-1 border uppercase tracking-wider transition-colors cursor-pointer text-[10px] font-bold ${
                  active
                    ? "bg-black text-white border-black"
                    : tab.badgeColor
                    ? `${tab.badgeColor} hover:opacity-80`
                    : "bg-[#F5F4EE] text-black/70 border-black/10 hover:border-black/30 hover:text-black"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Search + Select All */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            className="px-2.5 py-1 bg-[#F5F4EE] hover:bg-black/5 text-black text-[10px] uppercase font-bold border border-black/10 cursor-pointer whitespace-nowrap flex items-center gap-1"
          >
            {filteredOrders.length > 0 &&
            filteredOrders.every((o) => selectedOrderIds.includes(o.id)) ? (
              <>
                <CheckSquare className="w-3 h-3 text-black" />
                <span>Deselect ({filteredOrders.length})</span>
              </>
            ) : (
              <>
                <Square className="w-3 h-3 text-black/40" />
                <span>Select All ({filteredOrders.length})</span>
              </>
            )}
          </button>

          <div className="relative flex items-center bg-[#F5F4EE] border border-black/10 focus-within:border-black w-48">
            <Search className="w-3 h-3 text-black/40 ml-2.5 shrink-0" />
            <input
              type="text"
              placeholder="Search ref, phone, trx..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2 py-1 bg-transparent text-black text-[11px] font-mono focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-2.5">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-8 text-center border border-black/10 space-y-2 font-mono text-xs text-black/50">
            <Package className="w-6 h-6 text-black/30 mx-auto" />
            <div>No matching orders found.</div>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const isSelected = selectedOrderIds.includes(order.id);
            const paymentBadge = getPaymentStatusBadge(order.paymentStatus, order.paymentMethod);
            const PaymentIcon = paymentBadge.icon;
            const orderBadge = getOrderStatusBadge(order.status);
            const OrderIcon = orderBadge.icon;

            const trxId = order.bkashTrxId || order.paymentReference;
            const isCod =
              order.paymentMethod?.toLowerCase().includes("cash") ||
              order.paymentMethod?.toLowerCase().includes("cod");
            const currentPaymentStatus =
              order.paymentStatus || (isCod ? "COD Due" : "Pending Verification");
            const nextAction = getNextStageAction(order.status);
            const NextIcon = nextAction?.icon;

            return (
              <div
                key={order.id}
                className={`bg-white p-4 border transition-all font-mono text-xs ${
                  isSelected
                    ? "border-black bg-black/[0.02] shadow-xs"
                    : currentPaymentStatus === "Pending Verification"
                    ? "border-orange-300 hover:border-orange-400"
                    : "border-black/10 hover:border-black/25"
                }`}
              >
                {/* Row 1: Checkbox + Ref + Date + Customer + Color Badges + Total Price + Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 pb-3 border-b border-black/5">
                  {/* Left: Checkbox + ID + Customer + Status Badges */}
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="accent-black w-4 h-4 cursor-pointer shrink-0"
                    />

                    <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                      <span className="font-bold text-black uppercase text-[11px]">
                        {order.id || order.orderNumber}
                      </span>
                      <span className="text-black/20">•</span>
                      <span className="text-black/50 text-[10px]">{order.date}</span>
                      <span className="text-black/20">•</span>
                      <span className="font-sans font-bold text-black text-xs truncate max-w-44">
                        {order.customer}
                      </span>
                      <span className="text-black/50 text-[11px]">({order.phone})</span>

                      {/* Payment Status Badge with Full Color */}
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-xs flex items-center gap-1 ${paymentBadge.bg}`}
                      >
                        <PaymentIcon className="w-2.5 h-2.5 shrink-0" />
                        <span>{paymentBadge.label}</span>
                      </span>

                      {/* Dispatch Stage Badge with Full Color */}
                      <span
                        className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-xs flex items-center gap-1 ${orderBadge.bg}`}
                      >
                        <OrderIcon className="w-2.5 h-2.5 shrink-0" />
                        <span>{orderBadge.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Total Price + Colored Fast Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end">
                    <span className="font-bold text-sm text-black mr-1">
                      {formatPrice(order.total)}
                    </span>

                    {/* Quick Next-Stage Progression Button */}
                    {nextAction && (
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() =>
                          handleUpdate(order.id, { status: nextAction.nextStatus })
                        }
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border flex items-center gap-1 ${nextAction.bg}`}
                        title={`Advance status to ${nextAction.nextStatus}`}
                      >
                        {NextIcon && <NextIcon className="w-3 h-3" />}
                        <span>{nextAction.label}</span>
                      </button>
                    )}

                    {/* Quick Payment Verify Button */}
                    {currentPaymentStatus !== "Payment Verified" && (
                      <button
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() =>
                          handleUpdate(order.id, { paymentStatus: "Payment Verified" })
                        }
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-700 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Mark Payment as Verified"
                      >
                        <Check className="w-3 h-3" />
                        <span>Verify Pay</span>
                      </button>
                    )}

                    {/* Single Print Slip Button */}
                    <button
                      type="button"
                      onClick={() => handlePrintSingle(order)}
                      className="px-2.5 py-1 bg-[#F5F4EE] hover:bg-black/10 text-black border border-black/10 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                      title="Print Parcel Slip"
                    >
                      <Scissors className="w-3 h-3" />
                      <span>Slip</span>
                    </button>
                  </div>
                </div>

                {/* Row 2: Details Breakdown & Direct Status Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 text-[11px] text-black/80">
                  {/* Garment Items */}
                  <div className="md:col-span-4 flex items-start gap-1">
                    <span className="text-black/40 uppercase text-[10px] shrink-0 font-bold">Items:</span>
                    <span className="font-medium text-black/90 line-clamp-1">{order.items}</span>
                  </div>

                  {/* Destination */}
                  <div className="md:col-span-3 flex items-start gap-1">
                    <span className="text-black/40 uppercase text-[10px] shrink-0 font-bold">Address:</span>
                    <span className="truncate text-black/80">
                      {order.area}, {order.division} ({order.address})
                    </span>
                  </div>

                  {/* Payment & TrxID */}
                  <div className="md:col-span-2 flex items-center gap-1">
                    <span className="text-black/40 uppercase text-[10px] shrink-0 font-bold">Pay:</span>
                    <span className="text-black font-medium truncate">{order.paymentMethod}</span>
                    {trxId && (
                      <span className="px-1 py-0.2 bg-black/5 text-black font-mono text-[9px] truncate border border-black/10">
                        {trxId}
                      </span>
                    )}
                  </div>

                  {/* Explicit Stage Selector & Payment Selector */}
                  <div className="md:col-span-3 flex items-center justify-end gap-1.5">
                    {/* Order Status Select Box */}
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleUpdate(order.id, { status: e.target.value as any })
                      }
                      className="px-2 py-1 bg-[#F5F4EE] border border-black/15 text-black font-mono text-[10px] uppercase focus:outline-hidden cursor-pointer hover:border-black font-bold"
                      title="Update Order Dispatch Status"
                    >
                      <option value="Order Confirmed">🔵 Confirmed</option>
                      <option value="In Atelier Prep">🟣 In Prep</option>
                      <option value="Dispatched via Courier">🟡 Dispatched</option>
                      <option value="Delivered">🟢 Delivered</option>
                      <option value="Cancelled">🔴 Cancelled</option>
                    </select>

                    {/* Payment Status Select Box */}
                    <select
                      value={order.paymentStatus || (isCod ? "COD Due" : "Pending Verification")}
                      disabled={updatingId === order.id}
                      onChange={(e) =>
                        handleUpdate(order.id, { paymentStatus: e.target.value as any })
                      }
                      className="px-2 py-1 bg-[#F5F4EE] border border-black/15 text-black font-mono text-[10px] uppercase focus:outline-hidden cursor-pointer hover:border-black font-bold"
                      title="Update Payment Clearance Status"
                    >
                      <option value="Pending Verification">🟠 Pending</option>
                      <option value="Payment Verified">🟢 Verified</option>
                      <option value="COD Due">🟡 COD Due</option>
                      <option value="Refunded">🔴 Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Multi-Order & Single Parcel Printable Modal */}
      <OrderPrintModal
        orders={printingOrders}
        isOpen={printingOrders.length > 0}
        onClose={() => setPrintingOrders([])}
      />
    </div>
  );
}
