import adminApp from "@functions/admin/index.ts";
import orderApp from "@functions/order/index.ts";
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
  products,
} from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { eq, inArray } from "drizzle-orm";
import { getTestToken, getTestAdminToken } from "../helpers/utils.ts";
import {
  createShippingQuotationInput,
  genCreateAddressInput,
  genCreateOrderInput,
  genCreateProductInput,
  genPayOrderInput,
  genAdminShipOrderInput,
} from "../helpers/inputs.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

describe("Admin Orders API", () => {
  let userToken = "";
  let adminToken = "";
  let userDb: ReturnType<typeof createDrizzle>;
  let profileId = "";

  const createdProductIds: string[] = [];
  const createdAddressIds: string[] = [];
  const createdOrderIds: string[] = [];
  const createdPaymentIds: string[] = [];

  const adminRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${adminToken}`);

    let body: string | undefined;
    if (init.body !== undefined && init.body !== null) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }

    return await adminApp.request(path, {
      method: init.method,
      headers,
      body,
    });
  };

  const userRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${userToken}`);

    let body: string | undefined;
    if (init.body !== undefined && init.body !== null) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }

    return await orderApp.request(path, {
      method: init.method,
      headers,
      body,
    });
  };

  const createSeedOrder = async (pay = false) => {
    // 1. Setup fixture
    const product = await createProduct(
      userDb,
      supabaseService,
      genCreateProductInput(),
    );
    createdProductIds.push(product.id);

    const address = await createAddress(
      userDb,
      genCreateAddressInput(),
      profileId,
    );
    createdAddressIds.push(address.id);

    const [quotation] = await createShippingQuotation(
      createShippingQuotationInput(),
    );

    // 2. Create order
    const createRes = await userRequest("/order", {
      method: "POST",
      body: genCreateOrderInput({
        addressId: address.id,
        productId: product.id,
        variantId: product.variants[0].id,
        shippingQuoteId: quotation.id,
      }),
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    assertEquals(createRes.status, 200);
    const orderData = (await createRes.json()).data as CreateOrderRes;
    createdOrderIds.push(orderData.orderId);
    createdPaymentIds.push(orderData.paymentId);

    // 3. Pay order if requested
    if (pay) {
      const payRes = await userRequest(`/order/${orderData.orderId}/pay`, {
        method: "POST",
        body: genPayOrderInput({ paymentId: orderData.paymentId }),
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      assertEquals(payRes.status, 200);
    }

    return orderData;
  };

  beforeAll(async () => {
    userToken = await getTestToken();
    adminToken = await getTestAdminToken();

    const { data } = await supabaseService.auth.getClaims(userToken);
    profileId = data!.claims.sub;
    userDb = createDrizzle(data!.claims);
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

  describe("Security", () => {
    it("returns 401 Unauthorized when no token is provided", async () => {
      const res = await adminApp.request("/admin/order", { method: "GET" });
      assertEquals(res.status, 401);
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const headers = { Authorization: `Bearer ${userToken}` };
      const res = await adminApp.request("/admin/order", {
        method: "GET",
        headers,
      });
      assertEquals(res.status, 403);
    });
  });

  describe("Order Management", () => {
    it("queries all orders", async () => {
      const seed = await createSeedOrder();

      const res = await adminRequest("/admin/order", { method: "GET" });
      assertEquals(res.status, 200);

      const body = await res.json();
      assert(Array.isArray(body.data.orders));
      const found = body.data.orders.find((o: any) => o.id === seed.orderId);
      assert(found);
    });

    it("filters orders by status", async () => {
      await createSeedOrder(); // to_pay

      const res = await adminRequest("/admin/order?status=toPay", {
        method: "GET",
      });
      assertEquals(res.status, 200);
      const body = await res.json();
      assert(body.data.orders.every((o: any) => o.status === "toPay"));
    });
  });

  // describe("Shipping Workflow", () => {
  //   it("ships a paid order and then cancels it", async () => {
  //     // 1. Create a PAID order
  //     const seed = await createSeedOrder(true);
  //
  //     // 2. Ship the order (book Lalamove)
  //     const shipRes = await adminRequest(
  //       `/admin/order/${seed.orderId}/shipment`,
  //       {
  //         method: "PATCH",
  //         body: genAdminShipOrderInput(),
  //       },
  //     );
  //
  //     assertEquals(shipRes.status, 200);
  //     const shipBody = await shipRes.json();
  //     assertEquals(shipBody.data.status, "toShip");
  //
  //     // 3. Verify status in DB
  //     const order = await userDb.admin.query.orders.findFirst({
  //       where: eq(orders.id, seed.orderId),
  //     });
  //     assertEquals(order?.status, "to_ship");
  //     assert(order?.shipmentOrderId);
  //
  //     // 4. Cancel the shipment
  //     const cancelRes = await adminRequest(
  //       `/admin/order/${seed.orderId}/shipment`,
  //       {
  //         method: "DELETE",
  //       },
  //     );
  //     assertEquals(cancelRes.status, 200);
  //     const cancelBody = await cancelRes.json();
  //     assertEquals(cancelBody.data.status, "paid");
  //
  //     // 5. Verify status reverted in DB
  //     const revertedOrder = await userDb.admin.query.orders.findFirst({
  //       where: eq(orders.id, seed.orderId),
  //     });
  //     assertEquals(revertedOrder?.status, "paid");
  //     assertEquals(revertedOrder?.shipmentOrderId, null);
  //   });
  //
  //   it("returns 404 for shipping non-existent order", async () => {
  //     const res = await adminRequest(
  //       `/admin/order/${crypto.randomUUID()}/shipment`,
  //       {
  //         method: "PATCH",
  //         body: genAdminShipOrderInput(),
  //       },
  //     );
  //     assertEquals(res.status, 404);
  //   });
  // });
});
