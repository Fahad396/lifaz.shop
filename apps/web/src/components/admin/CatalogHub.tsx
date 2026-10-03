"use client";

import React, { useState } from "react";
import { Package, Layers, FolderTree } from "lucide-react";
import { Product, Drop } from "@/lib/types";
import { ProductManager } from "@/components/admin/ProductManager";
import { DropManager } from "@/components/admin/DropManager";
import { CategoryManager } from "@/components/admin/CategoryManager";

interface CatalogHubProps {
  products: Product[];
  drops: Drop[];
  categories: string[];
  passkey: string;
  onRefresh: () => void;
}

export function CatalogHub({
  products,
  drops,
  categories,
  passkey,
  onRefresh,
}: CatalogHubProps) {
  const [subTab, setSubTab] = useState<"products" | "drops" | "categories">("products");

  const totalInventory = products.reduce((acc, p) => {
    return acc + (p.variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) || 0);
  }, 0);

  return (
    <div className="space-y-5">
      {/* Sub-navigation pill bar */}
      <div className="bg-white p-3 border border-black/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {[
            {
              key: "products",
              label: `Garments (${products.length})`,
              sub: `${totalInventory} Units`,
              icon: Package,
            },
            {
              key: "drops",
              label: `Capsule Drops (${drops.length})`,
              sub: "Releases",
              icon: Layers,
            },
            {
              key: "categories",
              label: `Categories (${categories.length})`,
              sub: "Taxonomy",
              icon: FolderTree,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = subTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSubTab(tab.key as any)}
                className={`px-3.5 py-2 uppercase tracking-wider font-bold transition-all flex items-center gap-2 text-[11px] border cursor-pointer ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-[#F5F4EE] text-black/70 border-black/10 hover:border-black/30 hover:text-black"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-black/50 hidden sm:block">
          {subTab === "products" && "Upload pieces, set prices & size inventory stock"}
          {subTab === "drops" && "Manage capsule launches, release dates & lookbooks"}
          {subTab === "categories" && "Organize departments & PLP collection routes"}
        </div>
      </div>

      {/* Sub-view Content */}
      <div>
        {subTab === "products" && (
          <ProductManager
            products={products}
            drops={drops}
            categories={categories}
            passkey={passkey}
            onRefresh={onRefresh}
          />
        )}

        {subTab === "drops" && (
          <DropManager
            drops={drops}
            passkey={passkey}
            onRefresh={onRefresh}
          />
        )}

        {subTab === "categories" && (
          <CategoryManager
            categories={categories}
            products={products}
            passkey={passkey}
            onRefresh={onRefresh}
          />
        )}
      </div>
    </div>
  );
}
