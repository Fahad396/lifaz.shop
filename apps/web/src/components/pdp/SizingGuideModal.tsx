"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ZoomOut, Ruler, Sparkles, Check } from "lucide-react";
import { Product } from "@/lib/types";

interface SizingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

const DEFAULT_MEASUREMENTS = [
  { size: "XS", chestInches: 38, lengthInches: 45, shoulderInches: 18, sleeveInches: 24, waistInches: 30 },
  { size: "S", chestInches: 40, lengthInches: 46, shoulderInches: 18.5, sleeveInches: 24.5, waistInches: 32 },
  { size: "M", chestInches: 42, lengthInches: 47, shoulderInches: 19, sleeveInches: 25, waistInches: 34 },
  { size: "L", chestInches: 44, lengthInches: 48, shoulderInches: 19.5, sleeveInches: 25.5, waistInches: 36 },
  { size: "XL", chestInches: 46, lengthInches: 49, shoulderInches: 20, sleeveInches: 26, waistInches: 38 },
];

export function SizingGuideModal({
  isOpen,
  onClose,
  product,
}: SizingGuideModalProps) {
  const [activeTab, setActiveTab] = useState<"blueprint" | "matrix">("matrix");
  const [unit, setUnit] = useState<"IN" | "CM">("IN");
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const measurements = product.measurements || DEFAULT_MEASUREMENTS;

  const convertUnit = (valInches?: number) => {
    if (valInches === undefined) return "-";
    if (unit === "IN") return `${valInches}"`;
    return `${Math.round(valInches * 2.54)} cm`;
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-2xl max-h-[85vh] bg-[#F4F3ED] text-[#0A0A0A] rounded-xs shadow-2xl border border-black/15 flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10 bg-[#EFECE6]">
              <div className="flex items-center gap-2">
                <Ruler className="w-4 h-4 text-black" />
                <h3 className="font-editorial-serif text-lg tracking-wider uppercase text-black">
                  Garment Fit & Sizing Blueprint
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-black/60 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Switcher & Unit Toggle */}
            <div className="px-6 py-3 border-b border-black/10 bg-white flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab("matrix")}
                  className={`pb-1 font-medium tracking-monumental uppercase transition-colors cursor-pointer ${
                    activeTab === "matrix"
                      ? "border-b-2 border-black text-black"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  Body Measurement Matrix
                </button>
                <button
                  onClick={() => setActiveTab("blueprint")}
                  className={`pb-1 font-medium tracking-monumental uppercase transition-colors cursor-pointer ${
                    activeTab === "blueprint"
                      ? "border-b-2 border-black text-black"
                      : "text-black/50 hover:text-black"
                  }`}
                >
                  Garment Blueprint
                </button>
              </div>

              {activeTab === "matrix" && (
                <div className="flex items-center bg-black/5 p-0.5 rounded-xs border border-black/10">
                  <button
                    onClick={() => setUnit("IN")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded-xs transition-colors cursor-pointer ${
                      unit === "IN" ? "bg-black text-white" : "text-black/60"
                    }`}
                  >
                    IN
                  </button>
                  <button
                    onClick={() => setUnit("CM")}
                    className={`px-2.5 py-1 text-[10px] font-mono font-semibold rounded-xs transition-colors cursor-pointer ${
                      unit === "CM" ? "bg-black text-white" : "text-black/60"
                    }`}
                  >
                    CM
                  </button>
                </div>
              )}
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Tailoring & Model Advisory */}
              <div className="p-4 bg-[#EFECE6] rounded-xs border border-black/10 text-xs">
                <div className="flex items-center gap-1.5 font-medium tracking-monumental uppercase text-black mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Atelier Fit Advisory</span>
                </div>
                <p className="text-black/70 leading-relaxed">
                  {product.sizeChartNotes ||
                    "Model is 6'1\" (185cm) wearing Size M. Features an architectural boxy drape with dropped shoulder seams. Order your standard size for intentional relaxed drape, or size down for tailored fit."}
                </p>
              </div>

              {activeTab === "matrix" ? (
                /* Matrix Table */
                <div className="border border-black/10 rounded-xs overflow-hidden">
                  <table className="w-full text-left text-xs divide-y divide-black/10">
                    <thead className="bg-[#0A0A0A] text-[#F4F3ED]">
                      <tr>
                        <th className="px-4 py-3 font-medium tracking-wider uppercase">Size</th>
                        <th className="px-4 py-3 font-medium tracking-wider uppercase">Chest</th>
                        <th className="px-4 py-3 font-medium tracking-wider uppercase">Length</th>
                        <th className="px-4 py-3 font-medium tracking-wider uppercase">Shoulder</th>
                        <th className="px-4 py-3 font-medium tracking-wider uppercase">Sleeve</th>
                        <th className="px-4 py-3 font-medium tracking-wider uppercase">Waist</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5 bg-white font-mono">
                      {measurements.map((row) => (
                        <tr key={row.size} className="hover:bg-black/5 transition-colors">
                          <td className="px-4 py-3 font-bold text-black">{row.size}</td>
                          <td className="px-4 py-3 text-black/80">{convertUnit(row.chestInches)}</td>
                          <td className="px-4 py-3 text-black/80">{convertUnit(row.lengthInches)}</td>
                          <td className="px-4 py-3 text-black/80">{convertUnit(row.shoulderInches)}</td>
                          <td className="px-4 py-3 text-black/80">{convertUnit(row.sleeveInches)}</td>
                          <td className="px-4 py-3 text-black/80">{convertUnit(row.waistInches)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Blueprint Interactive Image */
                <div className="relative border border-black/10 rounded-xs bg-white p-4 flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-3 text-xs text-black/60">
                    <span>Architectural Measurement Diagram</span>
                    <button
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-black hover:text-[#C5A059] transition-colors cursor-pointer"
                    >
                      {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                      <span>{isZoomed ? "Reset Zoom (100%)" : "Zoom Diagram (150%)"}</span>
                    </button>
                  </div>

                  <div className="relative w-full h-[320px] overflow-hidden rounded-xs bg-[#EFECE6] flex items-center justify-center">
                    <Image
                      src={
                        product.sizeChartImage ||
                        "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=800&auto=format&fit=crop"
                      }
                      alt="Size Blueprint"
                      fill
                      className={`object-contain transition-transform duration-300 ${
                        isZoomed ? "scale-150 cursor-zoom-out" : "scale-100 cursor-zoom-in"
                      }`}
                      onClick={() => setIsZoomed(!isZoomed)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-black/10 bg-[#EFECE6] flex items-center justify-between text-xs text-black/70">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#C5A059]" />
                <span>Complimentary 7-Day Sizing Swap Desk</span>
              </span>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#0A0A0A] text-[#F4F3ED] font-medium tracking-monumental uppercase rounded-xs hover:bg-black/80 transition-colors cursor-pointer"
              >
                Close Blueprint
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
