"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit3, Check, X, Clock, Upload, AlertCircle } from "lucide-react";
import { Drop } from "@/lib/types";

interface DropManagerProps {
  drops: Drop[];
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

export function DropManager({ drops, passkey, onRefresh }: DropManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrop, setEditingDrop] = useState<Drop | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [lookbookImages, setLookbookImages] = useState<string[]>([]);
  const [status, setStatus] = useState<"Active" | "Upcoming" | "Archived">("Upcoming");
  const [releaseDate, setReleaseDate] = useState("OCTOBER 2026");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadWarning, setUploadWarning] = useState("");

  const handleOpenModal = (d?: Drop) => {
    setError("");
    setUploadWarning("");
    if (d) {
      setEditingDrop(d);
      setTitle(d.title);
      setName(d.name);
      setSubtitle(d.subtitle || "");
      setDescription(d.description);
      setHeroImage(d.heroImage);
      setLookbookImages(d.lookbookImages || []);
      setStatus(d.status);
      setReleaseDate(d.releaseDate);
    } else {
      setEditingDrop(null);
      setTitle("");
      setName("");
      setSubtitle("");
      setDescription("");
      setHeroImage("");
      setLookbookImages([]);
      setStatus("Active");
      setReleaseDate("");
    }
    setIsModalOpen(true);
  };

  // Single File Upload for Drop Hero
  const handleHeroFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadWarning("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadWarning("Only JPG, PNG, WEBP, and AVIF image formats are allowed.");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadWarning("File exceeds 15MB size limit.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setHeroImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Multi-File Upload for Lookbook Campaign Spreads
  const handleLookbookUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadWarning("");
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        setUploadWarning(`Skipped "${file.name}". Permitted types: JPG, PNG, WEBP, AVIF.`);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setLookbookImages((prev) => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeLookbookImage = (idxToRemove: number) => {
    setLookbookImages((prev) => prev.filter((_, i) => i !== idxToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setError("Title and description are required.");
      return;
    }

    if (!heroImage) {
      setError("Please upload a cover campaign photograph for this drop.");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      id: editingDrop?.id,
      title,
      name,
      subtitle,
      description,
      heroImage,
      lookbookImages,
      status,
      releaseDate,
    };

    try {
      const url = editingDrop ? `/api/drops/${editingDrop.id}` : "/api/drops";
      const method = editingDrop ? "PUT" : "POST";

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
        setError(data.error || "Failed to save drop.");
      }
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Permanently remove this capsule drop?")) return;

    try {
      const res = await fetch(`/api/drops/${id}`, {
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

  return (
    <div className="space-y-6 text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-black/10">
        <div>
          <h3 className="font-sans font-black text-xl uppercase tracking-tight">
            Capsule Drops ({drops.length})
          </h3>
          <p className="text-xs text-black/60 mt-1">
            Manage seasonal releases, upload campaign hero photos, and set launch dates.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-5 py-2.5 bg-black text-white text-xs font-bold tracking-khy-wide uppercase hover:bg-black/85 transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>NEW CAPSULE</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {drops.map((drop) => (
          <div
            key={drop.id}
            className="bg-white border border-black/10 overflow-hidden flex flex-col justify-between"
          >
            <div className="relative w-full aspect-[16/9] bg-black">
              {drop.heroImage && (
                <Image
                  src={drop.heroImage}
                  alt={drop.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute top-3 left-3">
                <span
                  className={`text-[9px] font-mono font-bold uppercase tracking-khy-wide px-3 py-1 ${
                    drop.status === "Active"
                      ? "bg-white text-black"
                      : "bg-black text-white"
                  }`}
                >
                  {drop.status}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase block mb-1">
                  {drop.subtitle || `DROP 00${drop.dropNumber}`}
                </span>
                <h4 className="font-sans font-black text-lg uppercase tracking-tight text-black">
                  {drop.title}
                </h4>
                <p className="text-xs text-black/60 line-clamp-2 mt-1">
                  {drop.description}
                </p>
              </div>

              <div className="pt-4 border-t border-black/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-black/70">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{drop.releaseDate}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(drop)}
                    className="p-1.5 text-black/70 hover:text-black cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(drop.id)}
                    className="p-1.5 text-black/40 hover:text-[#9E2A2B] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] border border-black/20 shadow-2xl flex flex-col overflow-hidden text-xs text-black">
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-[#F9F9F9]">
              <h3 className="font-sans font-black text-base uppercase tracking-tight">
                {editingDrop ? "Edit Capsule Drop" : "Create New Capsule"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-black/60 hover:text-black cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
              {error && (
                <div className="p-3 bg-[#9E2A2B]/10 border border-[#9E2A2B]/30 text-[#9E2A2B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              {uploadWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{uploadWarning}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wide text-[10px]">
                  Drop Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DROP 001: FAUX LEATHER & MOTO"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wide text-[10px]">
                    Manifesto Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wide text-[10px]">
                    Subtitle Tag
                  </label>
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wide text-[10px]">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20"
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold uppercase tracking-wide text-[10px]">
                    Release Date Label
                  </label>
                  <input
                    type="text"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20 font-mono"
                  />
                </div>
              </div>

              {/* Cover Hero File Upload Only */}
              <div className="space-y-2 pt-2">
                <label className="font-bold uppercase tracking-wide text-[10px]">
                  Drop Cover Hero Image (Upload File Only)
                </label>
                <div className="border-2 border-dashed border-black/20 p-4 text-center bg-[#F9F9F9] relative">
                  <input
                    type="file"
                    accept={ACCEPT_STRING}
                    onChange={handleHeroFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
                    <Upload className="w-5 h-5 text-black/60" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      Upload Hero Photography (.jpg, .png, .webp, .avif)
                    </span>
                  </div>
                </div>

                {heroImage && (
                  <div className="relative w-full h-36 bg-black overflow-hidden mt-2">
                    <Image
                      src={heroImage}
                      alt="Hero preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setHeroImage("")}
                      className="absolute top-2 right-2 p-1 bg-black/80 text-white hover:bg-[#9E2A2B]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Lookbook Multiple Images Upload */}
              <div className="space-y-2 pt-2">
                <label className="font-bold uppercase tracking-wide text-[10px]">
                  Lookbook Campaign Spreads (Upload Multiple Files)
                </label>
                <div className="border-2 border-dashed border-black/20 p-4 text-center bg-[#F9F9F9] relative">
                  <input
                    type="file"
                    accept={ACCEPT_STRING}
                    multiple
                    onChange={handleLookbookUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
                    <Upload className="w-5 h-5 text-black/60" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">
                      Add Lookbook Spreads
                    </span>
                  </div>
                </div>

                {lookbookImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {lookbookImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-[3/4] bg-black/5 overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt="Lookbook spread"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeLookbookImage(idx)}
                          className="absolute top-1 right-1 p-0.5 bg-black text-white hover:bg-[#9E2A2B]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold uppercase tracking-wide text-[10px]">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F9F9F9] border border-black/20"
                />
              </div>

              <div className="pt-4 border-t border-black/10 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 border border-black uppercase font-bold text-black"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 bg-black text-white uppercase font-bold hover:bg-black/85"
                >
                  {loading ? "SAVING..." : "SAVE CAPSULE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
