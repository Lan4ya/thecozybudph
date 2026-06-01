import z from "zod";
import { type LoaderFunction } from "react-router";

export type PaymentLoaderData = {
  paymentId: string;
};

const uuidSchema = z.uuid();

const CheckoutPaymentStatusLoader: LoaderFunction = async ({ params }) => {
  const { paymentId } = params;

  const orderIdResult = uuidSchema.safeParse(paymentId);

  if (!orderIdResult.success) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    paymentId: orderIdResult.data,
  } satisfies PaymentLoaderData;
};

export default CheckoutPaymentStatusLoader;
