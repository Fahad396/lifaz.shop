import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/layout/Header";
import { MenuDrawer } from "@/components/layout/MenuDrawer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "LIFAZ — Dhaka Atelier // Ready-To-Wear & Capsule Drops",
  description:
    "High-fashion architectural luxury, ready-to-wear runway releases, and limited capsule drops. Handcrafted in Dhaka, Bangladesh.",
  keywords: [
    "LIFAZ",
    "Dhaka Atelier",
    "Luxury Fashion Bangladesh",
    "Ready To Wear",
    "Capsule Drops",
    "BDT Fashion",
  ],
  authors: [{ name: "LIFAZ Atelier" }],
  openGraph: {
    title: "LIFAZ — Dhaka Atelier // Ready-To-Wear & Capsule Drops",
    description:
      "Architectural silhouettes, raw minimalism, and bespoke outerwear engineered in Dhaka.",
    siteName: "LIFAZ",
    locale: "en_BD",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[#F4F3ED] text-[#0A0A0A]">
        <AuthProvider>
          <CartProvider>
            <Header />
            <MenuDrawer />
            <CartDrawer />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
