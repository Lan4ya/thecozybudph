import z from "zod";
import { redirect, type LoaderFunction } from "react-router";
import { useCheckoutStore } from "@/store/useCheckoutStore";

const CheckoutLoader: LoaderFunction = async ({ params }) => {
  const checkout = useCheckoutStore.getState().checkout;

  if (!checkout || checkout.status === "idle" || !checkout.sessionId) {
    // The user likely typed a random uuid in the url without going through the
    // proper flow (shop buy now or cart checkout buttons)
    throw new Response("Not Found", { status: 404 });
  }

  if (checkout.status === "completed" && checkout.paymentId) {
    throw redirect(`/payment/${checkout.paymentId}/status`);
  }

  const { sessionId } = params;

  const sessionIdResult = z.uuid().safeParse(sessionId);

  if (!sessionIdResult.success || checkout.sessionId !== sessionIdResult.data) {
    // Same thing here, the user likely manually typed or followed an invalid url
    throw new Response("Not Found", { status: 404 });
  }

  return null;
};

export default CheckoutLoader;
