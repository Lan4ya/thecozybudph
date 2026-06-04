import { type LoaderFunction } from "react-router";
import { uuidSchema } from "@cozybud/schemas";

export type PaymentConfirmationLoaderData = {
  paymentId: string;
};

const PaymentConfirmationLoader: LoaderFunction = async ({ params }) => {
  const { paymentId } = params;
  const parsed = uuidSchema.safeParse(paymentId);

  if (!parsed.success) {
    throw new Response("Invalid Order ID Format", { status: 404 });
  }

  return {
    paymentId: parsed.data,
  } satisfies PaymentConfirmationLoaderData;
};

export default PaymentConfirmationLoader;
