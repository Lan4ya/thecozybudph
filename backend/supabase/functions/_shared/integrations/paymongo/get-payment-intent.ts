import { CreatePaymentIntentResponse } from "@shared/schemas/index.ts";
import { paymongoClient } from "./client.ts";

// https://docs.paymongo.com/reference/retrieve-a-paymentintent
export const getPaymentIntent = async (
  pmIntentId: string,
): Promise<CreatePaymentIntentResponse["data"]> => {
  return await paymongoClient.get(`/payment_intents/${pmIntentId}`);
};
