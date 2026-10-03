import React from "react";
import Link from "next/link";
import { Sparkles, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Atelier FAQ & Sizing Guide // LIFAZ",
  description: "Frequently asked questions regarding sizing, custom tailoring, and capsule drops.",
};

const FAQS = [
  {
    q: "How does sizing run at LIFAZ?",
    a: "Our silhouettes feature architectural, boxy proportions inspired by European ateliers. Standard sizing reflects intentional oversized drapes with dropped shoulder lines. If you prefer a closer, tailored fit, consider sizing down one step.",
  },
  {
    q: "How do I exchange my size if it doesn't fit?",
    a: "We operate a complimentary 7-Day Sizing Desk. Simply submit a ticket on our Concierge page with your order reference, and we will dispatch the correct size via doorstep exchange across all 64 districts.",
  },
  {
    q: "What payment methods are supported in Bangladesh?",
    a: "We accept Cash on Delivery (COD) nationwide, bKash Merchant, Nagad, as well as Visa, Mastercard, and American Express via 3D Secure checkout.",
  },
  {
    q: "Are capsule drops restocked once sold out?",
    a: "No. Capsule drops (e.g. Drop 001) are limited-edition numbered collections. Once an edition sells out, patterns are permanently retired to maintain archival exclusivity.",
  },
  {
    q: "Can I book a private fitting consultation in Dhaka?",
    a: "Yes. VIP clients can request private salon appointments through our Concierge Desk for custom tailoring and lookbook previews.",
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#F4F3ED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-monumental text-black/50 uppercase">
            <Sparkles className="w-3 h-3 text-[#C5A059]" />
            <span>Atelier Knowledge Base</span>
          </div>
          <h1 className="font-editorial-serif text-3xl sm:text-4xl uppercase tracking-wide text-black">
            Frequently Asked Questions
          </h1>
          <p className="text-xs text-black/60 leading-relaxed">
            Everything you need to know about our tailoring standards, capsule drop releases, and client care services.
          </p>
        </div>

        {/* FAQ List */}
        <div className="bg-white p-8 sm:p-12 rounded-xs border border-black/10 shadow-xs divide-y divide-black/10">
          {FAQS.map((faq, i) => (
            <div key={i} className="py-6 first:pt-0 last:pb-0 space-y-2">
              <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black">
                {faq.q}
              </h3>
              <p className="text-xs text-black/70 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="text-center p-8 bg-[#EFECE6] rounded-xs border border-black/10 space-y-2">
          <h4 className="font-editorial-serif text-base uppercase tracking-wider text-black">
            Have a Bespoke Sizing Question?
          </h4>
          <p className="text-xs text-black/60">
            Our atelier specialists are available 7 days a week to advise on fit and styling.
          </p>
          <Link
            href="/pages/contact"
            className="inline-block mt-3 px-6 py-2.5 bg-black text-white text-xs font-medium tracking-monumental uppercase hover:bg-black/80 transition-colors"
          >
            Contact Atelier Desk
          </Link>
        </div>
      </div>
    </div>
  );
}
