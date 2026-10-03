"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 pt-16 pb-12 text-xs">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand & Identity */}
          <div className="lg:col-span-2 space-y-3">
            <Link href="/" className="inline-block">
              <span className="font-sans text-3xl font-extrabold uppercase tracking-[0.2em] block">
                LIFAZ
              </span>
            </Link>
            <p className="text-white/60 leading-relaxed max-w-sm">
              Dhaka Atelier // Ready-To-Wear & Capsule Drops. Architectural luxury, bonded faux leather, and sculpted silhouettes.
            </p>
            <div className="text-[10px] text-white/40 font-mono pt-2 uppercase tracking-khy-wide">
              DHAKA // 23.8103° N, 90.4125° E
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-3">
            <h4 className="font-bold tracking-khy-wide uppercase text-white">
              COLLECTIONS
            </h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <Link href="/collections/all" className="hover:text-white transition-colors">
                  ALL PIECES
                </Link>
              </li>
              <li>
                <Link href="/collections/drop-001" className="hover:text-white transition-colors">
                  DROP 001: FAUX LEATHER
                </Link>
              </li>
              <li>
                <Link href="/collections/outerwear" className="hover:text-white transition-colors">
                  OUTERWEAR
                </Link>
              </li>
              <li>
                <Link href="/collections/tailoring" className="hover:text-white transition-colors">
                  TAILORING
                </Link>
              </li>
              <li>
                <Link href="/collections/dresses" className="hover:text-white transition-colors">
                  DRESSES
                </Link>
              </li>
              <li>
                <Link href="/editorial" className="hover:text-white transition-colors">
                  CAMPAIGN LOOKBOOK
                </Link>
              </li>
            </ul>
          </div>

          {/* Client Care */}
          <div className="space-y-3">
            <h4 className="font-bold tracking-khy-wide uppercase text-white">
              CLIENT CARE
            </h4>
            <ul className="space-y-2 text-white/60">
              <li>
                <Link href="/pages/shipping" className="hover:text-white transition-colors">
                  64-DISTRICT COURIER
                </Link>
              </li>
              <li>
                <Link href="/pages/faq" className="hover:text-white transition-colors">
                  7-DAY SIZING EXCHANGE
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  ORDER DISPATCH TRACKER
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="hover:text-white transition-colors">
                  CONCIERGE CONTACT DESK
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ATELIER STUDIO</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Country & Currency */}
          <div className="space-y-3">
            <h4 className="font-bold tracking-khy-wide uppercase text-white">
              LOCATION & CURRENCY
            </h4>
            <p className="text-white/60 leading-relaxed">
              Serving Dhaka, Bangladesh & Worldwide. All prices inclusive of VAT.
            </p>
            <div className="pt-2">
              <span className="px-3 py-1.5 bg-white/10 border border-white/20 text-white font-mono text-[11px] uppercase tracking-wider inline-block">
                BANGLADESH (BDT ৳)
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/50">
          <div className="uppercase tracking-khy-wide">
            © 2026 LIFAZ ATELIER. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] uppercase">
            <span>CASH ON DELIVERY</span>
            <span>//</span>
            <span>BKASH</span>
            <span>//</span>
            <span>NAGAD</span>
            <span>//</span>
            <span>VISA & MASTERCARD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
