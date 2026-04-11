import type {
  Address,
  CreatePaymentInput,
  PaymentMethodTypes,
  ProductVariant,
} from "@TheCozyBud/types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Payment = { type: PaymentMethodTypes; total: number };
type Source = "shop" | "cart";

const CHECKOUT_SESSION_NAME = "checkout-details";

export type OrderItemUI = {
  quantity: number;
  cardMessages: string[];
  productId: string;
  variantId: string;

  attributes: ProductVariant["attributes"];
  name: string;
  priceCents: number;
  imageUrl: string;
};

type Shipping = {
  fee: number;
  serviceType: string;
} | null;

type CheckoutState = {
  source: Source | null;
  orderItems: OrderItemUI[];
  payment: Partial<Payment> | null;
  address: Address | null;
  shipping: Shipping;

  setOrderItems: (oi: OrderItemUI[]) => void;
  setPayment: (p: Partial<Payment>) => void;
  setSource: (s: Source) => void;
  setAddress: (a: Address) => void;
  setShipping: (s: Shipping) => void;

  sessionId: string | null;
  setSessionId: (id: string) => void;

  reset: () => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      source: null,
      orderItems: [],
      address: null,
      shipping: null,
      payment: null,
      sessionId: "",

      reset: () => {
        set({ orderItems: [], source: null, payment: null, sessionId: "" });
        sessionStorage.removeItem(CHECKOUT_SESSION_NAME);
      },

      setSource: (source) => set({ source }),

      setAddress: (address) => set({ address }),

      setSessionId: (id) => set({ sessionId: id }),

      setShipping: (shipping) => set({ shipping }),

      setOrderItems: (orderItems) => set({ orderItems }),

      setPayment: (patch) =>
        set((state) => {
          const prev = state.payment ?? {};
          return {
            payment: {
              ...prev,
              ...patch,
            },
          };
        }),
    }),
    {
      name: CHECKOUT_SESSION_NAME,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        // only persist specific fields
        orderItems: state.orderItems,
        source: state.source,
        sessionId: state.sessionId,
        address: state.address,
      }),
    },
  ),
);
