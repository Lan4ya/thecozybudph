import type { CheckoutInput, ProductVariant } from "@TheCozyBud/types";
import type { SetStateAction } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Payment = CheckoutInput["payment"] | null;
type Source = "shop" | "cart";

type OrderItemUI = {
  quantity: number;
  cardMessages: string[];
  productId: string;
  variantId: string;

  attributes: ProductVariant["attributes"];
  name: string;
  priceCents: number;
  imageUrl: string;
};

type CheckoutState = {
  source: Source;
  orderItems: OrderItemUI[];
  payment: Payment;

  setOrderItems: (oi: OrderItemUI[]) => void;
  setPayment: (p: SetStateAction<Payment>) => void;
  setSource: (s: Source) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      source: "shop",
      quantity: 1,
      cardMessages: [""],
      selectedVariant: null,
      orderItems: [],
      payment: null,

      setSource: (source) => set({ source }),

      setOrderItems: (orderItems) => set({ orderItems }),

      setPayment: (paymentOrUpdater) =>
        set((state) => ({
          payment:
            typeof paymentOrUpdater === "function"
              ? paymentOrUpdater(state.payment)
              : paymentOrUpdater,
        })),
    }),
    {
      name: "checkout-details", // name for localStorage key
      partialize: (state) => ({
        // only persist specific fields
        orderItems: state.orderItems,
        source: state.source,
      }),
    },
  ),
);
