"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";

export function CartDrawer() {
  const {
    isCartOpen,
    closeCart,
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCartOpen]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col h-full w-full max-w-[460px] bg-white text-black shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
              <span className="text-xs font-bold tracking-khy-wide uppercase">
                SHOPPING BAG ({itemCount})
              </span>
              <button
                onClick={closeCart}
                aria-label="Close bag"
                className="p-1 text-black/60 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-black/10">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <ShoppingBag className="w-8 h-8 text-black/30 mb-3" />
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wide mb-1">
                    YOUR BAG IS EMPTY
                  </h4>
                  <p className="text-xs text-black/60 max-w-[220px] mb-6">
                    Explore the latest ready-to-wear pieces and capsule drops.
                  </p>
                  <Link
                    href="/collections/all"
                    onClick={closeCart}
                    className="px-6 py-3 bg-black text-white text-xs font-bold tracking-khy-wide uppercase hover:bg-black/85 transition-colors"
                  >
                    SHOP COLLECTION
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="py-5 flex gap-4">
                    <div className="relative w-20 h-26 bg-[#F3F3F3] flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.image || "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=400&auto=format&fit=crop"}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wide line-clamp-1">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-black/40 hover:text-black p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-[11px] text-black/60 mt-0.5">
                          SIZE: <span className="font-bold text-black">{item.size}</span>
                        </div>
                        <div className="text-xs font-medium text-black mt-1">
                          {formatPrice(item.price)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center border border-black/30 bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-black/5 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-black/5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold font-mono">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-black/10 bg-[#F9F9F9] space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-black/70">
                    <span>SUBTOTAL</span>
                    <span className="font-mono font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-black/70">
                    <span>SHIPPING</span>
                    <span className="font-mono">৳60 / ৳130 (At Checkout)</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-black text-black pt-2 border-t border-black/10">
                    <span>ESTIMATED TOTAL</span>
                    <span className="font-mono text-base">{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white text-xs font-bold tracking-khy-wide uppercase hover:bg-black/85 transition-colors"
                >
                  <span>CHECKOUT</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-center text-[10px] text-black/50 uppercase tracking-wider">
                  64-District Insured Shipping // 7-Day Sizing Desk
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
