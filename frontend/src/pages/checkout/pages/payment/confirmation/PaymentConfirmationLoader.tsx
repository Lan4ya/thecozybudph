import z from "zod";
import { redirect, type LoaderFunction } from "react-router";
import { useCheckoutStore } from "@/pages/checkout/store/useCheckoutStore";

export type PaymentConfirmationLoaderData = {
  sessionId: string;
  orderId: string;
};

const uuidSchema = z.uuid();

const PaymentConfirmationLoader: LoaderFunction = async ({ params }) => {
  const checkoutIds = useCheckoutStore.getState().checkoutIds;
  const sessionIdStore = checkoutIds?.session;
  const orderIdStore = checkoutIds?.order;
  const paymentIdStore = checkoutIds?.payment;

  const pmStatus = useCheckoutStore.getState().payment?.status;

  if (pmStatus !== "verification" && pmStatus !== "idle" && paymentIdStore) {
    throw redirect(`/payment/${paymentIdStore}/status`);
  }

  if (!sessionIdStore) {
    throw redirect("/shop");
  }

  const { sessionId, orderId } = params;
  const sessionIdResult = uuidSchema.safeParse(sessionId);
  const orderIdResult = uuidSchema.safeParse(orderId);

  if (
    !orderIdResult.success ||
    !sessionIdResult.success ||
    sessionIdStore !== sessionIdResult.data ||
    orderIdStore !== orderIdResult.data
  ) {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    sessionId: sessionIdResult.data,
    orderId: orderIdResult.data,
  } satisfies PaymentConfirmationLoaderData;
};

export default PaymentConfirmationLoader;
