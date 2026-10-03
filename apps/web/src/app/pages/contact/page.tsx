"use client";

import React, { useState } from "react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("Order Status & Sizing");
  const [orderNumber, setOrderNumber] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ticketNumber, setTicketNumber] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          orderNumber,
          message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setTicketNumber(data.ticketNumber || `CONCIERGE-${Date.now().toString().slice(-6)}`);
      } else {
        setStatus("error");
        setErrorMsg(data.error || "Failed to submit inquiry.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error.");
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#F4F3ED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-monumental text-black/50 uppercase">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>Dhaka Atelier Desk</span>
          </div>
          <h1 className="font-editorial-serif text-3xl sm:text-4xl uppercase tracking-wide text-black">
            Concierge Contact Desk
          </h1>
          <p className="text-xs text-black/60 leading-relaxed">
            Our atelier client care team assists with sizing consultations, custom pattern requests, and courier dispatch adjustments.
          </p>
        </div>

        <div className="bg-white p-8 sm:p-12 rounded-xs border border-black/10 shadow-xs max-w-2xl mx-auto">
          {status === "success" ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-12 h-12 text-[#C5A059] mx-auto" />
              <h3 className="font-editorial-serif text-2xl uppercase tracking-wider text-black">
                Concierge Ticket Opened
              </h3>
              <p className="text-xs text-black/60 max-w-md mx-auto">
                Ticket Reference: <strong className="font-mono text-black">{ticketNumber}</strong>. An atelier representative will reply within 4 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                    Order Number (If Applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="LIFAZ-BD-XXXXXX"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                  Topic / Department
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                >
                  <option value="Order Status & Sizing">Order Status & Sizing Exchange</option>
                  <option value="Bespoke Garment Inquiry">Bespoke Garment & Tailoring</option>
                  <option value="VIP Drop Access">VIP Drop Early Access</option>
                  <option value="Wholesale & Press">Press & Editorial Inquiries</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-black/80 uppercase tracking-wider text-[10px]">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detail your inquiry or sizing requirements..."
                  className="w-full px-3.5 py-2.5 bg-[#F4F3ED] border border-black/15 rounded-xs focus:outline-none focus:border-black"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-[#9E2A2B]/10 text-[#9E2A2B] rounded-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-4 bg-[#0A0A0A] text-[#F4F3ED] text-xs font-medium tracking-monumental uppercase hover:bg-black/85 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {status === "loading" ? "Submitting Ticket..." : "Submit Inquiry to Concierge"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
