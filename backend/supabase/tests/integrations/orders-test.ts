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
import { getTestToken } from "../helpers/get-test-token.ts";
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

  let productId = "";
  let variantId = "";
  let addressId = "";
  let quotationId = "";

  const createdOrderIds: string[] = [];
  const createdPaymentIds: string[] = [];

  const getDbFromToken = async (jwtToken: string) => {
    const { data } = await supabaseService.auth.getClaims(jwtToken);
    if (!data) throw AppError.forbidden("Invalid token");

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
    if (!data) throw AppError.forbidden("Invalid token");

    profileId = data.claims.sub;

    const product = await createProduct(
      userDb,
      supabaseService,
      genCreateProductInput(),
    );

    productId = product.id;
    variantId = product.variants[0].id;

    assert(productId);
    assert(variantId);

    const address = await createAddress(
      userDb,
      genCreateAddressInput(),
      profileId,
    );
    addressId = address.id;
    assert(addressId);

    const [quotation] = await createShippingQuotation(
      createShippingQuotationInput(),
    );
    quotationId = quotation.id;
    assert(quotationId);
  });

  afterAll(async () => {
    if (
      createdPaymentIds.length ||
      createdOrderIds.length ||
      addressId ||
      productId
    ) {
      await userDb.admin.transaction(async (tx) => {
        for (const paymentId of createdPaymentIds) {
          await tx.delete(payments).where(eq(payments.id, paymentId));
        }

        for (const orderId of createdOrderIds) {
          await tx.delete(orders).where(eq(orders.id, orderId));
        }

        if (addressId) {
          await tx.delete(addresses).where(eq(addresses.id, addressId));
        }

        if (productId) {
          await tx.delete(products).where(eq(products.id, productId));
        }
      });
    }
  });

  it("queries user orders", async () => {
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

  it("creates and pay an order", async () => {
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
});
