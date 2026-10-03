"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Check,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Sliders,
  Type,
  Eye,
  AlertCircle,
} from "lucide-react";
import { HeroSettings } from "@/lib/types";

interface HeroStudioProps {
  hero: HeroSettings;
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

export function HeroStudio({ hero, passkey, onRefresh }: HeroStudioProps) {
  const [settings, setSettings] = useState<HeroSettings>(hero);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setSettings((prev) => ({ ...prev, image: base64 }));
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
      const res = await fetch("/api/settings/hero", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-key": passkey,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage("Homepage hero settings published successfully.");
        onRefresh();
      } else {
        alert(data.error || "Failed to update hero.");
      }
    } catch {
      alert("Network communication error.");
    } finally {
      setLoading(false);
    }
  };

  const getFilterStyle = () => {
    const brightness = (settings.photoBrightness ?? 90) / 100;
    const contrast = (settings.photoContrast ?? 105) / 100;

    let extra = "";
    switch (settings.photoFilter) {
      case "monochrome":
        extra = "grayscale(100%) ";
        break;
      case "warm":
        extra = "sepia(25%) saturate(120%) ";
        break;
      case "cool":
        extra = "hue-rotate(190deg) saturate(90%) ";
        break;
      case "contrast":
        extra = "contrast(135%) saturate(110%) ";
        break;
      case "none":
      default:
        break;
    }

    return `${extra}brightness(${brightness}) contrast(${contrast})`.trim();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 text-black">
      {/* Top Banner Header */}
      <div className="bg-white p-6 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-black" />
            <h3 className="font-sans font-bold text-lg uppercase tracking-wider text-black">
              Homepage Runway Studio
            </h3>
          </div>
          <p className="text-xs text-black/60 font-mono">
            Control full-bleed cover imagery, tone grading, camera zoom, and headline typography.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-black/85 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Check className="w-4 h-4" />
          <span>{loading ? "SAVING..." : "SAVE HOMEPAGE"}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
          ✓ {message}
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Hero Background Photography */}
          <div className="bg-white p-6 border border-black/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/10">
              <ImageIcon className="w-4 h-4 text-black" />
              <h4 className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                1. Homepage Background Imagery (Upload Only)
              </h4>
            </div>

            <p className="text-[11px] text-black/60 font-mono">
              Select or drop a high-resolution campaign photograph. Allowed formats:{" "}
              <span className="text-black font-bold font-mono">.JPG, .JPEG, .PNG, .WEBP, .AVIF</span>.
            </p>

            {uploadError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT_STRING}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Current Background Preview & Upload Trigger */}
            <div className="space-y-3">
              {settings.image ? (
                <div className="relative aspect-[16/9] w-full bg-black border border-black/10 overflow-hidden group">
                  <Image
                    src={settings.image}
                    alt="Active Hero Background"
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: settings.photoPosition || "center",
                      transform: `scale(${(settings.photoZoom ?? 100) / 100})`,
                      filter: getFilterStyle(),
                    }}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-white text-black text-xs font-bold tracking-widest uppercase hover:bg-neutral-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Replace Photo</span>
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-xs text-[10px] font-mono text-white border border-white/10">
                    Active Runway Photograph
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-12 border-2 border-dashed border-black/20 hover:border-black/50 bg-[#F5F4EE] flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <Upload className="w-6 h-6 text-black/50" />
                  <span className="text-xs font-mono uppercase tracking-widest text-black font-bold">
                    Upload Runway Background
                  </span>
                  <span className="text-[10px] text-black/50 font-mono">
                    Click to select JPG, PNG, WEBP, or AVIF
                  </span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-black/15 bg-[#F5F4EE] hover:bg-black/5 text-black text-[11px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose File from Disk</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Visual Adjustments & Filters */}
          <div className="bg-white p-6 border border-black/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/10">
              <Sliders className="w-4 h-4 text-black" />
              <h4 className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                2. Visual Adjustments & Tone Curve
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-black/70 uppercase font-bold">
                  <span>Zoom Scale</span>
                  <span className="text-black">{settings.photoZoom}%</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="150"
                  value={settings.photoZoom || 100}
                  onChange={(e) =>
                    setSettings({ ...settings, photoZoom: Number(e.target.value) })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-black/70 uppercase font-bold">
                  <span>Brightness</span>
                  <span className="text-black">{settings.photoBrightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.photoBrightness || 90}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      photoBrightness: Number(e.target.value),
                    })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-black/70 uppercase font-bold">
                  <span>Contrast</span>
                  <span className="text-black">{settings.photoContrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={settings.photoContrast || 105}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      photoContrast: Number(e.target.value),
                    })
                  }
                  className="w-full accent-black cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                  Focus Alignment
                </label>
                <select
                  value={settings.photoPosition || "center"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      photoPosition: e.target.value as "top" | "center" | "bottom",
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono uppercase focus:outline-hidden focus:border-black cursor-pointer"
                >
                  <option value="top">Top Focus (Upper Garment)</option>
                  <option value="center">Center Studio (Full Body)</option>
                  <option value="bottom">Bottom Focus (Silhouette)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                  Filter Preset
                </label>
                <select
                  value={settings.photoFilter || "none"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      photoFilter: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono uppercase focus:outline-hidden focus:border-black cursor-pointer"
                >
                  <option value="none">Natural Studio (No Tint)</option>
                  <option value="monochrome">High Contrast Monochrome</option>
                  <option value="warm">Warm Vintage Atelier</option>
                  <option value="cool">Cool Titanium Studio</option>
                  <option value="contrast">High Dynamic Punch</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Typography & Copy */}
          <div className="bg-white p-6 border border-black/10 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-black/10">
              <Type className="w-4 h-4 text-black" />
              <h4 className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                3. Typography & Copy
              </h4>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="showBannerTag"
                checked={settings.showBannerTag}
                onChange={(e) =>
                  setSettings({ ...settings, showBannerTag: e.target.checked })
                }
                className="w-4 h-4 accent-black cursor-pointer"
              />
              <label htmlFor="showBannerTag" className="text-xs font-mono uppercase tracking-wider text-black font-bold cursor-pointer">
                Display Capsule Banner Tag
              </label>
            </div>

            {settings.showBannerTag && (
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                  Banner Tag Text
                </label>
                <input
                  type="text"
                  value={settings.bannerTag}
                  onChange={(e) =>
                    setSettings({ ...settings, bannerTag: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono tracking-widest uppercase focus:outline-hidden focus:border-black"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                Monumental Headline
              </label>
              <input
                type="text"
                value={settings.title}
                onChange={(e) =>
                  setSettings({ ...settings, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-base font-sans font-bold tracking-tight uppercase focus:outline-hidden focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                Editorial Subtitle
              </label>
              <textarea
                rows={2}
                value={settings.subtitle}
                onChange={(e) =>
                  setSettings({ ...settings, subtitle: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono focus:outline-hidden focus:border-black"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={settings.ctaPrimaryText}
                  onChange={(e) =>
                    setSettings({ ...settings, ctaPrimaryText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono uppercase focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                  Primary Button Link Route
                </label>
                <input
                  type="text"
                  value={settings.ctaPrimaryLink}
                  onChange={(e) =>
                    setSettings({ ...settings, ctaPrimaryLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono focus:outline-hidden focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={settings.ctaSecondaryText}
                  onChange={(e) =>
                    setSettings({ ...settings, ctaSecondaryText: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono uppercase focus:outline-hidden focus:border-black"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-black/70 font-bold">
                  Secondary Button Link Route
                </label>
                <input
                  type="text"
                  value={settings.ctaSecondaryLink}
                  onChange={(e) =>
                    setSettings({ ...settings, ctaSecondaryLink: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F5F4EE] border border-black/15 text-black text-xs font-mono focus:outline-hidden focus:border-black"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Live View Frame (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 border border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-black" />
              <span className="font-mono text-xs uppercase tracking-widest text-black font-bold">
                Live Studio Render
              </span>
            </div>
            <span className="text-[10px] font-mono text-black/50 uppercase">
              100VH Simulation
            </span>
          </div>

          <div className="sticky top-24 bg-black border border-black/10 overflow-hidden relative min-h-[580px] flex flex-col justify-end p-6 text-center">
            {/* Background Preview */}
            <div className="absolute inset-0 z-0">
              {settings.image ? (
                <Image
                  src={settings.image}
                  alt="Hero Preview"
                  fill
                  className="object-cover transition-transform duration-300"
                  style={{
                    objectPosition: settings.photoPosition || "center",
                    transform: `scale(${(settings.photoZoom ?? 100) / 100})`,
                    filter: getFilterStyle(),
                  }}
                />
              ) : (
                <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-white/40 font-mono text-xs">
                  No Background Loaded
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/30" />
            </div>

            {/* Content Preview */}
            <div className="relative z-10 space-y-3 flex flex-col items-center">
              {settings.showBannerTag && (
                <span className="inline-block text-[9px] font-mono uppercase tracking-widest text-white/80">
                  {settings.bannerTag}
                </span>
              )}
              <h2 className="font-sans font-bold text-2xl sm:text-3xl uppercase tracking-tight leading-none text-white max-w-sm">
                {settings.title || "HEADLINE PREVIEW"}
              </h2>
              <p className="text-[11px] font-mono text-white/70 line-clamp-2 max-w-xs">
                {settings.subtitle || "Campaign description line."}
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs">
                <span className="w-full py-2 bg-white text-black text-[10px] font-bold tracking-widest uppercase text-center">
                  {settings.ctaPrimaryText || "SHOP NOW"}
                </span>
                {settings.ctaSecondaryText && (
                  <span className="w-full py-2 bg-transparent border border-white/60 text-white text-[10px] font-bold tracking-widest uppercase text-center">
                    {settings.ctaSecondaryText}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
