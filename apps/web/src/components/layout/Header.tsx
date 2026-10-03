"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function Header() {
  const { openMenu, openCart, itemCount } = useCart();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md text-black border-b border-black/10 py-3.5 shadow-xs"
          : "bg-gradient-to-b from-black/60 via-black/20 to-transparent text-white py-4 sm:py-5"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-3 items-center">
          {/* Left: Menu & Direct Capsule Link */}
          <div className="flex items-center justify-start gap-4 sm:gap-6 min-w-0">
            <button
              onClick={openMenu}
              className="flex items-center gap-2 text-xs uppercase font-bold tracking-khy-wide hover:opacity-70 transition-opacity cursor-pointer py-1.5 flex-shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 flex-shrink-0" />
              <span>MENU</span>
            </button>

            <nav className="hidden xl:flex items-center gap-6 text-[11px] font-bold uppercase tracking-khy-wide">
              <Link
                href="/collections/drop-001"
                className="hover:opacity-70 transition-opacity whitespace-nowrap"
              >
                DROP 001
              </Link>
              <Link
                href="/collections/all"
                className="hover:opacity-70 transition-opacity opacity-80"
              >
                SHOP ALL
              </Link>
            </nav>
          </div>

          {/* Center: Brand Identity Logo (Cleanly centered, zero conflict) */}
          <div className="flex items-center justify-center text-center min-w-0">
            <Link href="/" className="inline-block group py-1">
              <span className="font-sans text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] block leading-none truncate">
                LIFAZ
              </span>
            </Link>
          </div>

          {/* Right: Search, Account, Bag */}
          <div className="flex items-center justify-end gap-3 sm:gap-6 min-w-0">
            <Link
              href="/search"
              aria-label="Search"
              className="hover:opacity-70 transition-opacity flex items-center gap-1.5 text-xs font-bold tracking-khy-wide uppercase py-1.5 flex-shrink-0"
            >
              <Search className="w-4 h-4 flex-shrink-0" />
              <span className="hidden lg:inline">SEARCH</span>
            </Link>

            <Link
              href="/account"
              aria-label="Account & Order Tracking"
              className="hidden md:flex items-center gap-1.5 text-xs font-bold tracking-khy-wide uppercase py-1.5 hover:opacity-70 transition-opacity flex-shrink-0"
            >
              <User className="w-4 h-4 flex-shrink-0" />
              <span className="hidden lg:inline">
                {user ? user.name.split(" ")[0] : "ACCOUNT"}
              </span>
            </Link>

            <button
              onClick={openCart}
              aria-label="Shopping Bag"
              className="flex items-center gap-1 sm:gap-1.5 hover:opacity-70 transition-opacity cursor-pointer text-xs font-bold tracking-khy-wide uppercase py-1.5 flex-shrink-0"
            >
              <ShoppingBag className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">BAG ({itemCount})</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
