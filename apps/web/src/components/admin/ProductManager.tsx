"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Plus,
  Trash2,
  Edit3,
  Check,
  Sparkles,
  X,
  Upload,
  Image as ImageIcon,
  Layers,
  AlertCircle,
} from "lucide-react";
import { Product, Drop, ProductVariant } from "@/lib/types";
import { formatPrice } from "@/lib/currency";

interface ProductManagerProps {
  products: Product[];
  drops: Drop[];
  categories: string[];
  passkey: string;
  onRefresh: () => void;
}

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const ACCEPT_STRING = ".jpg,.jpeg,.png,.webp,.avif";

export function ProductManager({
  products,
  drops,
  categories,
  passkey,
  onRefresh,
}: ProductManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | undefined>(undefined);
  const [drop, setDrop] = useState(drops[0]?.title || "");
  const [category, setCategory] = useState(categories[0] || "");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [detailsText, setDetailsText] = useState("");
  const [fabricationText, setFabricationText] = useState("");
  
  // File Upload State (Zero URL inputs)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [sizeChartImage, setSizeChartImage] = useState("");
  const [sizeChartNotes, setSizeChartNotes] = useState("");
  const [badge, setBadge] = useState("");

  // Variant & Inventory State (Full CRUD)
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadWarning, setUploadWarning] = useState("");

  const handleOpenModal = (prod?: Product) => {
    setError("");
    setUploadWarning("");
    if (prod) {
      setEditingProduct(prod);
      setTitle(prod.title);
      setPrice(prod.price);
      setCompareAtPrice(prod.compareAtPrice);
      setDrop(prod.drop || (drops[0]?.title || ""));
      setCategory(prod.category || (categories[0] || ""));
      setColor(prod.color || "");
      setDescription(prod.description || "");
      setDetailsText(prod.details?.join("\n") || "");
      setFabricationText(prod.fabrication?.join("\n") || "");
      setUploadedImages(prod.images || []);
      setSizeChartNotes(prod.sizeChartNotes || "");
      setSizeChartImage(prod.sizeChartImage || "");
      setBadge(prod.badge || "");
      setVariants(prod.variants || []);
    } else {
      setEditingProduct(null);
      setTitle("");
      setPrice(0);
      setCompareAtPrice(undefined);
      setDrop(drops[0]?.title || "");
      setCategory(categories[0] || "");
      setColor("");
      setDescription("");
      setDetailsText("");
      setFabricationText("");
      setUploadedImages([]);
      setSizeChartNotes("");
      setSizeChartImage("");
      setBadge("");
      setVariants([]);
    }
    setIsModalOpen(true);
  };

  // Specific File Type Upload Handler for Gallery Images
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadWarning("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setUploadWarning(
          `Skipped "${file.name}". Only JPG, PNG, WEBP, and AVIF image formats are permitted.`
        );
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadWarning(`File "${file.name}" exceeds maximum allowed 10MB size limit.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setUploadedImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeUploadedImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Specific File Type Upload Handler for Size Blueprint
  const handleSizeChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadWarning("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadWarning("Only JPG, PNG, WEBP, and AVIF files are supported for size diagrams.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setSizeChartImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Inventory Variant CRUD Helpers
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `v-${Date.now()}`,
      size: "M",
      color: color || "Black",
      sku: `LFZ-${Date.now().toString().slice(-4)}`,
      inventory: 0,
      inStock: true,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleAddStandardSizes = () => {
    const standard = ["XS", "S", "M", "L", "XL"].map((sz) => ({
      id: `v-${sz.toLowerCase()}-${Date.now()}`,
      size: sz,
      color: color || "Black",
      sku: `LFZ-${sz}`,
      inventory: 0,
      inStock: true,
    }));
    setVariants(standard);
  };

  const handleUpdateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      setError("Garment title and valid BDT price are required.");
      return;
    }

    if (uploadedImages.length === 0) {
      setError("Please upload at least one garment photograph (.jpg, .png, .webp, .avif).");
      return;
    }

    setLoading(true);
    setError("");

    const details = detailsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const fabrication = fabricationText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      id: editingProduct?.id,
      title,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      drop,
      dropNumber: Number(drop.match(/\d+/)?.[0] || 1),
      category,
      color,
      description,
      details,
      fabrication,
      images: uploadedImages,
      sizeChartNotes,
      sizeChartImage: sizeChartImage || undefined,
      variants,
      badge: badge || undefined,
    };

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": passkey,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      } else {
        setError(data.error || "Failed to save garment.");
      }
    } catch {
      setError("Network communication failure while saving.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently delete this piece from catalog archive?")) return;

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": passkey },
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const totalInventoryAcrossCatalog = products.reduce((acc, p) => {
    return (
      acc +
      (p.variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) || 0)
    );
  }, 0);

  return (
    <div className="space-y-6 text-black">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-black/10">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-black" />
            <h3 className="font-sans font-black text-xl uppercase tracking-tight">
              Catalog & Inventory Management
            </h3>
          </div>
          <p className="text-xs text-black/60 mt-1">
            {products.length} Garments // {totalInventoryAcrossCatalog} Total Units in Atelier Stock
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-black text-white text-xs font-bold tracking-khy-wide uppercase hover:bg-black/85 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW GARMENT</span>
        </button>
      </div>

      {/* Product & Inventory Table */}
      <div className="bg-white border border-black/10 overflow-x-auto">
        {products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-[#C5A059] mx-auto" />
            <h4 className="font-sans font-bold text-base uppercase tracking-wider">
              Catalog Vault Empty
            </h4>
            <p className="text-xs text-black/60 max-w-sm mx-auto">
              Click "New Garment" to upload campaign photography and configure stock.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs divide-y divide-black/10">
            <thead className="bg-[#F9F9F9] text-black/80 font-bold uppercase tracking-khy-wide text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Garment</th>
                <th className="px-6 py-3.5">Price (BDT)</th>
                <th className="px-6 py-3.5">Drop</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Size Inventory Stock</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {products.map((p) => {
                const totalStock =
                  p.variants?.reduce((sum, v) => sum + (v.inventory || 0), 0) ||
                  0;
                return (
                  <tr key={p.id} className="hover:bg-black/5 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="relative w-12 h-16 bg-[#F3F3F3] flex-shrink-0 overflow-hidden">
                        <Image
                          src={p.images?.[0] || ""}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-black uppercase tracking-wide">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-black/50">{p.color}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-black text-sm">
                      {formatPrice(p.price)}
                    </td>
                    <td className="px-6 py-4 text-black/70 font-medium">
                      {p.drop}
                    </td>
                    <td className="px-6 py-4 text-black/70">{p.category}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {p.variants?.map((v) => (
                          <span
                            key={v.id || v.size}
                            className={`px-2 py-0.5 text-[10px] font-mono rounded-xs border ${
                              v.inventory > 0 && v.inStock
                                ? "bg-black/5 border-black/15 text-black"
                                : "bg-[#9E2A2B]/10 border-[#9E2A2B]/30 text-[#9E2A2B]"
                            }`}
                          >
                            <strong>{v.size}:</strong> {v.inventory}
                          </span>
                        ))}
                        <span className="text-[11px] text-black/50 font-bold ml-1">
                          (Total: {totalStock})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(p)}
                          className="p-1.5 text-black/70 hover:text-black transition-colors cursor-pointer"
                          title="Edit Piece & Inventory"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-black/50 hover:text-[#9E2A2B] transition-colors cursor-pointer"
                          title="Delete Piece"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] border border-black/20 shadow-2xl flex flex-col overflow-hidden text-xs text-black">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-[#F9F9F9]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-black" />
                <h3 className="font-sans font-black text-base uppercase tracking-tight">
                  {editingProduct ? "Edit Atelier Garment" : "Create New Garment"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {error && (
                <div className="p-3 bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-[#9E2A2B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {uploadWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{uploadWarning}</span>
                </div>
              )}

              {/* Section 1: Basic Garment Details */}
              <div className="space-y-4">
                <h4 className="font-bold uppercase tracking-khy-wide text-[11px] pb-2 border-b border-black/10">
                  1. Garment Specification
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FAUX LEATHER TRENCH COAT"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Price in BDT (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Compare At Price (৳)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 22000"
                      value={compareAtPrice || ""}
                      onChange={(e) =>
                        setCompareAtPrice(
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Capsule Drop
                    </label>
                    <select
                      value={drop}
                      onChange={(e) => setDrop(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black"
                    >
                      {drops.map((d) => (
                        <option key={d.id} value={d.title}>
                          {d.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black"
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Colorway
                    </label>
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Badge
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Iconic Piece, Limited Edition"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Details (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={detailsText}
                      onChange={(e) => setDetailsText(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Fabrication (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      value={fabricationText}
                      onChange={(e) => setFabricationText(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#F9F9F9] border border-black/20 focus:border-black"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: File Upload Only (Zero URL Inputs) */}
              <div className="space-y-4 pt-4 border-t border-black/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold uppercase tracking-khy-wide text-[11px]">
                      2. Campaign Photography (File Upload Only)
                    </h4>
                    <p className="text-[11px] text-black/50">
                      Permitted file types: <span className="font-mono font-bold">.JPG, .JPEG, .PNG, .WEBP, .AVIF</span>
                    </p>
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="border-2 border-dashed border-black/20 p-6 text-center bg-[#F9F9F9] hover:bg-black/5 transition-colors relative">
                  <input
                    type="file"
                    accept={ACCEPT_STRING}
                    multiple
                    onChange={handleProductImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <Upload className="w-6 h-6 text-black/60" />
                    <div className="font-bold uppercase tracking-wider text-xs">
                      Click to Select or Drop Images
                    </div>
                    <div className="text-[10px] text-black/50">
                      Upload multiple high-resolution garment angles (up to 10MB per file)
                    </div>
                  </div>
                </div>

                {/* Preview Grid */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                    {uploadedImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-[3/4] bg-black/5 border border-black/10 overflow-hidden group"
                      >
                        <Image
                          src={img}
                          alt={`Uploaded preview ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/80 text-white hover:bg-[#9E2A2B] transition-colors"
                          title="Remove photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/70 text-white font-mono text-[9px]">
                          #{idx + 1} {idx === 0 && "(Cover)"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section 3: Inventory & Variant CRUD */}
              <div className="space-y-4 pt-4 border-t border-black/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold uppercase tracking-khy-wide text-[11px]">
                      3. Variant Inventory CRUD
                    </h4>
                    <p className="text-[11px] text-black/50">
                      Configure size variants, SKUs, inventory counts, and in-stock availability.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddStandardSizes}
                      className="px-3 py-1.5 bg-neutral-100 text-black border border-black/20 hover:border-black text-[10px] font-bold tracking-khy-wide uppercase flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Standard Sizes (XS-XL)</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="px-3 py-1.5 bg-black text-white text-[10px] font-bold tracking-khy-wide uppercase hover:bg-black/80 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>ADD VARIANT</span>
                    </button>
                  </div>
                </div>

                {variants.length === 0 ? (
                  <div className="p-6 border border-dashed border-black/20 text-center space-y-2 bg-[#F9F9F9]">
                    <p className="text-xs text-black/50 font-mono">
                      No size variants configured for this garment yet.
                    </p>
                    <div className="flex justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddStandardSizes}
                        className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Auto-Add XS, S, M, L, XL
                      </button>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-3 py-1.5 border border-black/30 text-black text-[10px] font-bold uppercase tracking-wider cursor-pointer hover:border-black"
                      >
                        Add Custom Variant
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-black/15 overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-black/10">
                      <thead className="bg-[#F9F9F9] font-bold uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2">Size</th>
                          <th className="px-3 py-2">Color</th>
                          <th className="px-3 py-2">SKU</th>
                          <th className="px-3 py-2">Stock Inventory</th>
                          <th className="px-3 py-2 text-center">Status</th>
                          <th className="px-3 py-2 text-right">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black/10 bg-white">
                        {variants.map((v, idx) => (
                          <tr key={v.id || idx}>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={v.size}
                                onChange={(e) =>
                                  handleUpdateVariant(idx, "size", e.target.value)
                                }
                                className="w-16 px-2 py-1 bg-[#F9F9F9] border border-black/20 font-bold font-mono uppercase"
                              />
                            </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={v.color}
                              onChange={(e) =>
                                handleUpdateVariant(idx, "color", e.target.value)
                              }
                              className="w-24 px-2 py-1 bg-[#F9F9F9] border border-black/20"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={v.sku}
                              onChange={(e) =>
                                handleUpdateVariant(idx, "sku", e.target.value)
                              }
                              className="w-28 px-2 py-1 bg-[#F9F9F9] border border-black/20 font-mono text-[11px]"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              value={v.inventory}
                              onChange={(e) =>
                                handleUpdateVariant(
                                  idx,
                                  "inventory",
                                  Number(e.target.value)
                                )
                              }
                              className="w-20 px-2 py-1 bg-[#F9F9F9] border border-black/20 font-mono font-bold"
                            />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateVariant(idx, "inStock", !v.inStock)
                              }
                              className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-xs cursor-pointer ${
                                v.inStock && v.inventory > 0
                                  ? "bg-black text-white"
                                  : "bg-[#9E2A2B]/10 text-[#9E2A2B] border border-[#9E2A2B]/30"
                              }`}
                            >
                              {v.inStock && v.inventory > 0 ? "IN STOCK" : "OUT OF STOCK"}
                            </button>
                          </td>
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteVariant(idx)}
                              className="p-1 text-black/40 hover:text-[#9E2A2B] cursor-pointer"
                              title="Delete variant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

              {/* Section 4: Size Blueprint Upload */}
              <div className="space-y-3 pt-4 border-t border-black/10">
                <h4 className="font-bold uppercase tracking-khy-wide text-[11px]">
                  4. Size Blueprint & Advisory (File Upload Only)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Model Fit Advisory Notes
                    </label>
                    <textarea
                      rows={2}
                      value={sizeChartNotes}
                      onChange={(e) => setSizeChartNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold uppercase tracking-wide text-[10px]">
                      Upload Blueprint Diagram (.jpg, .png, .webp, .avif)
                    </label>
                    <input
                      type="file"
                      accept={ACCEPT_STRING}
                      onChange={handleSizeChartUpload}
                      className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20"
                    />
                    {sizeChartImage && (
                      <div className="flex items-center gap-2 pt-1 text-[10px] text-black/60 font-mono">
                        <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>Diagram image attached</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-black/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 border border-black uppercase font-bold text-black hover:bg-black hover:text-white transition-colors cursor-pointer text-xs"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-black text-white uppercase font-bold hover:bg-black/85 transition-colors cursor-pointer flex items-center gap-2 text-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{loading ? "SAVING..." : "SAVE GARMENT & INVENTORY"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
