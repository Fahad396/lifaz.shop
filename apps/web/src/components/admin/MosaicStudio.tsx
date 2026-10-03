"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Check,
  Upload,
  Image as ImageIcon,
  Sparkles,
  LayoutGrid,
  Type,
  Eye,
  AlertCircle,
} from "lucide-react";
import { MosaicSettings } from "@/lib/types";

interface MosaicStudioProps {
  mosaic?: MosaicSettings;
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

const DEFAULT_MOSAIC_STATE: MosaicSettings = {
  tag: "ARCHITECTURAL PROPORTION & DRAPE",
  title: "SCULPTED MINIMALISM",
  description:
    "Constructed with bonded faux leather and structured tailoring. Every garment is engineered in our Dhaka atelier for fluid movement and dramatic silhouette.",
  leftImage: "",
  leftTag: "CAPSULE DROP // STUDY",
  leftTitle: "BONDED VEGAN LEATHER",
  leftCtaText: "EXPLORE ALL PIECES",
  leftCtaLink: "/collections/all",
  rightImage: "",
  rightTag: "RUNWAY ARCHIVE",
  rightTitle: "THE DHAKA SESSIONS",
  callout1Tag: "7-DAY SIZING DESK",
  callout1Title: "Complimentary Swap",
  callout1Description: "Doorstep size exchange available across all 64 districts.",
  callout1Link: "/pages/faq",
  callout1LinkText: "LEARN MORE",
  callout2Tag: "64-DISTRICT COURIER",
  callout2Title: "Insured Shipping",
  callout2Description: "Same-day VIP concierge in Dhaka, and 48-hour nationwide delivery.",
  callout2Link: "/pages/shipping",
  callout2LinkText: "DELIVERY MATRIX",
};

export function MosaicStudio({ mosaic, passkey, onRefresh }: MosaicStudioProps) {
  const [settings, setSettings] = useState<MosaicSettings>(mosaic || DEFAULT_MOSAIC_STATE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "leftImage" | "rightImage"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setUploadError(
        `Invalid file type (${file.type || "unknown"}). Only JPG, JPEG, PNG, WEBP, and AVIF are permitted.`
      );
      return;
    }

    setUploadError("");
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setSettings((prev) => ({ ...prev, [field]: base64 }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings/mosaic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": passkey,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage("Mosaic spread settings saved successfully.");
        onRefresh();
      } else {
        setMessage("Failed to save settings.");
      }
    } catch {
      setMessage("Network error saving settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-black">
      {/* Top Banner Header */}
      <div className="bg-white p-6 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutGrid className="w-4 h-4 text-black" />
            <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-black">
              Sculpted Minimalism // Mosaic Studio
            </h3>
          </div>
          <p className="text-xs text-black/60 font-mono">
            Control the editorial magazine spread, campaign imagery, callout badges, and logistics matrices.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-black/85 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "SAVING..." : "SAVE MOSAIC SPREAD"}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          ✓ {message}
        </div>
      )}

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        ref={leftFileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={(e) => handleImageUpload(e, "leftImage")}
        className="hidden"
      />
      <input
        ref={rightFileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={(e) => handleImageUpload(e, "rightImage")}
        className="hidden"
      />

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Section Header Hierarchy */}
          <div className="bg-white p-6 border border-black/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/10">
              <Type className="w-4 h-4 text-black" />
              <h4 className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                1. Main Section Typography & Manifesto
              </h4>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                Top Label Tag
              </label>
              <input
                type="text"
                value={settings.tag}
                onChange={(e) => setSettings({ ...settings, tag: e.target.value })}
                className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono tracking-widest uppercase focus:outline-hidden focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                Monumental Section Title
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-base font-sans font-bold tracking-tight uppercase focus:outline-hidden focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                Editorial Description
              </label>
              <textarea
                rows={2}
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono focus:outline-hidden focus:border-black"
              />
            </div>
          </div>

          {/* Section 2: Left Tall Hero Spread */}
          <div className="bg-white p-6 border border-black/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/10">
              <ImageIcon className="w-4 h-4 text-black" />
              <h4 className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                2. Left Tall Hero Spread (Upload Only)
              </h4>
            </div>

            <div className="space-y-3">
              {settings.leftImage ? (
                <div className="relative aspect-[3/4] w-full max-w-[260px] bg-black border border-black/10 overflow-hidden group">
                  <Image
                    src={settings.leftImage}
                    alt="Left Hero Spread"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => leftFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, leftImage: "" }))}
                      className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => leftFileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-black/20 hover:border-black/50 bg-[#F5F4EE] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-black/50" />
                  <span className="text-xs font-mono uppercase tracking-widest text-black font-bold">
                    Upload Left Tall Campaign Photo
                  </span>
                  <span className="text-[10px] text-black/50 font-mono">
                    Aspect 3:4 (.jpg, .png, .webp, .avif)
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Left Tag</label>
                  <input
                    type="text"
                    value={settings.leftTag}
                    onChange={(e) =>
                      setSettings({ ...settings, leftTag: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Left Title</label>
                  <input
                    type="text"
                    value={settings.leftTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, leftTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Left CTA Text</label>
                  <input
                    type="text"
                    value={settings.leftCtaText}
                    onChange={(e) =>
                      setSettings({ ...settings, leftCtaText: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Left CTA Link</label>
                  <input
                    type="text"
                    value={settings.leftCtaLink}
                    onChange={(e) =>
                      setSettings({ ...settings, leftCtaLink: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Right Stacked Spread */}
          <div className="bg-white p-6 border border-black/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/10">
              <ImageIcon className="w-4 h-4 text-black" />
              <h4 className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                3. Right Stacked Spread (Upload Only)
              </h4>
            </div>

            <div className="space-y-3">
              {settings.rightImage ? (
                <div className="relative aspect-[16/10] w-full max-w-[340px] bg-black border border-black/10 overflow-hidden group">
                  <Image
                    src={settings.rightImage}
                    alt="Right Stacked Spread"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => rightFileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 cursor-pointer"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettings((prev) => ({ ...prev, rightImage: "" }))}
                      className="px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => rightFileInputRef.current?.click()}
                  className="w-full py-8 border-2 border-dashed border-black/20 hover:border-black/50 bg-[#F5F4EE] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-black/50" />
                  <span className="text-xs font-mono uppercase tracking-widest text-black font-bold">
                    Upload Right Runway Spread Photo
                  </span>
                  <span className="text-[10px] text-black/50 font-mono">
                    Aspect 16:10 (.jpg, .png, .webp, .avif)
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Right Tag</label>
                  <input
                    type="text"
                    value={settings.rightTag}
                    onChange={(e) =>
                      setSettings({ ...settings, rightTag: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Right Title</label>
                  <input
                    type="text"
                    value={settings.rightTitle}
                    onChange={(e) =>
                      setSettings({ ...settings, rightTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dual Logistics Callout Cards */}
          <div className="bg-white p-6 border border-black/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/10">
              <Sparkles className="w-4 h-4 text-black" />
              <h4 className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                4. Dual Logistics Callout Cards
              </h4>
            </div>

            {/* Card 1 */}
            <div className="p-4 bg-[#F5F4EE] border border-black/10 space-y-3">
              <span className="text-[10px] font-mono text-black/50 uppercase block font-bold">
                Callout Card 1 (e.g. Sizing Exchange Desk)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Tag</label>
                  <input
                    type="text"
                    value={settings.callout1Tag}
                    onChange={(e) =>
                      setSettings({ ...settings, callout1Tag: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Title</label>
                  <input
                    type="text"
                    value={settings.callout1Title}
                    onChange={(e) =>
                      setSettings({ ...settings, callout1Title: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Description</label>
                  <input
                    type="text"
                    value={settings.callout1Description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        callout1Description: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Link URL</label>
                  <input
                    type="text"
                    value={settings.callout1Link}
                    onChange={(e) =>
                      setSettings({ ...settings, callout1Link: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Link Text</label>
                  <input
                    type="text"
                    value={settings.callout1LinkText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        callout1LinkText: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-4 bg-[#F5F4EE] border border-black/10 space-y-3">
              <span className="text-[10px] font-mono text-black/50 uppercase block font-bold">
                Callout Card 2 (e.g. 64-District Courier Logistics)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Tag</label>
                  <input
                    type="text"
                    value={settings.callout2Tag}
                    onChange={(e) =>
                      setSettings({ ...settings, callout2Tag: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Title</label>
                  <input
                    type="text"
                    value={settings.callout2Title}
                    onChange={(e) =>
                      setSettings({ ...settings, callout2Title: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Description</label>
                  <input
                    type="text"
                    value={settings.callout2Description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        callout2Description: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Link URL</label>
                  <input
                    type="text"
                    value={settings.callout2Link}
                    onChange={(e) =>
                      setSettings({ ...settings, callout2Link: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase text-black/70 font-bold">Link Text</label>
                  <input
                    type="text"
                    value={settings.callout2LinkText}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        callout2LinkText: e.target.value,
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-black/15 text-black font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Live Studio Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 border border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-black" />
              <span className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                Live Studio Render
              </span>
            </div>
            <span className="text-[10px] font-mono text-black/50 uppercase">
              Section Simulation
            </span>
          </div>

          <div className="sticky top-24 bg-black border border-black/10 p-5 space-y-6 text-white overflow-hidden">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-white/50 uppercase block">
                {settings.tag}
              </span>
              <h3 className="font-sans font-bold text-xl uppercase tracking-tight text-white mt-1">
                {settings.title}
              </h3>
              <p className="text-[11px] font-mono text-white/60 mt-1 line-clamp-2">
                {settings.description}
              </p>
            </div>

            {/* Split Preview */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left Preview */}
              <div className="relative aspect-[3/4] bg-neutral-900 overflow-hidden border border-white/10">
                {settings.leftImage ? (
                  <Image
                    src={settings.leftImage}
                    alt="Left Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-white/30 text-center p-2">
                    No Left Photo
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2.5">
                  <span className="text-[8px] font-mono text-white/70 uppercase">
                    {settings.leftTag}
                  </span>
                  <span className="font-sans font-bold text-xs uppercase text-white line-clamp-1">
                    {settings.leftTitle}
                  </span>
                </div>
              </div>

              {/* Right Preview */}
              <div className="space-y-3 flex flex-col justify-between">
                <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden border border-white/10">
                  {settings.rightImage ? (
                    <Image
                      src={settings.rightImage}
                      alt="Right Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-white/30 text-center p-2">
                      No Right Photo
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2">
                    <span className="text-[8px] font-mono text-white/70 uppercase">
                      {settings.rightTag}
                    </span>
                    <span className="font-sans font-bold text-xs uppercase text-white line-clamp-1">
                      {settings.rightTitle}
                    </span>
                  </div>
                </div>

                {/* Callout Cards Mini */}
                <div className="p-2.5 bg-white/5 border border-white/10 text-[10px] space-y-0.5">
                  <span className="font-bold text-white block uppercase tracking-wider text-[9px]">
                    {settings.callout1Title}
                  </span>
                  <p className="text-white/60 text-[9px] line-clamp-1">
                    {settings.callout1Description}
                  </p>
                </div>

                <div className="p-2.5 bg-white/10 border border-white/20 text-[10px] space-y-0.5">
                  <span className="font-bold text-white block uppercase tracking-wider text-[9px]">
                    {settings.callout2Title}
                  </span>
                  <p className="text-white/70 text-[9px] line-clamp-1">
                    {settings.callout2Description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
