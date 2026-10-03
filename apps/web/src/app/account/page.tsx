"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User as UserIcon,
  LogOut,
  MapPin,
  ShieldCheck,
  Edit3,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Order } from "@/lib/types";
import { formatPrice } from "@/lib/currency";
import { useAuth } from "@/lib/auth-context";

const DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

export default function AccountPage() {
  const { user, isLoading, login, signup, logout, updateProfile } = useAuth();

  // Auth Form State
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup inputs
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupDivision, setSignupDivision] = useState("Dhaka");
  const [signupArea, setSignupArea] = useState("");
  const [signupAddress, setSignupAddress] = useState("");

  // Edit Profile / Address State
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDivision, setEditDivision] = useState("Dhaka");
  const [editArea, setEditArea] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editSuccessMsg, setEditSuccessMsg] = useState("");

  // Orders State for logged in user
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Single Order Lookup State
  const [orderQuery, setOrderQuery] = useState("");
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const [singleOrderLoading, setSingleOrderLoading] = useState(false);
  const [singleOrderError, setSingleOrderError] = useState("");

  // Sync edit form with user data
  const fetchUserOrders = async (userId: string, isInitial = false) => {
    if (isInitial) {
      setOrdersLoading(true);
    }
    try {
      const res = await fetch(`/api/auth/me?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (res.ok && data.orders) {
        setUserOrders(data.orders);
      }
    } catch {
      // ignore
    } finally {
      if (isInitial) {
        setOrdersLoading(false);
      }
    }
  };

  // 1. Initial Load & Form Sync
  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
      setEditDivision(user.division || "Dhaka");
      setEditArea(user.area || "");
      setEditAddress(user.address || "");
      fetchUserOrders(user.id, true);
    }
  }, [user]);

  // 2. Real-Time Auto-Sync (Polling + Focus + Storage Events) for Live Order Updates
  useEffect(() => {
    if (!user) return;

    const handleSync = () => {
      if (document.visibilityState === "visible") {
        fetchUserOrders(user.id, false);
      }
    };

    // Auto-poll every 5 seconds while active
    const pollTimer = setInterval(handleSync, 5000);

    // Instant sync on tab focus & window visibility
    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    // Instant cross-tab sync when admin updates an order
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "lifaz_order_sync") {
        fetchUserOrders(user.id, false);
      }
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("lifaz:order-sync", handleSync);

    return () => {
      clearInterval(pollTimer);
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("lifaz:order-sync", handleSync);
    };
  }, [user]);

  // 3. Real-Time Auto-Sync for Guest Single Order Tracker
  useEffect(() => {
    if (!singleOrder?.id && !orderQuery.trim()) return;
    const targetQuery = singleOrder?.orderNumber || singleOrder?.id || orderQuery.trim();

    const refreshSingleOrder = async () => {
      if (document.visibilityState !== "visible" || !targetQuery) return;
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(targetQuery)}`);
        const data = await res.json();
        if (res.ok && data.order) {
          setSingleOrder(data.order);
        }
      } catch {
        // ignore
      }
    };

    const guestPollTimer = setInterval(refreshSingleOrder, 5000);
    window.addEventListener("focus", refreshSingleOrder);
    document.addEventListener("visibilitychange", refreshSingleOrder);
    window.addEventListener("storage", refreshSingleOrder);
    window.addEventListener("lifaz:order-sync", refreshSingleOrder);

    return () => {
      clearInterval(guestPollTimer);
      window.removeEventListener("focus", refreshSingleOrder);
      document.removeEventListener("visibilitychange", refreshSingleOrder);
      window.removeEventListener("storage", refreshSingleOrder);
      window.removeEventListener("lifaz:order-sync", refreshSingleOrder);
    };
  }, [singleOrder?.id, singleOrder?.status, singleOrder?.paymentStatus, orderQuery]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const res = await login(loginIdentifier, loginPassword);
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || "Login failed");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    const res = await signup({
      name: signupName,
      email: signupEmail,
      phone: signupPhone,
      password: signupPassword,
      division: signupDivision,
      area: signupArea,
      address: signupAddress,
    });
    setAuthLoading(false);
    if (!res.success) {
      setAuthError(res.error || "Signup failed");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSuccessMsg("");
    const res = await updateProfile({
      name: editName,
      phone: editPhone,
      division: editDivision,
      area: editArea,
      address: editAddress,
    });
    if (res.success) {
      setIsEditingAddress(false);
      setEditSuccessMsg("Delivery details updated successfully.");
      setTimeout(() => setEditSuccessMsg(""), 3000);
    }
  };

  const handleSingleOrderLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setSingleOrderLoading(true);
    setSingleOrderError("");

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setSingleOrder(data.order);
      } else {
        setSingleOrder(null);
        setSingleOrderError("No order found matching this reference or phone number.");
      }
    } catch {
      setSingleOrderError("Network error while querying order status.");
    } finally {
      setSingleOrderLoading(false);
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "Order Confirmed":
        return {
          label: "Confirmed",
          bg: "bg-blue-100 text-blue-900 border-blue-300",
        };
      case "In Atelier Prep":
        return {
          label: "In Prep",
          bg: "bg-purple-100 text-purple-900 border-purple-300",
        };
      case "Dispatched via Courier":
        return {
          label: "Dispatched",
          bg: "bg-amber-100 text-amber-950 border-amber-400",
        };
      case "Delivered":
        return {
          label: "Delivered",
          bg: "bg-emerald-100 text-emerald-950 border-emerald-400",
        };
      case "Cancelled":
        return {
          label: "Cancelled",
          bg: "bg-rose-100 text-rose-950 border-rose-300",
        };
      default:
        return {
          label: status || "Pending",
          bg: "bg-neutral-100 text-neutral-800 border-neutral-300",
        };
    }
  };

  const getStepActive = (status: string, step: string) => {
    const stages = [
      "Order Confirmed",
      "In Atelier Prep",
      "Dispatched via Courier",
      "Delivered",
    ];
    const currentIndex = stages.indexOf(status);
    const stepIndex = stages.indexOf(step);
    return stepIndex <= currentIndex;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-36 pb-24 bg-white text-black flex items-center justify-center">
        <div className="text-xs font-mono tracking-widest uppercase text-black/50 animate-pulse">
          AUTHENTICATING ATELIER PORTAL...
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LOGGED IN USER DASHBOARD
  // -------------------------------------------------------------
  if (user) {
    return (
      <div className="min-h-screen pt-28 sm:pt-36 pb-24 bg-[#F4F3ED] text-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/10">
            <div>
              <div className="inline-flex items-center gap-2 text-[10px] font-mono font-bold tracking-widest text-black/60 uppercase mb-1">
                <Sparkles className="w-3 h-3 text-[#C5A059]" />
                <span>LIFAZ ATELIER // {user.vipTier || "VIP MEMBER"}</span>
              </div>
              <h1 className="font-sans font-black text-2xl sm:text-4xl uppercase tracking-tight text-black">
                Welcome, {user.name}
              </h1>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 border border-black/20 hover:border-black text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer bg-white"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          {editSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{editSuccessMsg}</span>
            </div>
          )}

          {/* 2-Column Grid: Profile / Saved Shipping & Order History */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Saved Profile & Delivery Details */}
            <div className="lg:col-span-4 bg-white p-6 sm:p-8 border border-black/10 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-black flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Default Delivery Info</span>
                </h3>
                <button
                  onClick={() => setIsEditingAddress(!isEditingAddress)}
                  className="text-xs text-black/60 hover:text-black font-mono underline cursor-pointer"
                >
                  {isEditingAddress ? "Cancel" : "Edit"}
                </button>
              </div>

              {isEditingAddress ? (
                <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-black/60 font-bold">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-black/20 focus:border-black bg-[#F9F9F9]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-black/60 font-bold">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-black/20 focus:border-black bg-[#F9F9F9]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-black/60 font-bold">
                        Division
                      </label>
                      <select
                        value={editDivision}
                        onChange={(e) => setEditDivision(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 focus:border-black bg-[#F9F9F9]"
                      >
                        {DIVISIONS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-black/60 font-bold">
                        Thana / Area
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Gulshan, Dhanmondi"
                        value={editArea}
                        onChange={(e) => setEditArea(e.target.value)}
                        className="w-full px-3 py-2 border border-black/20 focus:border-black bg-[#F9F9F9]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-black/60 font-bold">
                      Delivery Address
                    </label>
                    <textarea
                      rows={2}
                      placeholder="House, Road, Block/Sector"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-black/20 focus:border-black bg-[#F9F9F9]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-black/85 cursor-pointer transition-colors"
                  >
                    Save Address
                  </button>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-black/50 uppercase block">Client Name</span>
                    <span className="font-bold text-black">{user.name}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-black/50 uppercase block">Email Address</span>
                    <span className="font-mono text-black">{user.email}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-black/50 uppercase block">Contact Phone</span>
                    <span className="font-mono text-black">{user.phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-black/50 uppercase block">Saved Delivery Address</span>
                    {user.address ? (
                      <p className="text-black/80 font-mono mt-0.5 leading-relaxed">
                        {user.address}, {user.area}, {user.division}
                      </p>
                    ) : (
                      <span className="text-black/40 italic">No saved delivery address yet.</span>
                    )}
                  </div>

                  <div className="pt-2 border-t border-black/10 text-[11px] text-black/60 font-mono">
                    ✓ This info is automatically applied at checkout for fast 1-click orders.
                  </div>
                </div>
              )}
            </div>

            {/* Right: Order History & Dispatch Milestones */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-5 sm:p-6 border border-black/10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#C5A059]" />
                    <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-black">
                      Your Orders & Dispatches ({userOrders.length})
                    </h3>
                  </div>
                  <button
                    onClick={() => fetchUserOrders(user.id)}
                    className="text-[11px] text-black/60 hover:text-black font-mono underline cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>

                {ordersLoading ? (
                  <div className="py-10 text-center text-xs font-mono text-black/50 animate-pulse">
                    FETCHING ATELIER ORDERS...
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="py-10 text-center space-y-3 bg-[#F9F9F9] border border-dashed border-black/15 p-6">
                    <ShoppingBag className="w-8 h-8 text-black/30 mx-auto" />
                    <h4 className="font-bold text-xs uppercase text-black">NO ORDERS ON RECORD</h4>
                    <p className="text-xs text-black/60 max-w-sm mx-auto">
                      You have not placed any orders yet. Discover our latest seasonal capsules in the collection archive.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/collections/all"
                        className="inline-block px-5 py-2 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-black/85 transition-colors"
                      >
                        Explore Archive
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {userOrders.map((ord) => {
                      const stages = [
                        "Order Confirmed",
                        "In Atelier Prep",
                        "Dispatched via Courier",
                        "Delivered",
                      ];
                      const stageIndex = stages.indexOf(ord.status);

                      return (
                        <div
                          key={ord.id}
                          className="p-3.5 sm:p-4 bg-[#FAF9F5] border border-black/10 hover:border-black/25 transition-all text-xs font-mono space-y-2.5 rounded-xs"
                        >
                          {/* Row 1: Order ID • Date • Total Price • Status Chips */}
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-black/10">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="font-bold text-black uppercase tracking-tight text-xs">
                                {ord.orderNumber || ord.id}
                              </strong>
                              <span className="text-black/30">•</span>
                              <span className="text-[11px] text-black/60">{ord.date}</span>
                              <span className="text-black/30">•</span>
                              <span className="font-bold text-black text-xs">{formatPrice(ord.total)}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Payment Status Pill */}
                              {ord.paymentStatus && (
                                <span
                                  className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border rounded-xs ${
                                    ord.paymentStatus === "Payment Verified"
                                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                                      : ord.paymentStatus === "COD Due"
                                      ? "bg-amber-100 text-amber-900 border-amber-300"
                                      : "bg-orange-100 text-orange-900 border-orange-300"
                                  }`}
                                >
                                  {ord.paymentStatus}
                                </span>
                              )}
                              {/* Dispatch Stage Badge */}
                              {(() => {
                                const stBadge = getOrderStatusBadge(ord.status);
                                return (
                                  <span
                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-xs ${stBadge.bg}`}
                                  >
                                    {stBadge.label}
                                  </span>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Minimal Progress Track (Slim 2px Line) */}
                          <div className="py-1 px-1">
                            <div className="flex items-center justify-between relative">
                              {/* Background Line */}
                              <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/10 z-0" />
                              {/* Active Filled Line */}
                              <div
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-black z-0 transition-all duration-300"
                                style={{
                                  width: `${Math.max(0, Math.min(100, (stageIndex / 3) * 100))}%`,
                                }}
                              />

                              {[
                                { label: "Confirmed", stage: "Order Confirmed" },
                                { label: "In Prep", stage: "In Atelier Prep" },
                                { label: "Dispatched", stage: "Dispatched via Courier" },
                                { label: "Delivered", stage: "Delivered" },
                              ].map((step, idx) => {
                                const isCompleted = idx <= stageIndex;
                                return (
                                  <div key={step.stage} className="relative z-10 flex flex-col items-center">
                                    <div
                                      className={`w-2 h-2 rounded-full border transition-all ${
                                        isCompleted
                                          ? "bg-black border-black ring-2 ring-white"
                                          : "bg-white border-black/30"
                                      }`}
                                    />
                                    <span
                                      className={`text-[8px] uppercase tracking-wider mt-1 select-none ${
                                        isCompleted ? "text-black font-bold" : "text-black/40"
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Row 3: Items & Logistics Breakdown */}
                          <div className="pt-1.5 border-t border-black/5 text-[11px] text-black/80 space-y-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-black line-clamp-1">{ord.items}</span>
                              {ord.dueAmount !== undefined && ord.dueAmount > 0 && (
                                <span className="shrink-0 text-black font-bold text-[11px] bg-black/5 px-1.5 py-0.2 border border-black/10">
                                  Due: {formatPrice(ord.dueAmount)}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-black/60">
                              <span className="truncate max-w-sm">
                                📍 {ord.area}, {ord.division} • {ord.paymentMethod}
                                {(ord.bkashTrxId || ord.paymentReference) &&
                                  ` (TrxID: ${ord.bkashTrxId || ord.paymentReference})`}
                              </span>
                              {ord.advancePaid !== undefined && ord.advancePaid > 0 && (
                                <span className="text-emerald-700 font-bold">
                                  ✓ Advance Paid: {formatPrice(ord.advancePaid)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Verification Notice if Pending */}
                          {ord.paymentStatus === "Pending Verification" && (
                            <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-900 flex items-center justify-between gap-2">
                              <span>Matching TrxID ({ord.bkashTrxId || ord.paymentReference || "Submitted"})</span>
                              <Link
                                href="/pages/contact"
                                className="px-2 py-0.5 bg-black text-white text-[9px] uppercase font-bold tracking-wider hover:bg-neutral-800"
                              >
                                Concierge
                              </Link>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: UNAUTHENTICATED (SIGN UP / LOG IN / GUEST TRACKER)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-24 bg-[#F4F3ED] text-black">
      <div className="max-w-xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-white text-[10px] font-mono font-bold tracking-widest uppercase mb-1">
            <UserIcon className="w-3 h-3" />
            <span>CLIENT VIP PORTAL</span>
          </div>
          <h1 className="font-sans font-black text-3xl sm:text-4xl uppercase tracking-tight text-black">
            {authMode === "login" ? "CLIENT SIGN IN" : "CREATE VIP ACCOUNT"}
          </h1>
          <p className="text-xs text-black/60 leading-relaxed">
            {authMode === "login"
              ? "Sign in to access your stored delivery addresses, past atelier orders, and VIP drop access."
              : "Register to save your delivery preferences for fast courier checkout and exclusive early capsule releases."}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex border-b border-black/15">
          <button
            onClick={() => {
              setAuthMode("login");
              setAuthError("");
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px ${
              authMode === "login"
                ? "border-black text-black"
                : "border-transparent text-black/40 hover:text-black"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => {
              setAuthMode("signup");
              setAuthError("");
            }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 -mb-px ${
              authMode === "signup"
                ? "border-black text-black"
                : "border-transparent text-black/40 hover:text-black"
            }`}
          >
            Create Account
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-700 font-mono">
            {authError}
          </div>
        )}

        {/* Login Form */}
        {authMode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="bg-white p-6 sm:p-8 border border-black/10 space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">
                Email or Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. client@example.com or 017XXXXXXXX"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                required
                className="w-full px-4 py-3 text-xs text-black font-mono bg-[#F9F9F9] border border-black/20 focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-xs text-black font-mono bg-[#F9F9F9] border border-black/20 focus:border-black focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {authLoading ? "AUTHENTICATING..." : "SIGN IN TO ATELIER"}
            </button>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSignupSubmit} className="bg-white p-6 sm:p-8 border border-black/10 space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Anika Rahman"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                required
                className="w-full px-4 py-2.5 text-xs text-black bg-[#F9F9F9] border border-black/20 focus:border-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="anika@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs text-black font-mono bg-[#F9F9F9] border border-black/20 focus:border-black focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">
                  Phone Number (For Courier) *
                </label>
                <input
                  type="tel"
                  placeholder="017XXXXXXXX"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 text-xs text-black font-mono bg-[#F9F9F9] border border-black/20 focus:border-black focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-black/70">
                Create Password *
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2.5 text-xs text-black font-mono bg-[#F9F9F9] border border-black/20 focus:border-black focus:outline-none"
              />
            </div>

            {/* Default Shipping Address */}
            <div className="pt-2 border-t border-black/10 space-y-3">
              <span className="text-[10px] font-mono uppercase text-black/50 block font-bold">
                Default Shipping Info (Optional - Can update anytime)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-black/60">Division</label>
                  <select
                    value={signupDivision}
                    onChange={(e) => setSignupDivision(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20 focus:border-black text-xs"
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-black/60">Thana / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Banani, Uttara"
                    value={signupArea}
                    onChange={(e) => setSignupArea(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20 focus:border-black text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-black/60">Street Address</label>
                <textarea
                  rows={2}
                  placeholder="House, Road, Apartment Details"
                  value={signupAddress}
                  onChange={(e) => setSignupAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20 focus:border-black text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 mt-2"
            >
              {authLoading ? "CREATING ACCOUNT..." : "REGISTER VIP ACCOUNT"}
            </button>
          </form>
        )}

        {/* Guest Single Order Tracker */}
        <div className="bg-white p-6 sm:p-8 border border-black/10 space-y-4">
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-black">
              Quick Guest Order Tracker
            </h3>
            <p className="text-[11px] text-black/60 font-mono">
              Track an individual order without logging in.
            </p>
          </div>

          <form onSubmit={handleSingleOrderLookup} className="flex border border-black/30 focus-within:border-black">
            <input
              type="text"
              placeholder="e.g. LIFAZ-BD-XXXXXX or Phone Number"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value)}
              className="w-full px-4 py-3 text-xs text-black font-mono bg-transparent focus:outline-none placeholder:text-black/30"
            />
            <button
              type="submit"
              disabled={singleOrderLoading}
              className="px-6 bg-black text-white text-xs font-bold tracking-wider uppercase hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {singleOrderLoading ? "TRACKING..." : "TRACK"}
            </button>
          </form>

          {singleOrderError && (
            <div className="p-3 bg-red-50 border border-red-300 text-xs text-red-700 font-mono">
              {singleOrderError}
            </div>
          )}

          {singleOrder && (
            <div className="p-4 bg-[#F9F9F9] border border-black/10 text-xs space-y-2 font-mono">
              <div className="flex justify-between items-center font-bold text-black pb-1.5 border-b border-black/10">
                <span>{singleOrder.orderNumber || singleOrder.id}</span>
                {(() => {
                  const stBadge = getOrderStatusBadge(singleOrder.status);
                  return (
                    <span
                      className={`px-2 py-0.5 text-[9px] font-bold uppercase border rounded-xs ${stBadge.bg}`}
                    >
                      {stBadge.label}
                    </span>
                  );
                })()}
              </div>
              <div className="flex justify-between text-black/70 text-[11px]">
                <span>Customer: {singleOrder.customer}</span>
                <span>{formatPrice(singleOrder.total)}</span>
              </div>
              <div className="flex justify-between text-black/70 text-[11px] pt-1 border-t border-black/5">
                <span>Payment: {singleOrder.paymentMethod}</span>
                {singleOrder.paymentStatus && (
                  <span className="font-semibold text-black">{singleOrder.paymentStatus}</span>
                )}
              </div>
              {(singleOrder.advancePaid !== undefined || singleOrder.dueAmount !== undefined) && (
                <div className="flex justify-between text-black/80 text-[11px] font-mono">
                  {singleOrder.advancePaid !== undefined && singleOrder.advancePaid > 0 && (
                    <span>Advance: <strong className="text-emerald-700">{formatPrice(singleOrder.advancePaid)}</strong></span>
                  )}
                  {singleOrder.dueAmount !== undefined && (
                    <span>Due: <strong className="text-black">{formatPrice(singleOrder.dueAmount)}</strong></span>
                  )}
                </div>
              )}
              {(singleOrder.bkashTrxId || singleOrder.paymentReference) && (
                <div className="text-[10px] text-black/60">
                  TrxID: {singleOrder.bkashTrxId || singleOrder.paymentReference}
                </div>
              )}
              <p className="text-[11px] text-black/60 pt-1">{singleOrder.items}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
