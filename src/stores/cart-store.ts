import { create } from 'zustand';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  isDrawerOpen: boolean;
  setItems: (items: CartItem[], totalAmount: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  totalAmount: 0,
  itemCount: 0,
  isDrawerOpen: false,

  setItems: (items, totalAmount) =>
    set({
      items,
      totalAmount,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    }),

  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),
}));
