import z from "zod";
import { useCheckoutStore } from "./store/useCheckoutStore";
import { redirect, type LoaderFunction } from "react-router";

const CheckoutLoader: LoaderFunction = async ({ params }) => {
  const checkoutIds = useCheckoutStore.getState().checkoutIds;
  const sessionIdStore = checkoutIds?.session;
  const paymentIdStore = checkoutIds?.payment;

  const pmStatus = useCheckoutStore.getState().payment?.status;

  if (pmStatus !== "idle" && paymentIdStore) {
    throw redirect(`/payment/${paymentIdStore}/status`);
  }

  if (!checkoutIds?.session) {
    throw redirect("/shop");
  }

  const { sessionId } = params;
  const sessionIdResult = z.uuid().safeParse(sessionId);

  if (!sessionIdResult.success || sessionIdStore !== sessionIdResult.data) {
    throw new Response("Not Found", { status: 404 });
  }

  return null;
};

export default CheckoutLoader;
