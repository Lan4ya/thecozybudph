import { create } from "zustand";
import type { CartItem } from "@TheCozyBud/types";
import type { SetStateAction } from "react";

type Expand<T> = {
  [K in keyof T]: T[K];
} & {};

export type CartItemUI = Expand<
  CartItem & {
    selected: boolean;
  }
>;

type CartState = {
  cartItems: CartItemUI[];
  allItemsSelected: boolean;
  isEditingCart: boolean;
  pendingDeleteIds: string[];

  setCartItems: (items: SetStateAction<CartItemUI[]>) => void;

  getCartItem: (cartItemid: string) => CartItemUI | undefined;

  increment: (cartItemId: string) => void;
  decrement: (cartItemId: string) => void;

  toggleItemSelection: (cartItemId: string) => void;
  toggleAllSelection: () => void;

  setIsEditingCart: (v: boolean) => void;

  setPendingDeleteIds: (ids: SetStateAction<string[]>) => void;
  reset: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
  cartItems: [],
  selectedOptions: {},
  allItemsSelected: false,
  isEditingCart: false,
  pendingDeleteIds: [],

  reset: () =>
    set({
      cartItems: [],
      allItemsSelected: false,
      isEditingCart: false,
      pendingDeleteIds: [],
    }),

  getCartItem: (cartItemId: string) =>
    get().cartItems.find((i) => i.id === cartItemId),

  setCartItems: (
    itemsOrUpdater: CartItemUI[] | ((prev: CartItemUI[]) => CartItemUI[]),
  ) =>
    set((state) => ({
      cartItems:
        typeof itemsOrUpdater === "function"
          ? itemsOrUpdater(state.cartItems)
          : [...itemsOrUpdater],
    })),

  increment: (cartItemId) =>
    set((state) => {
      const index = state.cartItems.findIndex((i) => i.id === cartItemId);
      if (index === -1) return state;

      const item = state.cartItems[index];

      const updatedItem = {
        ...item,
        quantity: item.quantity + 1,
        cardMessages: [...item.cardMessages, ""],
      };

      const cartItems = [...state.cartItems];
      cartItems[index] = updatedItem;

      return { cartItems };
    }),

  decrement: (cartItemId) =>
    set((state) => {
      const index = state.cartItems.findIndex((i) => i.id === cartItemId);
      if (index === -1) return state;

      const item = state.cartItems[index];
      if (item.quantity === 1) return state;

      const updatedItem = {
        ...item,
        quantity: item.quantity - 1,
        cardMessages: item.cardMessages.slice(0, -1),
      };

      const cartItems = [...state.cartItems];
      cartItems[index] = updatedItem;

      return { cartItems };
    }),

  toggleItemSelection: (cartItemId) =>
    set((state) => {
      const idx = state.cartItems.findIndex((item) => item.id === cartItemId);
      if (idx === -1) return state;

      const updated = [...state.cartItems];
      updated[idx] = { ...updated[idx], selected: !updated[idx].selected };

      const allSelected = updated.every((item) => item.selected);

      return {
        cartItems: updated,
        allItemsSelected: allSelected,
      };
    }),

  toggleAllSelection: () =>
    set((state) => {
      const allSelected = state.cartItems.every((item) => item.selected);

      return {
        cartItems: state.cartItems.map((item) => ({
          ...item,
          selected: !allSelected,
        })),
        allItemsSelected: !allSelected,
      };
    }),

  setIsEditingCart: (v) => set({ isEditingCart: v }),

  setPendingDeleteIds: (ids) =>
    set((state) => ({
      pendingDeleteIds:
        typeof ids === "function" ? ids(state.pendingDeleteIds) : ids,
    })),
}));
