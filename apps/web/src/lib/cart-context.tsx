"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { CartItem } from "./types";

export type AddToCartInput = Omit<CartItem, "id" | "quantity"> & {
  id?: string;
  quantity?: number;
};

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  isFreeShippingUnlocked: boolean;
  addToCart: (item: AddToCartInput) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  isMenuOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  toggleMenu: () => void;
}

const FREE_SHIPPING_THRESHOLD = 5000; // ৳5,000 threshold for complimentary delivery

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load cart from LocalStorage on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem("lifaz_cart_items");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to parse cart items from storage", e);
    }
  }, []);

  // Sync cart to LocalStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem("lifaz_cart_items", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart items to storage", e);
    }
  }, [items, isMounted]);

  const addToCart = useCallback(
    (item: AddToCartInput) => {
      const qtyToAdd = item.quantity || 1;
      const cartItemId = `${item.productId}-${item.size}-${item.color}`;

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === cartItemId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          const newQty = updated[existingIndex].quantity + qtyToAdd;
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: newQty,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ...item,
              id: cartItemId,
              quantity: qtyToAdd,
            },
          ];
        }
      });

      setIsCartOpen(true);
    },
    []
  );

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);
  const toggleMenu = useCallback(() => setIsMenuOpen((prev) => !prev), []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const freeShippingProgress = 0;
  const isFreeShippingUnlocked = false;

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        freeShippingThreshold: 0,
        freeShippingProgress: 0,
        isFreeShippingUnlocked: false,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        isMenuOpen,
        openMenu,
        closeMenu,
        toggleMenu,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
