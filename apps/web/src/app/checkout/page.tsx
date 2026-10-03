"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Copy,
  Check,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/currency";
import { PaymentMethodConfig } from "@/lib/types";

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

const FALLBACK_ONLINE_GATEWAYS: PaymentMethodConfig[] = [
  {
    id: "pay_bkash",
    name: "bKash Mobile Banking",
    type: "mfs",
    provider: "bkash",
    accountNumber: "01711-000000",
    accountType: "Merchant",
    instructions: "Send Money / Payment to our official bKash Merchant Wallet. Enter your Phone Number as reference and submit the 8-digit Transaction ID (TrxID) below.",
    requiresTrxId: true,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: "pay_nagad",
    name: "Nagad Mobile Banking",
    type: "mfs",
    provider: "nagad",
    accountNumber: "01711-000000",
    accountType: "Merchant",
    instructions: "Send Money / Payment to our official Nagad Merchant Wallet. Enter your Phone Number as reference and submit the 8-digit Transaction ID (TrxID) below.",
    requiresTrxId: true,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: "pay_rocket",
    name: "Rocket (DBBL)",
    type: "mfs",
    provider: "rocket",
    accountNumber: "01711-000000-8",
    accountType: "Personal",
    instructions: "Send Money to our official Rocket number with your Phone Number as reference.",
    requiresTrxId: true,
    isActive: true,
    displayOrder: 3,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();

  // Form states prefilled from logged in user if present
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [division, setDivision] = useState(user?.division || "Dhaka");
  const [area, setArea] = useState(user?.area || "");
  const [address, setAddress] = useState(user?.address || "");

  // Update form fields when user loads
  React.useEffect(() => {
    if (user) {
      if (!name && user.name) setName(user.name);
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (user.division) setDivision(user.division);
      if (!area && user.area) setArea(user.area);
      if (!address && user.address) setAddress(user.address);
    }
  }, [user]);

  const [deliveryMethod, setDeliveryMethod] = useState<"inside-dhaka" | "outside-dhaka">(
    division === "Dhaka" ? "inside-dhaka" : "outside-dhaka"
  );

  // Dynamic Payment Methods & Settlement Structure
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(FALLBACK_ONLINE_GATEWAYS);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("pay_bkash");
  const [paymentType, setPaymentType] = useState<"advance_delivery_cod" | "full_advance" | "full_cod">("advance_delivery_cod");
  const [trxId, setTrxId] = useState("");
  const [copiedNumber, setCopiedNumber] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);

  // Fetch active payment methods from server
  React.useEffect(() => {
    async function loadPaymentMethods() {
      try {
        const res = await fetch("/api/settings/payment-methods");
        const data = await res.json();
        if (res.ok && Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
          setPaymentMethods(data.paymentMethods);
          const activeOnline = data.paymentMethods.filter(
            (m: PaymentMethodConfig) => m.isActive && m.provider !== "cod" && m.type !== "cod"
          );
          if (activeOnline.length > 0) {
            const bkash = activeOnline.find((m: PaymentMethodConfig) => m.provider === "bkash");
            setSelectedMethodId(bkash ? bkash.id : activeOnline[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to load payment methods", err);
      }
    }
    loadPaymentMethods();
  }, []);

  // Filter online gateways for advance / full online settlement (excluding standalone COD from the MFS list)
  const activeOnlineGateways = paymentMethods.filter(
    (m) => m.isActive && m.provider !== "cod" && m.type !== "cod"
  );
  const displayGateways =
    activeOnlineGateways.length > 0 ? activeOnlineGateways : FALLBACK_ONLINE_GATEWAYS;

  // Ensure an online method is selected when switching to advance or full online payment
  React.useEffect(() => {
    if (paymentType !== "full_cod" && displayGateways.length > 0) {
      const currentValid = displayGateways.some((m) => m.id === selectedMethodId);
      if (!currentValid) {
        const bkash = displayGateways.find((m) => m.provider === "bkash");
        setSelectedMethodId(bkash ? bkash.id : displayGateways[0].id);
      }
    }
  }, [paymentType, displayGateways, selectedMethodId]);

  // Automatically adjust delivery method when division changes
  React.useEffect(() => {
    if (division !== "Dhaka") {
      setDeliveryMethod("outside-dhaka");
    } else {
      setDeliveryMethod("inside-dhaka");
    }
  }, [division]);

  const isInsideDhaka = division === "Dhaka" && deliveryMethod === "inside-dhaka";

  // Automatically enforce Outside Dhaka advance delivery charge rule if user had full_cod selected
  React.useEffect(() => {
    if (!isInsideDhaka && paymentType === "full_cod") {
      setPaymentType("advance_delivery_cod");
    }
  }, [isInsideDhaka, paymentType]);

  // Calculate Shipping Cost and Advance / Due breakdown
  const shippingCost = isInsideDhaka ? 60 : 130;
  const grandTotal = subtotal + shippingCost;

  const advancePayable =
    paymentType === "advance_delivery_cod"
      ? shippingCost
      : paymentType === "full_advance"
      ? grandTotal
      : 0;

  const dueOnDelivery =
    paymentType === "advance_delivery_cod"
      ? subtotal
      : paymentType === "full_advance"
      ? 0
      : grandTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!name || !phone || !address || !area) {
      setError("Please fill in all mandatory delivery details.");
      return;
    }

    const selectedMethod = paymentType === "full_cod"
      ? { name: "Cash on Delivery (COD)", id: "cod", requiresTrxId: false }
      : displayGateways.find((m) => m.id === selectedMethodId) || displayGateways[0];

    const methodName = selectedMethod
      ? selectedMethod.name
      : paymentType === "full_cod"
      ? "Cash on Delivery (COD)"
      : "bKash Mobile Banking";

    const requiresTrx = paymentType !== "full_cod" && (selectedMethod?.requiresTrxId ?? true);

    if (requiresTrx && !trxId.trim()) {
      setError(
        paymentType === "advance_delivery_cod"
          ? `Please enter the ${methodName} Transaction ID (TrxID) for the ৳${advancePayable} advance delivery charge.`
          : `Please enter the ${methodName} Transaction ID (TrxID) for full payment verification.`
      );
      return;
    }

    const paymentStatus =
      paymentType === "advance_delivery_cod"
        ? "Advance Delivery Fee Paid (Pending TrxID)"
        : paymentType === "full_advance"
        ? "Full Payment Paid (Pending TrxID)"
        : "COD Due";

    setLoading(true);
    setError("");

    try {
      const orderData = {
        userId: user?.id,
        customer: name,
        email: email || `${phone.replace(/\D/g, "")}@customer.lifaz.shop`,
        phone,
        division,
        area,
        address,
        items: items
          .map((i) => `${i.title} (${i.size}) x${i.quantity}`)
          .join(", "),
        lineItems: items,
        subtotal,
        shippingCost,
        total: grandTotal,
        paymentType,
        advancePaid: advancePayable,
        dueAmount: dueOnDelivery,
        paymentMethod: methodName,
        paymentMethodId: selectedMethod?.id,
        paymentStatus,
        bkashTrxId: paymentType === "full_cod" ? undefined : (trxId.trim() || undefined),
        paymentReference: paymentType === "full_cod" ? undefined : (trxId.trim() || undefined),
        status: "Order Confirmed",
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (res.ok && data.order) {
        setCompletedOrder(data.order);
        clearCart();
      } else {
        setError(data.error || "Order placement failed. Please try again.");
      }
    } catch {
      setError("Network communication error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getProviderIcon = (provider: PaymentMethodConfig["provider"]) => {
    switch (provider) {
      case "bkash":
      case "nagad":
      case "rocket":
      case "upay":
        return Smartphone;
      case "cod":
        return Banknote;
      case "card":
        return CreditCard;
      case "bank":
        return Building2;
      default:
        return CreditCard;
    }
  };

  // If order completed, render confirmation view
  if (completedOrder) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[#F4F3ED] flex items-center justify-center">
        <div className="max-w-xl w-full mx-auto px-4">
          <div className="bg-white p-8 sm:p-12 border border-black/10 rounded-xs shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] tracking-monumental text-black/50 uppercase block mb-1">
                Atelier Order Registered
              </span>
              <h2 className="font-editorial-serif text-3xl uppercase tracking-wider text-black">
                Order Confirmed
              </h2>
              <p className="text-xs text-black/60 mt-2">
                Thank you for your acquisition. Our Dhaka atelier team is preparing your garments.
              </p>
            </div>

            <div className="p-4 bg-[#F4F3ED] border border-black/10 rounded-xs text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-black/60">Order Reference:</span>
                <span className="font-mono font-bold text-black">
                  {completedOrder.id || completedOrder.orderNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Customer:</span>
                <span className="font-medium text-black">{completedOrder.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/60">Payment Method:</span>
                <span className="font-medium text-black">{completedOrder.paymentMethod}</span>
              </div>
              {completedOrder.paymentStatus && (
                <div className="flex justify-between">
                  <span className="text-black/60">Payment Status:</span>
                  <span className="font-mono font-bold text-black">
                    {completedOrder.paymentStatus}
                  </span>
                </div>
              )}
              {(completedOrder.bkashTrxId || completedOrder.paymentReference) && (
                <div className="flex justify-between">
                  <span className="text-black/60">Transaction Reference:</span>
                  <span className="font-mono font-bold text-black">
                    {completedOrder.bkashTrxId || completedOrder.paymentReference}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-black/10">
                <span className="font-semibold text-black">Total Paid / Due:</span>
                <span className="font-mono font-bold text-base text-black">
                  {formatPrice(completedOrder.total)}
                </span>
              </div>
            </div>

            {completedOrder.paymentStatus === "Pending Verification" && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xs text-[11px] font-mono text-amber-900 text-left leading-relaxed">
                <strong>Verification in Progress:</strong> Our Dhaka atelier desk is verifying your TrxID ({completedOrder.bkashTrxId || completedOrder.paymentReference || "Submitted"}). You will receive updates via SMS/Email.
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link
                href="/account"
                className="flex-1 py-3.5 bg-[#0A0A0A] text-[#F4F3ED] text-xs font-medium tracking-monumental uppercase hover:bg-black/80 transition-colors"
              >
                Track Order Status
              </Link>
              <Link
                href="/collections/all"
                className="flex-1 py-3.5 border border-black text-black text-xs font-medium tracking-monumental uppercase hover:bg-black hover:text-white transition-colors"
              >
                Back to Archive
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#F4F3ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <span className="text-[10px] tracking-monumental text-black/50 uppercase block mb-1">
            Insured 64-District Courier
          </span>
          <h1 className="font-editorial-serif text-3xl sm:text-4xl uppercase tracking-wide text-black">
            Atelier Checkout
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center bg-[#EFECE6] border border-black/10 rounded-xs p-8 max-w-xl mx-auto">
            <ShoppingBag className="w-10 h-10 text-black/40 mx-auto mb-4" />
            <h3 className="font-editorial-serif text-xl uppercase tracking-wider mb-2">
              No Pieces in Bag
            </h3>
            <p className="text-xs text-black/60 mb-6">
              Please add garments to your bag before proceeding to checkout.
            </p>
            <Link
              href="/collections/all"
              className="px-8 py-3.5 bg-[#0A0A0A] text-[#F4F3ED] text-xs font-medium tracking-monumental uppercase hover:bg-black/80 transition-colors"
            >
              Explore Ready-To-Wear
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Client Information & Address Form */}
            <div className="lg:col-span-7 space-y-8">
              {user ? (
                <div className="p-4 bg-white border border-black/15 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-black" />
                    <div>
                      <span className="font-bold uppercase tracking-wider text-black block">
                        VIP Express Checkout: {user.name}
                      </span>
                      <span className="text-[11px] font-mono text-black/60">
                        {user.email} • Saved details automatically populated
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    className="text-[11px] font-mono text-black/70 hover:text-black underline"
                  >
                    Edit Profile
                  </Link>
                </div>
              ) : (
                <div className="p-4 bg-black/5 border border-black/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold uppercase tracking-wider text-black block">
                      Have a LIFAZ VIP Account?
                    </span>
                    <span className="text-[11px] text-black/60">
                      Sign in for saved delivery addresses & order history tracking.
                    </span>
                  </div>
                  <Link
                    href="/account"
                    className="px-3 py-1.5 bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}

              {/* Section 1: Contact Information */}
              <div className="bg-white p-6 sm:p-8 rounded-xs border border-black/10 space-y-4">
                <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black pb-3 border-b border-black/10">
                  1. Recipient Contact
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nafis Rahman"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                      Phone Number (64 Districts) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+880 17XX-XXXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                      VIP Dispatch Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Matrix */}
              <div className="bg-white p-6 sm:p-8 rounded-xs border border-black/10 space-y-4">
                <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black pb-3 border-b border-black/10">
                  2. Delivery Address (64-District Courier)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                      Division *
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                    >
                      {DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} Division
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                      Area / District / Thana *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gulshan-2 / Dhanmondi / Agrabad"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                      Street Address & Apartment Details *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="House, Road, Block, Sector, Landmark instructions"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="pt-4 space-y-2">
                  <span className="text-[10px] font-medium tracking-monumental uppercase text-black/70 block">
                    Courier Tier
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("inside-dhaka")}
                      className={`p-3.5 text-left border rounded-xs transition-colors cursor-pointer ${
                        deliveryMethod === "inside-dhaka" && division === "Dhaka"
                          ? "border-black bg-black text-white"
                          : "border-black/15 bg-[#F4F3ED] text-black"
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider">Inside Dhaka</div>
                      <div className="text-[11px] opacity-80 mt-0.5">1–3 Days // ৳60</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryMethod("outside-dhaka")}
                      className={`p-3.5 text-left border rounded-xs transition-colors cursor-pointer ${
                        deliveryMethod === "outside-dhaka" || division !== "Dhaka"
                          ? "border-black bg-black text-white"
                          : "border-black/15 bg-[#F4F3ED] text-black"
                      }`}
                    >
                      <div className="text-xs font-bold uppercase tracking-wider">Outside Dhaka</div>
                      <div className="text-[11px] opacity-80 mt-0.5">All Over Bangladesh // 2–3 Days // ৳130</div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Payment Options & Settlement Structure */}
              <div className="bg-white p-6 sm:p-8 rounded-xs border border-black/10 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-black/10">
                  <div>
                    <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black">
                      3. Settlement & Payment Structure
                    </h3>
                    <p className="text-[11px] text-black/60 font-mono mt-0.5">
                      {isInsideDhaka
                        ? "Inside Dhaka: Choose Full COD, Advance Delivery Fee + COD, or Full Online Payment."
                        : "Outside Dhaka: Advance Delivery Fee (৳130) or Full Online Payment required to confirm order."}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-black/5 text-black/70 border border-black/10 uppercase font-bold hidden sm:inline">
                    {isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka (64 Districts)"}
                  </span>
                </div>

                {/* Outside Dhaka Requirement Notice */}
                {!isInsideDhaka && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xs text-xs font-mono text-black space-y-1">
                    <div className="font-bold text-amber-900 uppercase text-[10px] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Outside Dhaka Dispatch Confirmation Policy</span>
                    </div>
                    <p className="text-[11px] text-black/80 leading-relaxed">
                      For orders outside Dhaka, the courier delivery charge of <strong>৳130</strong> (or the full order amount) must be paid in advance via bKash/Nagad to confirm parcel dispatch. Full COD with ৳0 advance is available exclusively within Dhaka.
                    </p>
                  </div>
                )}

                {/* Settlement Type Selector Grid */}
                <div className={`grid grid-cols-1 ${isInsideDhaka ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3`}>
                  {/* Inside Dhaka Only: 100% Full Cash on Delivery */}
                  {isInsideDhaka && (
                    <div
                      onClick={() => setPaymentType("full_cod")}
                      className={`p-3.5 border rounded-xs cursor-pointer transition-all flex flex-col justify-between ${
                        paymentType === "full_cod"
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-black/15 bg-[#F4F3ED] text-black hover:border-black/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Full COD
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-700 text-white font-bold uppercase">
                            Inside Dhaka
                          </span>
                        </div>
                        <div className="text-[11px] opacity-90 mt-1 leading-relaxed">
                          Pay <strong>৳0 now</strong>. Settle full <strong>{formatPrice(grandTotal)}</strong> in cash upon doorstep delivery.
                        </div>
                      </div>
                      <div className="text-[10px] font-mono opacity-70 mt-2 pt-2 border-t border-white/10">
                        ✓ Zero advance fee
                      </div>
                    </div>
                  )}

                  {/* Option: Advance Delivery Charge + Rest COD (Available for Both) */}
                  <div
                    onClick={() => setPaymentType("advance_delivery_cod")}
                    className={`p-3.5 border rounded-xs cursor-pointer transition-all flex flex-col justify-between ${
                      paymentType === "advance_delivery_cod"
                        ? "border-black bg-black text-white shadow-xs"
                        : "border-black/15 bg-[#F4F3ED] text-black hover:border-black/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Advance Delivery Fee + COD
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#C5A059] text-black font-bold uppercase">
                          {isInsideDhaka ? "Recommended" : "Required for COD"}
                        </span>
                      </div>
                      <div className="text-[11px] opacity-90 mt-1 leading-relaxed">
                        Pay <strong>৳{shippingCost}</strong> courier fee in advance via bKash/Nagad. Pay <strong>{formatPrice(subtotal)}</strong> on doorstep delivery.
                      </div>
                    </div>
                    <div className="text-[10px] font-mono opacity-70 mt-2 pt-2 border-t border-white/10">
                      ✓ Instant parcel booking
                    </div>
                  </div>

                  {/* Option: 100% Full Payment Online (Available for Both) */}
                  <div
                    onClick={() => setPaymentType("full_advance")}
                    className={`p-3.5 border rounded-xs cursor-pointer transition-all flex flex-col justify-between ${
                      paymentType === "full_advance"
                        ? "border-black bg-black text-white shadow-xs"
                        : "border-black/15 bg-[#F4F3ED] text-black hover:border-black/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider">
                          100% Full Advance
                        </span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 bg-black/10 text-current border border-current/20 font-bold uppercase">
                          Online
                        </span>
                      </div>
                      <div className="text-[11px] opacity-90 mt-1 leading-relaxed">
                        Pay full <strong>{formatPrice(grandTotal)}</strong> online. Zero cash due upon doorstep delivery.
                      </div>
                    </div>
                    <div className="text-[10px] font-mono opacity-70 mt-2 pt-2 border-t border-white/10">
                      ✓ Direct VIP dispatch
                    </div>
                  </div>
                </div>

                {/* Explanatory Banner for Advance Delivery Charge */}
                {paymentType === "advance_delivery_cod" && (
                  <div className="p-3 bg-[#C5A059]/10 border border-[#C5A059]/30 rounded-xs text-xs font-mono text-black space-y-1">
                    <div className="font-bold text-[#8c6b2d] uppercase text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Order Confirmation Step</span>
                    </div>
                    <p className="text-[11px] text-black/80 leading-relaxed">
                      To confirm your parcel booking, please send the courier fee of <strong>৳{shippingCost}</strong> ({isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"}) via your chosen Mobile Wallet below. Your order will be confirmed immediately once the TrxID is submitted.
                    </p>
                  </div>
                )}

                {/* Payment Gateway or COD Section */}
                {paymentType === "full_cod" ? (
                  <div className="p-4 bg-[#F4F3ED] border border-black/15 rounded-xs space-y-2">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#C5A059]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-black">
                        Doorstep Cash on Delivery (Inside Dhaka)
                      </span>
                    </div>
                    <p className="text-[11px] text-black/70 font-mono leading-relaxed">
                      No online transaction required right now. Please keep <strong>{formatPrice(grandTotal)}</strong> in cash ready when our delivery rider arrives at your Dhaka address.
                    </p>
                    <div className="pt-2 text-[10px] font-mono text-black/50 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct order confirmation • 100% Cash collected at doorstep</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-black/60 block font-bold">
                        Select Payment Gateway:
                      </span>
                      <span className="text-[10px] font-mono text-[#8c6b2d] font-bold bg-[#C5A059]/15 px-2 py-0.5 border border-[#C5A059]/30">
                        {paymentType === "advance_delivery_cod"
                          ? `Pay Advance Courier Fee: ৳${shippingCost}`
                          : `Pay Full Amount: ${formatPrice(grandTotal)}`}
                      </span>
                    </div>

                    {displayGateways.length === 0 ? (
                      <div className="p-4 bg-[#F4F3ED] text-xs font-mono text-black/60 text-center">
                        Loading available payment channels...
                      </div>
                    ) : (
                      displayGateways.map((method) => {
                        const Icon = getProviderIcon(method.provider);
                        const isSelected = selectedMethodId === method.id;

                        return (
                          <div
                            key={method.id}
                            className={`border rounded-xs transition-all cursor-pointer ${
                              isSelected
                                ? "border-black bg-white shadow-xs"
                                : "border-black/15 bg-white hover:bg-black/[0.02]"
                            }`}
                            onClick={() => setSelectedMethodId(method.id)}
                          >
                            <label className="flex items-start gap-3.5 p-4 cursor-pointer">
                              <input
                                type="radio"
                                name="paymentMethod"
                                checked={isSelected}
                                onChange={() => setSelectedMethodId(method.id)}
                                className="accent-black mt-1"
                              />
                              <div className="w-8 h-8 rounded-xs bg-[#F4F3ED] border border-black/10 flex items-center justify-center shrink-0 text-[#C5A059] mt-0.5">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold uppercase tracking-wider text-black">
                                    {method.name}
                                  </span>
                                  {method.accountType && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black/5 text-black/70 border border-black/10 uppercase font-bold">
                                      {method.accountType}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-black/40 uppercase">
                                    {paymentType === "advance_delivery_cod"
                                      ? `• Send ৳${shippingCost}`
                                      : `• Send ${formatPrice(grandTotal)}`}
                                  </span>
                                </div>
                                {method.instructions && (
                                  <div className="text-[11px] text-black/60 mt-0.5 leading-relaxed">
                                    {method.instructions}
                                  </div>
                                )}
                              </div>
                            </label>

                            {/* Expanded Details when selected */}
                            {isSelected && (method.accountNumber || method.requiresTrxId) && (
                              <div className="px-4 pb-4 pt-1 ml-11 border-t border-black/10 space-y-3 text-xs">
                                {method.accountNumber && (
                                  <div className="p-3 bg-[#F4F3ED] border border-black/10 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-[11px]">
                                    <div>
                                      <span className="text-black/60 uppercase block text-[10px]">
                                        {method.accountType || "Official"} {method.name} Number:
                                      </span>
                                      <span className="font-bold text-black text-sm select-all">
                                        {method.accountNumber}
                                      </span>
                                      <div className="text-[10px] text-black/70 mt-1 space-y-0.5">
                                        <div>
                                          Exact amount to transfer: <strong className="text-black bg-white px-1 border border-black/20">{formatPrice(advancePayable)}</strong>
                                        </div>
                                        <div>
                                          Reference: <strong className="text-black">{phone || "Your Phone Number"}</strong>
                                        </div>
                                        {paymentType === "advance_delivery_cod" && (
                                          <div className="text-black/60">
                                            Remaining due on doorstep: <strong>{formatPrice(subtotal)}</strong>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigator.clipboard.writeText(method.accountNumber!);
                                        setCopiedNumber(true);
                                        setTimeout(() => setCopiedNumber(false), 2000);
                                      }}
                                      className="px-3 py-1.5 bg-black text-white hover:bg-black/80 text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1 cursor-pointer self-start sm:self-center shrink-0 shadow-xs"
                                    >
                                      {copiedNumber ? (
                                        <>
                                          <Check className="w-3 h-3 text-[#C5A059]" />
                                          <span>Number Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="w-3 h-3" />
                                          <span>Copy Number</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                )}

                                {method.requiresTrxId && (
                                  <div className="space-y-1.5">
                                    <label className="font-medium text-black/80 uppercase tracking-wider text-[10px] block">
                                      {paymentType === "advance_delivery_cod"
                                        ? `Enter ${method.name} TrxID for Advance ৳${shippingCost} (${isInsideDhaka ? "Inside Dhaka" : "Outside Dhaka"}) Courier Fee *`
                                        : `Enter ${method.name} Transaction ID (TrxID) for Full ${formatPrice(grandTotal)} Payment *`}
                                    </label>
                                    <input
                                      type="text"
                                      required
                                      placeholder="e.g. 9K72B8XQ12"
                                      value={trxId}
                                      onChange={(e) => setTrxId(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                      className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/20 rounded-xs font-mono uppercase focus:outline-none focus:border-black text-xs"
                                    />
                                    <span className="text-[10px] text-black/50 font-mono block">
                                      {paymentType === "advance_delivery_cod"
                                        ? `Submitting this TrxID locks your ৳${shippingCost} courier booking. Settle ${formatPrice(subtotal)} on delivery.`
                                        : `Submitting this TrxID settles your order in full.`}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Review & Complete Button */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xs border border-black/10 space-y-6 lg:sticky lg:top-28">
              <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black pb-3 border-b border-black/10">
                Order Review ({items.length} items)
              </h3>

              {/* Items summary */}
              <div className="divide-y divide-black/10 max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-14 bg-[#F4F3ED] rounded-xs overflow-hidden flex-shrink-0">
                        <Image
                          src={i.image || "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=400&auto=format&fit=crop"}
                          alt={i.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h5 className="font-medium uppercase line-clamp-1">{i.title}</h5>
                        <span className="text-[11px] text-black/60">
                          {i.size} × {i.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-semibold">
                      {formatPrice(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations & Settlement Breakdown */}
              <div className="pt-4 border-t border-black/10 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between text-black/70">
                  <span>Garments Subtotal:</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-black/70">
                  <span>64-District Courier Fee:</span>
                  <span className="font-mono">
                    {formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-bold text-black pt-2 border-t border-black/10">
                  <span>Total Order Acquisition:</span>
                  <span className="font-mono">{formatPrice(grandTotal)}</span>
                </div>

                {/* Advance & Due Breakdown */}
                <div className="p-3 bg-[#F4F3ED] border border-black/15 rounded-xs space-y-2 mt-2">
                  <div className="flex justify-between items-center text-black font-bold">
                    <span className="uppercase text-[11px]">Pay Now in Advance:</span>
                    <span className="font-mono text-sm text-[#C5A059] bg-black px-2 py-0.5">
                      {formatPrice(advancePayable)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-black/80 text-[11px] pt-1 border-t border-black/10">
                    <span className="uppercase">Due on Doorstep Delivery:</span>
                    <span className="font-mono font-bold text-black">
                      {formatPrice(dueOnDelivery)}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 rounded-xs text-xs text-[#9E2A2B]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#0A0A0A] text-[#F4F3ED] text-xs font-medium tracking-monumental uppercase hover:bg-black/85 transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                {loading ? (
                  <span>Processing Atelier Dispatch...</span>
                ) : (
                  <>
                    <span>
                      {paymentType === "advance_delivery_cod"
                        ? `Confirm Booking // ৳${advancePayable} Advance`
                        : paymentType === "full_cod"
                        ? `Place Order // ${formatPrice(grandTotal)} (Full COD)`
                        : `Place Order // ${formatPrice(grandTotal)} (Full Payment)`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-black/50 tracking-wider">
                7-Day Sizing Exchange Guarantee // Nationwide Insured Transit
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
