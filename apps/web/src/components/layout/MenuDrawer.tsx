"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function MenuDrawer() {
  const { isMenuOpen, closeMenu } = useCart();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  if (!mounted) return null;

  const PRIMARY_LINKS = [
    { label: "Drop 001", href: "/collections/drop-001" },
    { label: "Shop All", href: "/collections/all" },
    { label: "Outerwear", href: "/collections/outerwear" },
    { label: "Tailoring", href: "/collections/tailoring" },
    { label: "Dresses", href: "/collections/dresses" },
    { label: "Campaign", href: "/editorial" },
  ];

  const SECONDARY_LINKS = [
    { label: "Search Archive", href: "/search" },
    {
      label: user ? `VIP Account (${user.name.split(" ")[0]})` : "Client Account",
      href: "/account",
    },
    { label: "Courier & Delivery", href: "/pages/shipping" },
    { label: "Client Concierge", href: "/pages/contact" },
    { label: "Atelier Studio", href: "/admin" },
  ];

  return createPortal(
    <AnimatePresence>
      {isMenuOpen && (
        <div className="fixed inset-0 z-[9999] flex">
          {/* Subtle Dim Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={closeMenu}
          />

          {/* Minimalist Slide-in Drawer */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 flex flex-col justify-between h-full w-full max-w-[420px] bg-black text-white px-8 py-10 sm:px-12 sm:py-12 shadow-2xl border-r border-white/10"
          >
            {/* Header: Brand Name & Minimal Close Icon */}
            <div>
              <div className="flex items-center justify-between pb-8 border-b border-white/10">
                <span className="font-sans text-lg font-black uppercase tracking-[0.25em] text-white">
                  LIFAZ
                </span>
                <button
                  onClick={closeMenu}
                  aria-label="Close menu"
                  className="p-1.5 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Primary Links */}
              <nav className="pt-8 space-y-4">
                {PRIMARY_LINKS.map((item) => (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMenu}
                      className="block text-xl sm:text-2xl font-bold uppercase tracking-tight text-white/90 hover:text-white hover:translate-x-1 transition-all duration-200"
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </nav>
            </div>

            {/* Bottom Minimal Section: Secondary Links & Atelier Origin */}
            <div className="pt-8 border-t border-white/10 space-y-6">
              <div className="flex flex-col space-y-2.5">
                {SECONDARY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="text-xs uppercase tracking-wider text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="text-[10px] font-mono tracking-widest text-white/30 uppercase pt-2">
                Dhaka Atelier // Ready-To-Wear
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

