import React from "react";
import Link from "next/link";
import { Truck, ShieldCheck, Clock, MapPin } from "lucide-react";

export const metadata = {
  title: "64-District Courier Shipping Matrix // LIFAZ Atelier",
  description: "Nationwide insured courier transit rates and delivery timelines across Bangladesh.",
};

export default function ShippingPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 bg-[#F4F3ED]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[10px] tracking-monumental text-black/50 uppercase block">
            Nationwide Logistics
          </span>
          <h1 className="font-editorial-serif text-3xl sm:text-4xl uppercase tracking-wide text-black">
            64-District Courier Matrix
          </h1>
          <p className="text-xs text-black/60 leading-relaxed">
            Every LIFAZ acquisition is insured and packaged in our signature tamper-evident dust cases for secure delivery across Bangladesh.
          </p>
        </div>

        {/* Matrix Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-xs border border-black/10 space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#EFECE6] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-black" />
            </div>
            <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black">
              Inside Dhaka Delivery
            </h3>
            <div className="text-2xl font-mono font-bold text-black">
              ৳ 60 <span className="text-xs font-normal text-black/50">/ (1–3 Days)</span>
            </div>
            <p className="text-xs text-black/60 leading-relaxed">
              Standard door-to-door delivery within 1 to 3 business days across all Dhaka metropolitan areas.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xs border border-black/10 space-y-3">
            <div className="w-10 h-10 rounded-xs bg-[#EFECE6] flex items-center justify-center">
              <Truck className="w-5 h-5 text-black" />
            </div>
            <h3 className="font-editorial-serif text-lg uppercase tracking-wider text-black">
              Outside Dhaka (All Over Bangladesh)
            </h3>
            <div className="text-2xl font-mono font-bold text-black">
              ৳ 130 <span className="text-xs font-normal text-black/50">/ Insured (2–3 Days)</span>
            </div>
            <p className="text-xs text-black/60 leading-relaxed">
              Insured courier delivery across all 64 districts nationwide (Chattogram, Sylhet, Rajshahi, Khulna, Barishal, Rangpur, Mymensingh, etc.) within 2–3 business days.
            </p>
          </div>
        </div>

        {/* Policies */}
        <div className="bg-white p-8 rounded-xs border border-black/10 space-y-6 text-xs text-black/80 leading-relaxed">
          <h3 className="font-editorial-serif text-xl uppercase tracking-wider text-black pb-3 border-b border-black/10">
            Logistics & Inspection Protocol
          </h3>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-black">
                1. Cash on Delivery (COD) Doorstep Inspection
              </h4>
              <p className="text-black/60 mt-1">
                Clients selecting Cash on Delivery are welcome to inspect the outer garment dust seal before completing cash hand-over to the courier officer.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-black">
                2. 7-Day Sizing Exchange Desk
              </h4>
              <p className="text-black/60 mt-1">
                If the silhouette requires a different size, notify our concierge within 7 calendar days. Our courier will pick up the garment and hand over your replacement size simultaneously.
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-black">
                3. Damaged or Tampered Shipments
              </h4>
              <p className="text-black/60 mt-1">
                All garments travel with 100% insured transit value. In the rare event of transit damage, an immediate replacement piece is prioritized from our reserve archive.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
