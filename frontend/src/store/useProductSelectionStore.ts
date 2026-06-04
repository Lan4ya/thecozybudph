import { create } from "zustand";
import type { ProductOption, ProductVariant } from "@cozybud/schemas";

type SelectedOptions = Record<string, string>;

type ProductSelectionState = {
  quantity: number;
  selectedOptions: SelectedOptions;
  selectedVariant: ProductVariant | null;
  cardMessages: string[];
  drawerOpen: boolean;

  increment: () => void;
  decrement: () => void;
  setQuantity: (value: number) => void;

  setSelectedOption: (optionName: string, value: string) => void;
  setSelectedOptions: (options: SelectedOptions) => void;

  setSelectedVariant: (variant: ProductVariant | null) => void;

  setCardMessage: (index: number, message: string) => void;

  reset: (options: ProductOption[]) => void;

  setDrawerOpen: (open: boolean) => void;
};

export const useProductSelectionStore = create<ProductSelectionState>(
  (set) => ({
    quantity: 1,
    selectedOptions: {},
    selectedVariant: null,
    cardMessages: [""],
    drawerOpen: false,

    increment: () =>
      set((state) => ({
        quantity: state.quantity + 1,
        cardMessages: [...state.cardMessages, ""],
      })),

    decrement: () =>
      set((state) => {
        if (state.quantity <= 1) return state;
        return {
          quantity: state.quantity - 1,
          cardMessages: state.cardMessages.slice(0, -1),
        };
      }),

    setQuantity: (value) => {
      const qty = value < 1 ? 1 : value;
      set((state) => {
        const newMessages = [...state.cardMessages];
        while (newMessages.length < qty) newMessages.push("");
        return { quantity: qty, cardMessages: newMessages };
      });
    },

    setSelectedOption: (optionName, value) =>
      set((state) => ({
        selectedOptions: { ...state.selectedOptions, [optionName]: value },
      })),

    setSelectedOptions: (options) => set({ selectedOptions: options }),

    setSelectedVariant: (variant) => set({ selectedVariant: variant }),

    setCardMessage: (index, message) =>
      set((state) => {
        const newMessages = [...state.cardMessages];
        newMessages[index] = message;
        return { cardMessages: newMessages };
      }),

    reset: (options) =>
      set(() => {
        const initial: Record<string, string> = {};

        for (const opt of options) {
          if (opt.values.length > 0) {
            initial[opt.name] = opt.values[0];
          }
        }

        return {
          quantity: 1,
          selectedOptions: initial,
          selectedVariant: null,
          cardMessages: [""],
        };
      }),

    setDrawerOpen: (open: boolean) => set({ drawerOpen: open }),
  }),
);
