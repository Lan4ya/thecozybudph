import { Session } from "@supabase/supabase-js";
import {
  CreateOrderInput,
  CreateOrderRes,
  CreateShippingQuoteData,
  CreateShippingQuoteInput,
} from "@cozybud/schemas";
import { getAdminSession } from "./helpers/getSession.ts";
import {
  openApiClient,
  unwrapData,
} from "scripts/helpers/openApiFetchClient.ts";
import { supabase, supabaseService } from "scripts/helpers/supabase.ts";

const createSingleOrder = async (session: Session) => {
  const profileId = session.user.id;

  const paymentMethodType = "gcash";
  const serviceType = "motorcycle";

  const { data: address, error: addressError } = await supabase
    .from("addresses")
    .select("id")
    .eq("profile_id", profileId)
    .eq("is_default", true)
    .limit(1)
    .single();

  if (addressError) {
    throw new Error(`Failed to fetch address: ${addressError.message}`);
  }

  const addressId = address.id;

  const { data: product, error: productError } = await supabase
    .from("products")
    .select(
      `
    id,
    primary_image_url,
    product_variants!inner (
      id
    )
  `,
    )
    .limit(1)
    .single();

  if (productError) {
    throw new Error(
      `Failed to fetch product with variant: ${productError.message}`,
    );
  }

  const item = {
    productId: product.id,
    variantId: product.product_variants[0].id,
    primaryImageUrl: product.primary_image_url,
    quantity: 2,
    cardMessages: ["Enjoy your gift!"],
  };

  const createQuotePayload: CreateShippingQuoteInput = {
    recipientAddressId: addressId,
    serviceType,
  };

  const createShipmentQuote = async (): Promise<CreateShippingQuoteData[]> => {
    const { data: raw } = await openApiClient.admin.POST(
      "/admin/shipment/quotes",
      {
        body: createQuotePayload,
      },
    );
    const data = unwrapData(raw, "POST /admin/shipment/quotes");
    return data.map((quote) => ({
      ...quote,
      scheduleAt: new Date(quote.scheduleAt),
      expiresAt: new Date(quote.expiresAt),
    }));
  };

  const [createQuoteData] = await createShipmentQuote();

  const orderPayload: CreateOrderInput = {
    source: "shop",
    items: [item],
    addressId: addressId,
    shippingQuoteId: createQuoteData.id,
    paymentMethodType,
    serviceType,
  };

  const idempotencyKey1 = crypto.randomUUID();
  const createOrder = async (): Promise<CreateOrderRes> => {
    const { data: raw } = await openApiClient.order.POST("/order", {
      body: orderPayload,
      headers: {
        "Idempotency-Key": idempotencyKey1,
      },
    });
    return unwrapData(raw, "POST /order");
  };
  const orderData = await createOrder();

  if (!orderData) {
    throw new Error(
      `Could not find order ID in response: ${JSON.stringify(orderData)}`,
    );
  }

  // Update order status to paid
  const { data: updatedOrder, error: orderError } = await supabaseService
    .from("orders")
    .update({ status: "paid" })
    .eq("id", orderData.orderId)
    .select();

  if (orderError) {
    throw new Error(`Failed to update order: ${orderError.message}`);
  }

  if (!updatedOrder || updatedOrder.length === 0) {
    throw new Error(`Order ${orderData.orderId} not found after update`);
  }

  // Update payment status
  const { error: paymentError } = await supabaseService
    .from("payments")
    .update({
      status: "paid",
      payment_id: `seed_${orderData.paymentId}`,
      paid_at: new Date().toISOString(),
    })
    .eq("id", orderData.paymentId);

  if (paymentError) {
    throw new Error(`Failed to update payments: ${paymentError.message}`);
  }

  return orderData;
};

export const seedOrders = async () => {
  const session = await getAdminSession();
  const totalOrders = 30;
  const successful = [];
  const failed = [];

  // Sequential execution to avoid rate limits
  for (let i = 1; i <= totalOrders; i++) {
    try {
      const result = await createSingleOrder(session);
      successful.push(result);
      console.log(`✅ Order ${i}/${totalOrders} succeeded`);
    } catch (error) {
      failed.push({ orderNum: i, error });
      console.error(`❌ Order ${i}/${totalOrders} failed:`, error);
    }
  }

  console.log(`✅ Successful orders: ${successful.length}`);
  console.log(`❌ Failed orders: ${failed.length}`);

  failed.forEach(({ orderNum, error }) => {
    console.error(`  Order ${orderNum} failed:`, error);
  });

  return { successful, failed };
};

if (process.argv[1] === import.meta.filename) {
  seedOrders().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
