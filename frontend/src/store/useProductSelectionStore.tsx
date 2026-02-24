import { create } from "zustand";
import type { ProductVariant } from "@TheCozyBud/types";

type SelectedOptions = Record<string, string>;

type ProductSelectionState = {
  quantity: number;
  selectedOptions: SelectedOptions;
  selectedVariant: ProductVariant | null;
  cardMessages: string[]; // now an array

  increment: () => void;
  decrement: () => void;
  setQuantity: (value: number) => void;

  setSelectedOption: (optionName: string, value: string) => void;
  setSelectedOptions: (options: SelectedOptions) => void;

  setSelectedVariant: (variant: ProductVariant | null) => void;

  setCardMessage: (index: number, message: string) => void;

  reset: () => void;
};

export const useProductSelectionStore = create<ProductSelectionState>(
  (set) => ({
    quantity: 1,
    selectedOptions: {},
    selectedVariant: null,
    cardMessages: [""],

    increment: () => {
      set((state) => {
        const newQuantity = state.quantity + 1;
        const newMessages = [...state.cardMessages];
        while (newMessages.length < newQuantity) newMessages.push("");
        return { quantity: newQuantity, cardMessages: newMessages };
      });
    },

    decrement: () => {
      set((state) => {
        const newQuantity = Math.max(1, state.quantity - 1);
        const newMessages = state.cardMessages.slice(0, newQuantity);
        return { quantity: newQuantity, cardMessages: newMessages };
      });
    },

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

    reset: () =>
      set({
        quantity: 1,
        selectedOptions: {},
        selectedVariant: null,
        cardMessages: [""],
      }),
  }),
);
