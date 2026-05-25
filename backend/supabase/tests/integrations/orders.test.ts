// FIX: move out shipping test into it's own test
import app from "@functions/order/index.ts";
import { createDrizzle, supabaseService } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { createShippingQuotation } from "@shared/integrations/lalamove/create-shipping-quotation.ts";
import { createAddress } from "@shared/modules/address/application/create-address.ts";
import { createProduct } from "@shared/modules/product/application/create-product.ts";
import {
  addresses,
  CreateOrderRes,
  orders,
  payments,
  PayOrderRes,
  products,
} from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { eq } from "drizzle-orm";
import { getTestToken } from "../helpers/utils.ts";
import {
  createShippingQuotationInput,
  genCreateAddressInput,
  genCreateOrderInput,
  genCreateProductInput,
  genPayOrderInput,
} from "../helpers/inputs.ts";

type JsonBody = Record<string, unknown> | unknown[] | null;
type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: JsonBody;
};

describe("Orders API", () => {
  let token = "";
  let userDb: ReturnType<typeof createDrizzle>;
  let profileId = "";

  const createdProductIds: string[] = [];
  const createdAddressIds: string[] = [];
  const createdOrderIds: string[] = [];
  const createdPaymentIds: string[] = [];

  const getDbFromToken = async (jwtToken: string) => {
    const { data } = await supabaseService.auth.getClaims(jwtToken);
    if (!data) throw AppError.forbidden({ message: "Invalid token" });

    return createDrizzle(data.claims);
  };

  const apiRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    let body: string | undefined;
    if (init.body !== undefined && init.body !== null) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }

    return await app.request(path, {
      method: init.method,
      headers,
      body,
    });
  };

  beforeAll(async () => {
    token = await getTestToken();
    userDb = await getDbFromToken(token);

    const { data } = await supabaseService.auth.getClaims(token);
    if (!data) throw AppError.forbidden({ message: "Invalid token" });

    profileId = data.claims.sub;

    const product = await createProduct(
      userDb,
      supabaseService,
      genCreateProductInput(),
    );

    createdProductIds.push(product.id);
    const variantId = product.variants[0].id;

    assert(product.id);
    assert(variantId);

    const address = await createAddress(
      userDb,
      genCreateAddressInput(),
      profileId,
    );
    createdAddressIds.push(address.id);
    assert(address.id);

    const [quotation] = await createShippingQuotation(
      createShippingQuotationInput(),
    );
    const quotationId = quotation.id;
    assert(quotationId);

    // Context for tests
    (globalThis as any).testContext = {
      productId: product.id,
      variantId,
      addressId: address.id,
      quotationId,
    };
  });

  afterAll(async () => {
    if (
      createdPaymentIds.length ||
      createdOrderIds.length ||
      createdAddressIds.length ||
      createdProductIds.length
    ) {
      await userDb.admin.transaction(async (tx) => {
        for (const paymentId of createdPaymentIds) {
          await tx.delete(payments).where(eq(payments.id, paymentId));
        }

        for (const orderId of createdOrderIds) {
          await tx.delete(orders).where(eq(orders.id, orderId));
        }

        for (const addressId of createdAddressIds) {
          await tx.delete(addresses).where(eq(addresses.id, addressId));
        }

        for (const productId of createdProductIds) {
          await tx.delete(products).where(eq(products.id, productId));
        }
      });
    }
  });

  it("queries user orders", async () => {
    const { addressId, productId, variantId, quotationId } = (globalThis as any)
      .testContext;

    const createOrderRes = await apiRequest("/order", {
      method: "POST",
      body: genCreateOrderInput({
        addressId,
        productId,
        variantId,
        shippingQuoteId: quotationId,
      }),
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
    });

    assertEquals(createOrderRes.status, 200);

    const { data: createOrderData } = (await createOrderRes.json()) as {
      data: { orderId: string; paymentId: string };
    };

    createdOrderIds.push(createOrderData.orderId);
    createdPaymentIds.push(createOrderData.paymentId);

    const queryRes = await apiRequest("/order", {
      method: "GET",
    });

    assertEquals(queryRes.status, 200);

    const queryBody = await queryRes.json();
    assertEquals(Array.isArray(queryBody.data), true);

    const foundOrder = queryBody.data.find(
      (o: { id: string }) => o.id === createOrderData.orderId,
    );
    assertEquals(!!foundOrder, true);
  });

  it("gets a single order item", async () => {
    const { addressId, productId, variantId, quotationId } = (globalThis as any)
      .testContext;

    const createOrderRes = await apiRequest("/order", {
      method: "POST",
      body: genCreateOrderInput({
        addressId,
        productId,
        variantId,
        shippingQuoteId: quotationId,
      }),
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
    });

    const { data: createOrderData } = (await createOrderRes.json()) as {
      data: { orderId: string; paymentId: string };
    };

    createdOrderIds.push(createOrderData.orderId);
    createdPaymentIds.push(createOrderData.paymentId);

    // Get the itemId first
    const queryRes = await apiRequest("/order");
    const queryBody = await queryRes.json();
    const order = queryBody.data.find(
      (o: any) => o.id === createOrderData.orderId,
    );
    const itemId = order.item.id;

    const getRes = await apiRequest(`/order/item/${itemId}`);

    assertEquals(getRes.status, 200);

    const getBody = await getRes.json();
    assertEquals(getBody.data.id, itemId);
    assertEquals(getBody.data.name, "Rose Bouquet");
  });

  it("creates and pay an order", async () => {
    const { addressId, productId, variantId, quotationId } = (globalThis as any)
      .testContext;

    const createOrderRes = await apiRequest("/order", {
      method: "POST",
      body: genCreateOrderInput({
        addressId,
        productId,
        variantId,
        shippingQuoteId: quotationId,
      }),
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
    });

    assertEquals(createOrderRes.status, 200);

    const order = (await createOrderRes.json()).data as CreateOrderRes;
    assertEquals(!!order.orderId, true);
    assertEquals(!!order.paymentId, true);

    createdOrderIds.push(order.orderId);
    createdPaymentIds.push(order.paymentId);

    const payOrderRes = await apiRequest(`/order/${order.orderId}/pay`, {
      method: "POST",
      body: genPayOrderInput({ paymentId: order.paymentId }),
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
    });

    assertEquals(payOrderRes.status, 200);

    const paymentId = (await payOrderRes.json()).data
      .paymentId as PayOrderRes["paymentId"];

    assertEquals(!!paymentId, true);
  });

  describe("Idempotency", () => {
    it("replays the same response for the same idempotency key", async () => {
      const { addressId, productId, variantId, quotationId } = (
        globalThis as any
      ).testContext;

      const idempotencyKey = crypto.randomUUID();
      const payload = genCreateOrderInput({
        addressId,
        productId,
        variantId,
        shippingQuoteId: quotationId,
      });

      // First request
      const res1 = await apiRequest("/order", {
        method: "POST",
        body: payload,
        headers: { "Idempotency-Key": idempotencyKey },
      });
      assertEquals(res1.status, 200);
      const data1 = (await res1.json()).data as CreateOrderRes;
      createdOrderIds.push(data1.orderId);
      createdPaymentIds.push(data1.paymentId);

      // Second request (replay)
      const res2 = await apiRequest("/order", {
        method: "POST",
        body: payload,
        headers: { "Idempotency-Key": idempotencyKey },
      });
      assertEquals(res2.status, 200);
      const data2 = (await res2.json()).data as CreateOrderRes;

      assertEquals(data1.orderId, data2.orderId);
      assertEquals(data1.paymentId, data2.paymentId);
    });

    it("returns 409 Conflict when the same key is used with a different payload", async () => {
      const { addressId, productId, variantId, quotationId } = (
        globalThis as any
      ).testContext;

      const idempotencyKey = crypto.randomUUID();
      const payload = genCreateOrderInput({
        addressId,
        productId,
        variantId,
        shippingQuoteId: quotationId,
      });

      // First request
      const res1 = await apiRequest("/order", {
        method: "POST",
        body: payload,
        headers: { "Idempotency-Key": idempotencyKey },
      });
      assertEquals(res1.status, 200);
      const data1 = (await res1.json()).data as CreateOrderRes;
      createdOrderIds.push(data1.orderId);
      createdPaymentIds.push(data1.paymentId);

      // Second request with different payload
      const differentPayload = { ...payload, serviceType: "sedan" };
      const res2 = await apiRequest("/order", {
        method: "POST",
        body: differentPayload,
        headers: { "Idempotency-Key": idempotencyKey },
      });
      assertEquals(res2.status, 409);
      const error = await res2.json();
      assertEquals(error.code, "CONFLICT");
    });
  });

  describe("Race Conditions & Integrity", () => {
    it("prevents double payment via concurrent requests", async () => {
      const { addressId, productId, variantId, quotationId } = (
        globalThis as any
      ).testContext;

      // Create an order first
      const createRes = await apiRequest("/order", {
        method: "POST",
        body: genCreateOrderInput({
          addressId,
          productId,
          variantId,
          shippingQuoteId: quotationId,
        }),
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      const order = (await createRes.json()).data as CreateOrderRes;
      createdOrderIds.push(order.orderId);
      createdPaymentIds.push(order.paymentId);

      // Fire two payment requests simultaneously
      const payPayload = genPayOrderInput({ paymentId: order.paymentId });
      const [res1, res2] = await Promise.all([
        apiRequest(`/order/${order.orderId}/pay`, {
          method: "POST",
          body: payPayload,
          headers: { "Idempotency-Key": crypto.randomUUID() },
        }),
        apiRequest(`/order/${order.orderId}/pay`, {
          method: "POST",
          body: payPayload,
          headers: { "Idempotency-Key": crypto.randomUUID() },
        }),
      ]);

      // One should succeed, one should fail with 409 Conflict
      const statuses = [res1.status, res2.status].sort();
      assertEquals(statuses, [200, 409]);

      const conflictRes = res1.status === 409 ? res1 : res2;
      const error = await conflictRes.json();
      assertEquals(error.code, "CONFLICT");
    });

    it("fails payment for expired orders", async () => {
      const { addressId, productId, variantId, quotationId } = (
        globalThis as any
      ).testContext;

      // Create an order
      const createRes = await apiRequest("/order", {
        method: "POST",
        body: genCreateOrderInput({
          addressId,
          productId,
          variantId,
          shippingQuoteId: quotationId,
        }),
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      const order = (await createRes.json()).data as CreateOrderRes;
      createdOrderIds.push(order.orderId);
      createdPaymentIds.push(order.paymentId);

      // Manually expire the order in DB
      await userDb.admin
        .update(orders)
        .set({ expiresAt: new Date(Date.now() - 1000) })
        .where(eq(orders.id, order.orderId));

      // Attempt payment
      const payRes = await apiRequest(`/order/${order.orderId}/pay`, {
        method: "POST",
        body: genPayOrderInput({ paymentId: order.paymentId }),
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });

      assertEquals(payRes.status, 400);
      const error = await payRes.json();
      assertEquals(error.message, "Order has expired");

      // Verify status updated in DB
      const updatedOrder = await userDb.admin.query.orders.findFirst({
        where: eq(orders.id, order.orderId),
        columns: { status: true },
      });
      assertEquals(updatedOrder?.status, "expired");
    });
  });
});
