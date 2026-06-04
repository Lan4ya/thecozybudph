import z from "zod";
import { type LoaderFunction } from "react-router";

export type PaymentLoaderData = {
  paymentId: string;
};

const uuidSchema = z.uuid();

const PaymentStatusLoader: LoaderFunction = ({ params }) => {
  const { paymentId } = params;
  const parsed = uuidSchema.safeParse(paymentId);

  if (!parsed.success) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    paymentId: parsed.data,
  } satisfies PaymentLoaderData;
};

export default PaymentStatusLoader;
