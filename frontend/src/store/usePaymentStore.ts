import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PaymentState = {
  reset: () => void;
  willPay: boolean;
  setWillPay: (b: boolean) => void;
};

export const usePaymentStore = create<PaymentState>()(
  persist(
    (set, _get, api) => ({
      willPay: false,

      reset: () => {
        api.persist.clearStorage();
        set({ willPay: false });
      },

      setWillPay: (willPay) => set({ willPay }),
    }),
    {
      name: "payment-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        willPay: state.willPay,
      }),
    },
  ),
);
