import type {
  AddressData,
  PaymentMethodTypes,
  ProductVariant,
} from "@cozybud/schemas";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CheckoutStatus = "idle" | "active" | "completed";

type Payment = {
  type?: PaymentMethodTypes;
  total?: number;
} | null;

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
  quotationId: string;
  fee: number;
  serviceType: string;
} | null;

type Checkout = {
  sessionId?: string;
  paymentId?: string;
  status?: CheckoutStatus;
} | null;

type CheckoutState = {
  reset: () => void;
  checkout: Checkout;
  setCheckout: (ck: Checkout) => void;

  fromCart: boolean;
  setFromCart: (s: boolean) => void;

  orderItemsUI: OrderItemUI[];
  setOrderItemsUI: (oi: OrderItemUI[]) => void;

  payment: Payment;
  setPayment: (p: Payment) => void;

  address: AddressData | null;
  setAddress: (a: AddressData) => void;

  shipping: Shipping;
  setShipping: (s: Shipping) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, _get, api) => ({
      checkout: null,
      fromCart: false,
      orderItemsUI: [],
      address: null,
      shipping: null,
      payment: {
        type: undefined,
        total: undefined,
      },

      reset: () => {
        api.persist.clearStorage();
        set({
          checkout: null,
          fromCart: false,
          orderItemsUI: [],
          address: null,
          shipping: null,
          payment: null,
        });
      },

      setCheckout: (patch) =>
        set((state) => {
          const prev = state.checkout ?? {};
          return { checkout: { ...prev, ...patch } };
        }),

      setFromCart: (fromCart) => set({ fromCart }),

      setAddress: (address) => set({ address }),

      setShipping: (shipping) => set({ shipping: shipping }),

      setOrderItemsUI: (orderItems) => set({ orderItemsUI: orderItems }),

      setPayment: (patch) =>
        set((state) => {
          const prev = state.payment ?? {
            type: undefined,
            total: undefined,
            status: "idle",
          };

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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // only persist specific fields
        orderItemsUI: state.orderItemsUI,
        fromCart: state.fromCart,
        checkout: state.checkout,
        address: state.address,
        payment: state.payment,
      }),
    },
  ),
);
