import { apiClient } from "@/lib/axios/client";
import type { CheckoutInput, CreateOrderRes } from "@TheCozyBud/types";

export const CheckoutAPI = {
  createPendingCheckout: async (
    payload: CheckoutInput,
  ): Promise<CreateOrderRes> => {
    console.log("creating pending checkout...");
    return await apiClient.post("/checkout", payload);
  },
};
