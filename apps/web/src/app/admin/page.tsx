"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Package,
  ShoppingBag,
  Sliders,
  Database,
  ArrowRight,
  LogOut,
  LayoutGrid,
  CreditCard,
} from "lucide-react";
import { DatabaseSchema } from "@/lib/types";
import { CatalogHub } from "@/components/admin/CatalogHub";
import { PaymentMethodManager } from "@/components/admin/PaymentMethodManager";
import { OrderManager } from "@/components/admin/OrderManager";
import { HeroStudio } from "@/components/admin/HeroStudio";
import { MosaicStudio } from "@/components/admin/MosaicStudio";
import { DatabaseInspector } from "@/components/admin/DatabaseInspector";

export default function AdminPage() {
  const [passkey, setPasskey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "catalog" | "orders" | "payments" | "hero" | "mosaic" | "database"
  >("catalog");

  const [dbData, setDbData] = useState<DatabaseSchema | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  // Check saved passkey in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem("lifaz_admin_key");
    if (saved) {
      setPasskey(saved);
      verifyKey(saved);
    }
  }, []);

  const verifyKey = async (keyToVerify: string) => {
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passkey: keyToVerify }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("lifaz_admin_key", keyToVerify);
        fetchDatabase(keyToVerify, true);
      } else {
        setAuthError(data.error || "Invalid passkey.");
        setIsAuthenticated(false);
      }
    } catch {
      setAuthError("Verification request failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchDatabase = async (authKey: string, isInitial = false) => {
    if (isInitial || !dbData) {
      setLoadingDb(true);
    }
    try {
      const res = await fetch("/api/db", {
        headers: { "x-admin-key": authKey },
      });
      const data = await res.json();
      if (res.ok && data.database) {
        setDbData(data.database);
      }
    } catch (err) {
      console.error("Failed to load DB in admin", err);
    } finally {
      if (isInitial || !dbData) {
        setLoadingDb(false);
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passkey) return;
    verifyKey(passkey);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("lifaz_admin_key");
    setIsAuthenticated(false);
    setPasskey("");
  };

  // 1. Passkey Login Shield Modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-24 bg-[#F5F4EE] text-black flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 border border-black/10 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-black/5 text-black flex items-center justify-center mx-auto border border-black/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-widest text-black/50 uppercase font-mono block font-bold">
              LIFAZ ATELIER // SECURE GATEWAY
            </span>
            <h2 className="font-editorial-serif text-2xl uppercase tracking-wider text-black">
              Admin Studio
            </h2>
            <p className="text-xs text-black/60 font-mono">
              Enter your master passkey to access atelier catalog, drops, payments, and dispatch logs.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1.5">
              <label className="uppercase tracking-wider text-[10px] text-black/70 font-bold">
                Master Passkey (ADMIN_PASSKEY)
              </label>
              <div className="relative flex items-center bg-[#FBFBFA] border border-black/20 focus-within:border-black transition-colors">
                <Lock className="w-4 h-4 text-black/40 ml-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••••••"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  className="w-full px-3 py-3 text-black bg-transparent focus:outline-none font-mono"
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-200 text-xs font-mono">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-black/85 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{authLoading ? "VERIFYING..." : "AUTHORIZE ACCESS"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center text-[10px] text-black/40 tracking-wider font-mono pt-2 border-t border-black/5">
            Default passkey configured in <code className="text-black/70 font-bold">.env.local</code>
          </div>
        </div>
      </div>
    );
  }

  // 2. Unlocked Admin Studio Dashboard
  return (
    <div className="min-h-screen pt-24 pb-24 bg-[#F5F4EE] text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Studio Topbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-black/50 uppercase font-bold">
              <span>Atelier Management Studio</span>
            </div>
            <h1 className="font-editorial-serif text-2xl sm:text-3xl uppercase tracking-wider text-black mt-0.5">
              LIFAZ Control Center
            </h1>
          </div>

          <div className="flex items-center gap-2.5 font-mono text-xs">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 bg-white text-black border border-black/15 uppercase tracking-wider hover:bg-black hover:text-white transition-colors text-[11px]"
            >
              Storefront ↗
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-black text-white font-bold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              <LogOut className="w-3 h-3" />
              <span>Lock Studio</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs pb-2 border-b border-black/10">
          {[
            { key: "catalog", label: "Catalog & Collections", icon: Package },
            { key: "orders", label: "Orders & Dispatch", icon: ShoppingBag },
            { key: "payments", label: "Payments", icon: CreditCard },
            { key: "hero", label: "Hero Studio", icon: Sliders },
            { key: "mosaic", label: "Minimalism", icon: LayoutGrid },
            { key: "database", label: "Database", icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-3.5 py-2 font-bold font-mono tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer text-[11px] border ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-black/70 border-black/10 hover:border-black/30 hover:text-black"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Tab View */}
        {loadingDb || !dbData ? (
          <div className="p-12 text-center text-xs font-mono text-black/50 bg-white border border-black/10">
            Synchronizing with local database store...
          </div>
        ) : (
          <div>
            {activeTab === "catalog" && (
              <CatalogHub
                products={dbData.products}
                drops={dbData.drops}
                categories={dbData.categories}
                passkey={passkey}
                onRefresh={() => fetchDatabase(passkey)}
              />
            )}

            {activeTab === "orders" && (
              <OrderManager
                orders={dbData.orders}
                passkey={passkey}
                onRefresh={() => fetchDatabase(passkey)}
              />
            )}

            {activeTab === "payments" && (
              <PaymentMethodManager
                methods={dbData.paymentMethods || []}
                passkey={passkey}
                onRefresh={() => fetchDatabase(passkey)}
              />
            )}

            {activeTab === "hero" && (
              <HeroStudio
                hero={dbData.hero}
                passkey={passkey}
                onRefresh={() => fetchDatabase(passkey)}
              />
            )}

            {activeTab === "mosaic" && (
              <MosaicStudio
                mosaic={dbData.mosaic}
                passkey={passkey}
                onRefresh={() => fetchDatabase(passkey)}
              />
            )}

            {activeTab === "database" && (
              <DatabaseInspector
                database={dbData}
                passkey={passkey}
                onRefresh={() => fetchDatabase(passkey)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
