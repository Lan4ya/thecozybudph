import type {
  Address,
  PaymentMethodTypes,
  ProductVariant,
} from "@cozybud/schemas";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CheckoutPaymentStatus =
  | "idle"
  | "verification"
  | "pending"
  | "paid"
  | "failed";

type Payment = {
  type?: PaymentMethodTypes;
  total?: number;
  status?: CheckoutPaymentStatus;
} | null;
type Source = "shop" | "cart" | null;

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

type CheckoutIds = {
  session?: string;
  order?: string;
  payment?: string;
} | null;

type CheckoutState = {
  reset: () => void;
  checkoutIds: CheckoutIds;
  setCheckoutIds: (id: CheckoutIds) => void;
  source: Source;
  setSource: (s: Source) => void;
  orderItemsUI: OrderItemUI[];
  setOrderItemsUI: (oi: OrderItemUI[]) => void;
  payment: Payment;
  setPayment: (p: Payment) => void;
  address: Address | null;
  setAddress: (a: Address) => void;
  shipping: Shipping;
  setShipping: (s: Shipping) => void;
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set, _get, api) => ({
      checkoutIds: null,
      source: null,
      orderItemsUI: [],
      address: null,
      shipping: null,
      payment: {
        type: undefined,
        total: undefined,
        status: "idle",
      },

      reset: () => {
        api.persist.clearStorage();
        set({
          checkoutIds: null,
          source: null,
          orderItemsUI: [],
          address: null,
          shipping: null,
          payment: null,
        });
      },

      setCheckoutIds: (patch) =>
        set((state) => {
          const prev = state.checkoutIds ?? {};
          return { checkoutIds: { ...prev, ...patch } };
        }),

      setSource: (source) => set({ source }),

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
        source: state.source,
        checkoutIds: state.checkoutIds,
        address: state.address,
        payment: state.payment,
      }),
    },
  ),
);
