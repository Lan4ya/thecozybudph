import { paymongoClient } from "./client.ts";

export const getPaymentMethod = async (pmMethodId: string) => {
  return await paymongoClient.get(`/payment_methods/${pmMethodId}`);
};
