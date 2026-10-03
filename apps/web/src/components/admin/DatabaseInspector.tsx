"use client";

import React, { useState } from "react";
import { Database, Download, Copy, Check, Server, ShieldCheck, HardDrive } from "lucide-react";
import { DatabaseSchema } from "@/lib/types";

interface DatabaseInspectorProps {
  database: DatabaseSchema;
  passkey: string;
  onRefresh: () => void;
}

export function DatabaseInspector({
  database,
  passkey,
  onRefresh,
}: DatabaseInspectorProps) {
  const [activeTable, setActiveTable] = useState<keyof DatabaseSchema>("products");
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(database, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBackup = () => {
    const blob = new Blob([JSON.stringify(database, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifaz-local-db-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentData = database[activeTable];

  return (
    <div className="space-y-6 text-black">
      {/* Top Banner & Metric Chips */}
      <div className="bg-white p-6 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-black" />
            <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-black">
              VPS Local Database Engine
            </h3>
          </div>
          <p className="text-xs text-black/60 font-mono">
            Zero cloud dependency. 100% self-hosted on VPS filesystem with automated rotating snapshots.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopyJson}
            className="px-3.5 py-2 border border-black/15 bg-[#F5F4EE] hover:bg-black/10 text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy JSON"}</span>
          </button>

          <button
            onClick={handleDownloadBackup}
            className="px-4 py-2 bg-black text-white text-xs font-mono font-bold uppercase tracking-wider hover:bg-black/85 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Backup</span>
          </button>
        </div>
      </div>

      {/* VPS Local Storage Specs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-4 bg-white border border-black/10 space-y-1">
          <div className="flex items-center gap-1.5 text-black/50 text-[10px] uppercase font-bold">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Storage Engine</span>
          </div>
          <div className="font-bold text-black text-sm">Local JSON Vault</div>
          <div className="text-[10px] text-black/50 truncate">data/lifaz-database.json</div>
        </div>

        <div className="p-4 bg-white border border-black/10 space-y-1">
          <div className="flex items-center gap-1.5 text-black/50 text-[10px] uppercase font-bold">
            <Server className="w-3.5 h-3.5" />
            <span>Host Environment</span>
          </div>
          <div className="font-bold text-black text-sm">Standalone Linux VPS</div>
          <div className="text-[10px] text-black/50">0 Cloud DB Lock-in</div>
        </div>

        <div className="p-4 bg-white border border-black/10 space-y-1">
          <div className="flex items-center gap-1.5 text-black/50 text-[10px] uppercase font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Protection & Recovery</span>
          </div>
          <div className="font-bold text-emerald-700 text-sm">Atomic Writes & Auto-Heal</div>
          <div className="text-[10px] text-black/50">Rolling Snapshots in data/backups/</div>
        </div>
      </div>

      {/* Table Switcher Tabs */}
      <div className="flex flex-wrap gap-1.5 text-xs font-mono">
        {(
          [
            { key: "products", label: `products (${database.products.length})` },
            { key: "drops", label: `drops (${database.drops.length})` },
            { key: "orders", label: `orders (${database.orders.length})` },
            { key: "paymentMethods", label: `paymentMethods (${(database.paymentMethods || []).length})` },
            { key: "categories", label: `categories (${database.categories.length})` },
            { key: "inquiries", label: `inquiries (${database.inquiries.length})` },
            { key: "subscribers", label: `subscribers (${database.subscribers.length})` },
            { key: "hero", label: "hero studio" },
            { key: "mosaic", label: "minimalism mosaic" },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTable(t.key)}
            className={`px-3 py-1.5 font-mono uppercase transition-colors border cursor-pointer text-[11px] ${
              activeTable === t.key
                ? "bg-black text-white border-black font-bold"
                : "bg-white text-black/70 border-black/10 hover:border-black/30 hover:text-black"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table Data View */}
      <div className="bg-white border border-black/10 overflow-hidden">
        <div className="p-3.5 bg-[#F5F4EE] border-b border-black/10 flex items-center justify-between text-xs font-mono">
          <span className="font-bold uppercase text-black">
            TABLE: {activeTable}
          </span>
          <span className="text-black/50 text-[11px]">
            {Array.isArray(currentData) ? `${currentData.length} record(s)` : "Single Object Document"}
          </span>
        </div>

        <div className="p-4 bg-[#111111] text-[#F5F4EE] overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-[11px] leading-relaxed">
            {JSON.stringify(currentData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
