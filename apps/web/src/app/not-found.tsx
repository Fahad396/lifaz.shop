"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-24 bg-white text-black flex items-center justify-center text-center px-4">
      <div className="max-w-md space-y-4">
        <span className="text-[10px] font-bold tracking-khy-ultra text-black/50 uppercase block">
          404 // NOT FOUND
        </span>
        <h1 className="font-sans font-black text-4xl uppercase tracking-tight">
          PIECE NOT IN ARCHIVE
        </h1>
        <p className="text-xs text-black/60 leading-relaxed">
          The requested page or garment reference could not be located in our atelier database.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-block px-8 py-3.5 bg-black text-white text-xs font-bold tracking-khy-wide uppercase hover:bg-black/85 transition-colors"
          >
            RETURN TO HOMEPAGE
          </Link>
        </div>
      </div>
    </div>
  );
}
