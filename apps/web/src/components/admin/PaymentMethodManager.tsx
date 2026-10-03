"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CreditCard,
  Plus,
  Edit3,
  Trash2,
  Check,
  AlertCircle,
  Smartphone,
  Banknote,
  Building2,
  CheckCircle2,
  XCircle,
  Copy,
  Layers,
} from "lucide-react";
import { PaymentMethodConfig } from "@/lib/types";

interface PaymentMethodManagerProps {
  methods: PaymentMethodConfig[];
  passkey: string;
  onRefresh: () => void;
}

const PROVIDER_PRESETS: Record<
  string,
  {
    name: string;
    type: PaymentMethodConfig["type"];
    accountType?: PaymentMethodConfig["accountType"];
    requiresTrxId: boolean;
    instructions: string;
  }
> = {
  bkash: {
    name: "bKash Mobile Banking",
    type: "mfs",
    accountType: "Merchant",
    requiresTrxId: true,
    instructions:
      "Make Payment / Send Money to our official bKash Merchant wallet. Enter your Phone Number as reference and submit the 8-digit Transaction ID (TrxID) below.",
  },
  nagad: {
    name: "Nagad Mobile Banking",
    type: "mfs",
    accountType: "Merchant",
    requiresTrxId: true,
    instructions:
      "Make Payment / Send Money to our official Nagad Merchant wallet. Enter your Phone Number as reference and submit the 8-digit Transaction ID (TrxID) below.",
  },
  rocket: {
    name: "Dutch-Bangla Rocket MFS",
    type: "mfs",
    accountType: "Merchant",
    requiresTrxId: true,
    instructions:
      "Send payment to our Rocket Merchant number with your 12-digit wallet identifier.",
  },
  upay: {
    name: "Upay Mobile Banking",
    type: "mfs",
    accountType: "Merchant",
    requiresTrxId: true,
    instructions:
      "Send payment to our Upay Merchant number and enter the Transaction reference ID.",
  },
  cod: {
    name: "Cash on Delivery (COD)",
    type: "cod",
    requiresTrxId: false,
    instructions:
      "Inspect luxury garments upon doorstep delivery before cash settlement.",
  },
  card: {
    name: "Credit / Debit Card (Visa, Mastercard, AMEX)",
    type: "card",
    requiresTrxId: false,
    instructions:
      "3D Secure SSL encrypted payment gateway. Direct gateway redirection and instant authentication.",
  },
  bank: {
    name: "Direct Atelier Bank Transfer",
    type: "bank",
    requiresTrxId: true,
    instructions:
      "Direct wire transfer to LIFAZ Atelier corporate bank account. Provide deposit slip / transaction number.",
  },
  custom: {
    name: "Custom Settlement Method",
    type: "custom",
    requiresTrxId: false,
    instructions: "Follow custom checkout instructions provided by atelier concierge.",
  },
};

export function PaymentMethodManager({
  methods,
  passkey,
  onRefresh,
}: PaymentMethodManagerProps) {
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [type, setType] = useState<PaymentMethodConfig["type"]>("mfs");
  const [provider, setProvider] = useState<PaymentMethodConfig["provider"]>("bkash");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState<PaymentMethodConfig["accountType"]>("Merchant");
  const [instructions, setInstructions] = useState("");
  const [requiresTrxId, setRequiresTrxId] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenAdd = (presetKey?: string) => {
    setEditingId(null);
    setError("");
    setSuccess("");

    if (presetKey && PROVIDER_PRESETS[presetKey]) {
      const p = PROVIDER_PRESETS[presetKey];
      setName(p.name);
      setType(p.type);
      setProvider(presetKey as PaymentMethodConfig["provider"]);
      setAccountNumber("");
      setAccountType(p.accountType || "Merchant");
      setInstructions(p.instructions);
      setRequiresTrxId(p.requiresTrxId);
      setIsActive(true);
      setDisplayOrder((methods.length || 0) + 1);
    } else {
      setName("");
      setType("mfs");
      setProvider("bkash");
      setAccountNumber("");
      setAccountType("Merchant");
      setInstructions(PROVIDER_PRESETS.bkash.instructions);
      setRequiresTrxId(true);
      setIsActive(true);
      setDisplayOrder((methods.length || 0) + 1);
    }
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: PaymentMethodConfig) => {
    setEditingId(m.id);
    setError("");
    setSuccess("");
    setName(m.name);
    setType(m.type);
    setProvider(m.provider);
    setAccountNumber(m.accountNumber || "");
    setAccountType(m.accountType || "Merchant");
    setInstructions(m.instructions || "");
    setRequiresTrxId(Boolean(m.requiresTrxId));
    setIsActive(m.isActive);
    setDisplayOrder(m.displayOrder || 1);
    setIsModalOpen(true);
  };

  const handleProviderChange = (newProvider: PaymentMethodConfig["provider"]) => {
    setProvider(newProvider);
    if (!editingId && PROVIDER_PRESETS[newProvider]) {
      const preset = PROVIDER_PRESETS[newProvider];
      setName(preset.name);
      setType(preset.type);
      if (preset.accountType) setAccountType(preset.accountType);
      setInstructions(preset.instructions);
      setRequiresTrxId(preset.requiresTrxId);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Payment method name is required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload: Partial<PaymentMethodConfig> = {
        name: name.trim(),
        type,
        provider,
        accountNumber: accountNumber.trim() || undefined,
        accountType: type === "mfs" || type === "bank" ? accountType : undefined,
        instructions: instructions.trim(),
        requiresTrxId,
        isActive,
        displayOrder: Number(displayOrder) || 1,
      };

      if (editingId) {
        payload.id = editingId;
        const res = await fetch("/api/settings/payment-methods", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": passkey,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(`Payment method "${name}" updated.`);
          setIsModalOpen(false);
          onRefresh();
        } else {
          setError(data.error || "Failed to update payment method.");
        }
      } else {
        const res = await fetch("/api/settings/payment-methods", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": passkey,
          },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(`Payment gateway "${name}" added.`);
          setIsModalOpen(false);
          onRefresh();
        } else {
          setError(data.error || "Failed to create payment method.");
        }
      }
    } catch {
      setError("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/settings/payment-methods", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": passkey,
        },
        body: JSON.stringify({ id, isActive: !current }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Status toggled to ${!current ? "Active" : "Disabled"}.`);
        onRefresh();
      } else {
        setError(data.error || "Failed to toggle status.");
      }
    } catch {
      setError("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, methodName: string) => {
    if (!confirm(`Are you sure you want to remove "${methodName}" from checkout?`)) return;

    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/settings/payment-methods?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: { "x-admin-key": passkey },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Payment method "${methodName}" removed.`);
        onRefresh();
      } else {
        setError(data.error || "Failed to delete payment method.");
      }
    } catch {
      setError("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProviderBadge = (p: PaymentMethodConfig["provider"]) => {
    switch (p) {
      case "bkash":
        return {
          label: "bKash",
          bg: "bg-pink-50 text-pink-700 border-pink-200",
          icon: Smartphone,
        };
      case "nagad":
        return {
          label: "Nagad",
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          icon: Smartphone,
        };
      case "rocket":
        return {
          label: "Rocket",
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          icon: Smartphone,
        };
      case "upay":
        return {
          label: "Upay",
          bg: "bg-teal-50 text-teal-700 border-teal-200",
          icon: Smartphone,
        };
      case "cod":
        return {
          label: "COD",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Banknote,
        };
      case "card":
        return {
          label: "CARD",
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: CreditCard,
        };
      case "bank":
        return {
          label: "BANK",
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: Building2,
        };
      default:
        return {
          label: "CUSTOM",
          bg: "bg-neutral-100 text-neutral-800 border-neutral-200",
          icon: CreditCard,
        };
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Top Banner Header */}
      <div className="bg-white p-6 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-black" />
            <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-black">
              Payment Gateways ({methods.length})
            </h3>
          </div>
          <p className="text-xs text-black/60 font-mono">
            Manage checkout payment gateways, merchant mobile banking numbers, and TrxID rules.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAdd()}
            className="px-5 py-2.5 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-black/85 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Gateway</span>
          </button>
        </div>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="bg-white p-4 border border-black/10 flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-black/50 uppercase text-[10px] tracking-wider mr-2 flex items-center gap-1 font-bold">
          <Layers className="w-3 h-3" />
          <span>Quick Presets:</span>
        </span>
        {[
          { key: "bkash", label: "+ bKash" },
          { key: "nagad", label: "+ Nagad" },
          { key: "rocket", label: "+ Rocket" },
          { key: "cod", label: "+ Cash on Delivery" },
          { key: "card", label: "+ Visa/Mastercard" },
          { key: "bank", label: "+ Bank Transfer" },
        ].map((p) => (
          <button
            key={p.key}
            onClick={() => handleOpenAdd(p.key)}
            className="px-2.5 py-1 bg-[#F5F4EE] hover:bg-black/10 text-black/80 border border-black/10 transition-colors cursor-pointer text-[11px]"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Alert Messages */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          ✓ {success}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Methods List */}
      <div className="space-y-3">
        {methods.length === 0 ? (
          <div className="bg-white border border-black/10 p-12 text-center text-xs font-mono text-black/50 space-y-3">
            <CreditCard className="w-8 h-8 text-black/30 mx-auto" />
            <div>No payment methods active. Click "New Gateway" to add one.</div>
          </div>
        ) : (
          methods.map((method) => {
            const badge = getProviderBadge(method.provider);
            const Icon = badge.icon;

            return (
              <div
                key={method.id}
                className={`p-5 bg-white border transition-colors ${
                  method.isActive
                    ? "border-black/15 hover:border-black/30"
                    : "border-black/10 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xs flex items-center justify-center shrink-0 border ${badge.bg}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-sans font-bold text-base uppercase tracking-tight text-black">
                          {method.name}
                        </span>

                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border rounded-xs ${badge.bg}`}
                        >
                          {badge.label}
                        </span>

                        {method.type === "mfs" && method.accountType && (
                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[#F5F4EE] text-black/80 border border-black/10">
                            {method.accountType}
                          </span>
                        )}

                        {method.requiresTrxId ? (
                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-neutral-100 text-neutral-800 border border-neutral-200">
                            TrxID Required
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-neutral-50 text-neutral-500 border border-neutral-200">
                            No TrxID
                          </span>
                        )}

                        <span
                          className={`px-2 py-0.5 text-[10px] font-mono uppercase font-bold border rounded-xs ${
                            method.isActive
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-neutral-100 text-neutral-500 border-neutral-200"
                          }`}
                        >
                          {method.isActive ? "Active at Checkout" : "Disabled"}
                        </span>
                      </div>

                      {/* Account Number & Instructions */}
                      {method.accountNumber && (
                        <div className="flex items-center gap-2 text-xs font-mono text-black/80 pt-0.5">
                          <span className="text-black/50">Number / Wallet:</span>
                          <span className="font-bold text-black bg-[#F5F4EE] px-2 py-0.5 border border-black/10">
                            {method.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(method.accountNumber!, method.id)}
                            className="text-black/40 hover:text-black p-1 transition-colors cursor-pointer"
                            title="Copy number"
                          >
                            {copiedId === method.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {method.instructions && (
                        <p className="text-xs text-black/60 font-mono line-clamp-2 max-w-3xl pt-1">
                          {method.instructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-black/10 justify-end">
                    <span className="text-[11px] font-mono text-black/40 mr-2">
                      Order: #{method.displayOrder || 1}
                    </span>

                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(method.id, method.isActive)}
                      className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors cursor-pointer border flex items-center gap-1.5 ${
                        method.isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-[#F5F4EE] text-black/50 border-black/10 hover:bg-black/5"
                      }`}
                    >
                      {method.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Enabled</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Disabled</span>
                        </>
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(method)}
                      className="p-2 text-black/60 hover:text-black border border-black/10 hover:border-black/30 bg-[#F5F4EE] transition-colors cursor-pointer"
                      title="Edit method"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDelete(method.id, method.name)}
                      className="p-2 text-black/60 hover:text-red-600 border border-black/10 hover:border-red-300 bg-[#F5F4EE] transition-colors cursor-pointer"
                      title="Delete method"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Gateway Modal Portalled to document.body */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="max-w-lg w-full bg-white border border-black/15 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-black/50 uppercase block mb-1">
                  Atelier Payment Architecture
                </span>
                <h3 className="font-sans font-bold text-xl uppercase tracking-tight text-black">
                  {editingId ? "Edit Payment Gateway" : "Configure New Payment Gateway"}
                </h3>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
                {/* Provider Preset Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                    Payment Provider / Engine *
                  </label>
                  <select
                    value={provider}
                    onChange={(e) =>
                      handleProviderChange(e.target.value as PaymentMethodConfig["provider"])
                    }
                    className="w-full px-3.5 py-2.5 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                  >
                    <option value="bkash">bKash (Mobile Financial Services)</option>
                    <option value="nagad">Nagad (Mobile Financial Services)</option>
                    <option value="rocket">Dutch-Bangla Rocket MFS</option>
                    <option value="upay">Upay MFS</option>
                    <option value="cod">Cash on Delivery (Doorstep Cash Settlement)</option>
                    <option value="card">Credit / Debit Card (Visa, Mastercard, AMEX)</option>
                    <option value="bank">Direct Atelier Bank Transfer (Wire)</option>
                    <option value="custom">Custom / Other Settlement Gateway</option>
                  </select>
                </div>

                {/* Gateway Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                    Display Name at Checkout *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bKash Mobile Banking"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                  />
                </div>

                {/* Method Type & Account Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                      Settlement Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                    >
                      <option value="mfs">Mobile Banking (MFS)</option>
                      <option value="cod">Cash on Delivery</option>
                      <option value="card">Card Payment Gateway</option>
                      <option value="bank">Bank Wire</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  {(type === "mfs" || type === "bank") && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                        Account Classification
                      </label>
                      <select
                        value={accountType}
                        onChange={(e) => setAccountType(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                      >
                        <option value="Merchant">Merchant Account</option>
                        <option value="Personal">Personal Wallet</option>
                        <option value="Agent">Agent Number</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Account Number */}
                {(type === "mfs" || type === "bank") && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                      Merchant / Wallet / Account Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 01711-000000 or IBAN / Account #"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                    />
                  </div>
                )}

                {/* Instructions */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                    Client Checkout Instructions
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Instructions visible to client when this payment method is selected..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                  />
                </div>

                {/* Checkboxes & Ordering */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-black/90">
                    <input
                      type="checkbox"
                      checked={requiresTrxId}
                      onChange={(e) => setRequiresTrxId(e.target.checked)}
                      className="accent-black w-4 h-4"
                    />
                    <span className="text-[11px] uppercase tracking-wider font-bold">
                      Require TrxID Verification
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer text-black/90">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="accent-black w-4 h-4"
                    />
                    <span className="text-[11px] uppercase tracking-wider font-bold">
                      Active at Checkout
                    </span>
                  </label>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                    Display Order Index (Lower numbers appear first)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2.5 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
                    {error}
                  </div>
                )}

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 border border-black/20 text-black hover:border-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-black/85 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {loading
                        ? "Saving..."
                        : editingId
                        ? "Update Gateway"
                        : "Create Gateway"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
