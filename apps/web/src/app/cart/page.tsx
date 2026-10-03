"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/currency";

export default function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#F4F3ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-2xl mb-8">
          <span className="text-[10px] tracking-monumental text-black/50 uppercase block mb-1">
            Selected Garments
          </span>
          <h1 className="font-editorial-serif text-3xl sm:text-4xl uppercase tracking-wide text-black">
            Shopping Bag ({itemCount})
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center bg-[#EFECE6] border border-black/10 rounded-xs p-8 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-7 h-7 text-black/40" />
            </div>
            <h3 className="font-editorial-serif text-2xl uppercase tracking-wider mb-2">
              Your Bag is Empty
            </h3>
            <p className="text-xs text-black/60 max-w-sm mx-auto mb-6">
              You have not added any pieces to your bag yet. Explore the ready-to-wear archive.
            </p>
            <Link
              href="/collections/all"
              className="inline-block px-8 py-3.5 bg-[#0A0A0A] text-[#F4F3ED] text-xs font-medium tracking-monumental uppercase hover:bg-black/80 transition-colors"
            >
              Discover Archive
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Items Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Items Table */}
              <div className="bg-white border border-black/10 rounded-xs divide-y divide-black/10 overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                    {/* Item Details */}
                    <div className="flex gap-4 items-center">
                      <div className="relative w-20 h-26 bg-[#EFECE6] overflow-hidden rounded-xs border border-black/10 flex-shrink-0">
                        <Image
                          src={item.image || "https://images.unsplash.com/photo-1548883354-7622d03aca27?q=80&w=400&auto=format&fit=crop"}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium uppercase tracking-wide text-black">
                          {item.title}
                        </h4>
                        <div className="text-xs text-black/60">
                          Size: <span className="font-semibold text-black">{item.size}</span>
                          {item.color && (
                            <span> // Color: <span className="font-semibold text-black">{item.color}</span></span>
                          )}
                        </div>
                        <div className="text-xs font-mono font-medium text-black pt-1">
                          {formatPrice(item.price)} each
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                      <div className="flex items-center border border-black/20 rounded-xs bg-[#F4F3ED]">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 hover:bg-black/5 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 text-xs font-mono font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 hover:bg-black/5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-black">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-[#9E2A2B] hover:opacity-75 transition-opacity mt-0.5 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-2">
                <Link
                  href="/collections/all"
                  className="text-xs uppercase tracking-monumental text-black/70 hover:text-black transition-colors"
                >
                  ← Continue Exploring
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs uppercase tracking-monumental text-[#9E2A2B] hover:opacity-75 transition-opacity cursor-pointer"
                >
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Right Summary Column */}
            <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-xs border border-black/10 space-y-6">
              <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black pb-4 border-b border-black/10">
                Order Summary
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-black/70">
                  <span>Bag Subtotal</span>
                  <span className="font-mono">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-black/70">
                  <span>Insured Courier Shipping</span>
                  <span className="font-mono">৳60 / ৳130 (At Checkout)</span>
                </div>
                <div className="flex items-center justify-between text-black/70">
                  <span>Estimated VAT</span>
                  <span>Included</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-black pt-4 border-t border-black/10">
                  <span>Total (BDT)</span>
                  <span className="font-mono text-lg">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full py-4 bg-[#0A0A0A] text-[#F4F3ED] text-xs font-medium tracking-monumental uppercase hover:bg-black/85 transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="space-y-2 text-[11px] text-black/60 pt-4 border-t border-black/10">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Insured Doorstep Delivery across 64 Districts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Cash on Delivery (COD) & bKash Accepted</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
