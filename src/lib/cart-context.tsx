"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { MenuItem } from "@/lib/types/order";

export type CartItem = {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
};

type CartContextType = {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
  addItem: (menuItem: MenuItem, quantity?: number, notes?: string) => void;
  removeItem: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNotes: (menuItemId: string, notes: string) => void;
  clearCart: () => void;
  setTableInfo: (restaurantId: string, tableId: string) => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);

  const addItem = useCallback(
    (menuItem: MenuItem, quantity: number = 1, notes?: string) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.menuItem.id === menuItem.id
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex].quantity += quantity;
          return updated;
        }

        return [...prev, { menuItem, quantity, notes }];
      });
    },
    []
  );

  const removeItem = useCallback((menuItemId: string) => {
    setItems((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  }, []);

  const updateQuantity = useCallback((menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) =>
        prev.filter((item) => item.menuItem.id !== menuItemId)
      );
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.menuItem.id === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  }, []);

  const updateNotes = useCallback((menuItemId: string, notes: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId ? { ...item, notes } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const setTableInfo = useCallback((restId: string, tblId: string) => {
    setRestaurantId(restId);
    setTableId(tblId);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        tableId,
        addItem,
        removeItem,
        updateQuantity,
        updateNotes,
        clearCart,
        setTableInfo,
        totalItems,
        subtotal,
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
