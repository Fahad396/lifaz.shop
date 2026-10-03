"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMsg("VIP membership confirmed. Early drop access granted.");
        setEmail("");
      } else {
        setStatus("error");
        setMsg(data.error || "Subscription error.");
      }
    } catch {
      setStatus("error");
      setMsg("Connection error.");
    }
  };

  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-black text-white text-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-8">
        <span className="text-[10px] font-bold tracking-khy-ultra uppercase text-white/50 block mb-2 sm:mb-3">
          VIP DROP REGISTRY
        </span>

        <h2 className="font-sans font-black text-2xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-tight text-balance mb-3 sm:mb-4">
          EARLY DROP ACCESS
        </h2>

        <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed mb-6 sm:mb-8 text-balance px-4">
          Sign up to receive private access codes 1 hour before seasonal drop launches.
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
          <div className="flex border border-white/40 focus-within:border-white transition-colors">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent px-4 py-3.5 text-xs text-white placeholder-white/40 uppercase tracking-wider focus:outline-none font-medium"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="px-6 bg-white text-black text-xs font-bold tracking-khy-wide uppercase hover:bg-white/90 transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <span>JOIN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {status === "success" && (
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#C5A059] pt-2 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>{msg}</span>
            </div>
          )}

          {status === "error" && (
            <div className="text-xs text-[#9E2A2B] pt-2">{msg}</div>
          )}
        </form>
      </div>
    </section>
  );
}
