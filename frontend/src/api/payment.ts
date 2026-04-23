import { apiClient } from "@/lib/axios/client";
import isDev from "@/lib/utils/isDev";
import type { GetPaymentStatusRes } from "@TheCozyBud/types";

export const PaymentAPI = {
  getStatus: async (paymentId: string): Promise<GetPaymentStatusRes> => {
    isDev && console.log("getting payment status...");
    return await apiClient.get(`/payment/${paymentId}/status`);
  },
};
