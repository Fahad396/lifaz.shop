"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  Tag,
  FolderTree,
  AlertCircle,
  ExternalLink,
  Package,
} from "lucide-react";
import { Product } from "@/lib/types";

interface CategoryManagerProps {
  categories: string[];
  products: Product[];
  passkey: string;
  onRefresh: () => void;
}

export function CategoryManager({
  categories,
  products,
  passkey,
  onRefresh,
}: CategoryManagerProps) {
  const [mounted, setMounted] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setCategoryName("");
    setError("");
    setSuccess("");
    setIsAddOpen(true);
  };

  const handleOpenEdit = (cat: string) => {
    setEditingCategory(cat);
    setCategoryName(cat);
    setError("");
    setSuccess("");
    setIsAddOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = categoryName.trim();
    if (!cleanName) {
      setError("Category name cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (editingCategory) {
        // Edit / Rename Category
        const res = await fetch("/api/categories", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": passkey,
          },
          body: JSON.stringify({
            oldName: editingCategory,
            newName: cleanName,
          }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(`Category "${editingCategory}" renamed to "${cleanName}".`);
          setIsAddOpen(false);
          onRefresh();
        } else {
          setError(data.error || "Failed to rename category.");
        }
      } else {
        // Add Category
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": passkey,
          },
          body: JSON.stringify({ name: cleanName }),
        });

        const data = await res.json();
        if (res.ok && data.success) {
          setSuccess(`Category "${cleanName}" created successfully.`);
          setIsAddOpen(false);
          onRefresh();
        } else {
          setError(data.error || "Failed to create category.");
        }
      }
    } catch {
      setError("Network error while saving category.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat: string) => {
    const count = products.filter(
      (p) => p.category.toLowerCase() === cat.toLowerCase()
    ).length;

    const confirmMsg =
      count > 0
        ? `Warning: There are ${count} product(s) filed under "${cat}". Are you sure you want to delete this category?`
        : `Are you sure you want to delete category "${cat}"?`;

    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `/api/categories?name=${encodeURIComponent(cat)}`,
        {
          method: "DELETE",
          headers: { "x-admin-key": passkey },
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`Category "${cat}" deleted.`);
        onRefresh();
      } else {
        setError(data.error || "Failed to delete category.");
      }
    } catch {
      setError("Network error deleting category.");
    } finally {
      setLoading(false);
    }
  };

  const getSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  return (
    <div className="space-y-6 text-black">
      {/* Top Banner Header */}
      <div className="bg-white p-6 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderTree className="w-4 h-4 text-black" />
            <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-black">
              Category & Taxonomy ({categories.length})
            </h3>
          </div>
          <p className="text-xs text-black/60 font-mono">
            Manage store navigation categories, PLP filter groupings, and garment catalog routing.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-black/85 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
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

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const productCount = products.filter(
            (p) => p.category.toLowerCase() === cat.toLowerCase()
          ).length;
          const slug = getSlug(cat);

          return (
            <div
              key={cat}
              className="bg-white border border-black/10 p-5 flex flex-col justify-between space-y-4 hover:border-black/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-black/40" />
                    <h4 className="font-sans font-bold text-base uppercase tracking-tight text-black">
                      {cat}
                    </h4>
                  </div>
                  <div className="text-[11px] font-mono text-black/50">
                    Route: <span className="text-black font-medium">/collections/{slug}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 text-black/60 hover:text-black transition-colors cursor-pointer"
                    title="Rename Category"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 text-black/40 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-black/60">
                  <Package className="w-3 h-3 text-black/40" />
                  <span>
                    {productCount} Garment{productCount === 1 ? "" : "s"}
                  </span>
                </div>

                <Link
                  href={`/collections/${slug}`}
                  target="_blank"
                  className="text-[10px] uppercase tracking-wider text-black/60 hover:text-black flex items-center gap-1 transition-colors font-bold"
                >
                  <span>View PLP</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Category Modal */}
      {mounted &&
        isAddOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="max-w-md w-full bg-white border border-black/15 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-black/50 uppercase block mb-1 font-bold">
                  Atelier Taxonomy Control
                </span>
                <h3 className="font-sans font-bold text-xl uppercase tracking-tight text-black">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h3>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-black/70 font-bold">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leather Outerwear, Knitwear, Accessories"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full px-3.5 py-3 bg-[#F5F4EE] border border-black/15 text-black font-mono focus:outline-hidden focus:border-black"
                  />
                </div>

                {categoryName.trim() && (
                  <div className="p-3 bg-[#F5F4EE] border border-black/10 text-[11px] text-black/70">
                    <span>Target Route: </span>
                    <span className="text-black font-bold font-mono">
                      /collections/{getSlug(categoryName)}
                    </span>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/10">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
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
                        : editingCategory
                        ? "Update Category"
                        : "Create Category"}
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
