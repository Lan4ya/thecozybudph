import { apiClient } from "@/lib/axios/client";
import type {
  CreateQuotationsRes,
  CreateShippingQuoteInput,
} from "@TheCozyBud/types";

export const LalamoveAPI = {
  createQuotes: async (
    payload: CreateShippingQuoteInput,
  ): Promise<CreateQuotationsRes> => {
    console.log("creating lalamove quotes...", payload);
    return await apiClient.post("/checkout/shipping/quotes", payload);
  },
};
