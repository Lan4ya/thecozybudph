import { type LoaderFunction } from "react-router";
import { uuidSchema } from "@cozybud/schemas";

const OrderDetailsLoader: LoaderFunction = async ({ params }) => {
  const { orderId } = params;
  const parsed = uuidSchema.safeParse(orderId);

  if (!parsed.success) {
    throw new Response("Not Found", { status: 404 });
  }

  return parsed.data;
};

export default OrderDetailsLoader;
