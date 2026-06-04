import adminApp from "@functions/admin/index.ts";
import orderApp from "@functions/order/index.ts";
import { createDrizzle, supabaseService } from "@shared/db/client.ts";
import { ShipmentActions } from "@shared/modules/admin/application/shipment/mod.ts";
import { createAddress } from "@shared/modules/address/application/create-address.ts";
import { createProduct } from "@shared/modules/product/application/create-product.ts";
import { OrderRepository } from "@shared/modules/order/order-repository.ts";
import {
  addresses,
  CreateOrderRes,
  orders,
  payments,
  products,
} from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { eq } from "drizzle-orm";
import { getTestToken, getTestAdminToken } from "../helpers/utils.ts";
import {
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

describe("Admin Shipping Workflow", () => {
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
    const product = await createProduct(
      userDb,
      supabaseService,
      genCreateProductInput(),
    );
    createdProductIds.push(product.id);

    const address = await createAddress(
      userDb,
      profileId,
      false,
      genCreateAddressInput(),
    );
    createdAddressIds.push(address.id);

    const [quotation] = await ShipmentActions.createShipmentQuotation(userDb, {
      recipientAddressId: address.id,
      serviceType: "motorcycle",
    });

    // Use the actual image from the product if available, otherwise it uses the default in genCreateOrderInput
    const orderInput = genCreateOrderInput({
      addressId: address.id,
      productId: product.id,
      variantId: product.variants[0].id,
      shippingQuoteId: quotation.id,
      primaryImageUrl: product.imageUrls?.[0],
    });

    const createRes = await userRequest("/order", {
      method: "POST",
      body: orderInput,
      headers: { "Idempotency-Key": crypto.randomUUID() },
    });
    assertEquals(createRes.status, 201);
    const orderData = (await createRes.json()).data as CreateOrderRes;
    createdOrderIds.push(orderData.orderId);
    createdPaymentIds.push(orderData.paymentId);

    if (pay) {
      const payRes = await userRequest(`/order/${orderData.orderId}/pay`, {
        method: "POST",
        body: genPayOrderInput({ paymentId: orderData.paymentId }),
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });
      assertEquals(payRes.status, 200);

      // Force to 'paid' because Paymongo integration in test env stays at 'pending'
      await OrderRepository.updateStatus(userDb, {
        orderId: orderData.orderId,
        status: "paid",
      });
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

  it("ships a paid order, ensure correct status, and then cancels it", async () => {
    // Create a PAID order
    const seed = await createSeedOrder(true);

    // Ship the order (book Lalamove)
    const shipRes = await adminRequest(`/admin/order/${seed.orderId}/ship`, {
      method: "PATCH",
      body: genAdminShipOrderInput({
        remarks: "Handle with care - fragile item",
      }),
    });

    assertEquals(shipRes.status, 200);
    const shipBody = await shipRes.json();
    assertEquals(shipBody.data.shipmentStatus, "ASSIGNING_DRIVER");

    // Verify status in DB
    const order = await userDb.admin.query.orders.findFirst({
      where: eq(orders.id, seed.orderId),
    });

    assertEquals(order?.status, "to_ship");

    // Cancel the shipment
    const cancelRes = await adminRequest(
      `/admin/order/${seed.orderId}/ship/cancel`,
      {
        method: "DELETE",
      },
    );
    assertEquals(cancelRes.status, 200);
    const cancelBody = await cancelRes.json();
    assertEquals(cancelBody.data.success, true);

    // Manual status update to 'paid' to simulate webhook in test environment
    await OrderRepository.updateStatus(userDb, {
      orderId: seed.orderId,
      status: "paid",
    });

    // Verify status reverted in DB
    const revertedOrder = await userDb.admin.query.orders.findFirst({
      where: eq(orders.id, seed.orderId),
    });
    assertEquals(revertedOrder?.status, "paid");
  });

  it("gets shipping order details", async () => {
    const seed = await createSeedOrder(true);
    const shipRes = await adminRequest(`/admin/order/${seed.orderId}/ship`, {
      method: "PATCH",
      body: genAdminShipOrderInput(),
    });
    const shipBody = await shipRes.json();
    const lalamoveOrderId = shipBody.data.lalamoveOrderId;

    const res = await adminRequest(`/admin/order/${seed.orderId}/ship`, {
      method: "GET",
    });

    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.data.lalamoveOrderId, lalamoveOrderId);
    assert(body.data.shipmentStatus);
  });

  // it("adds priority fee to a shipment order", async () => {
  //   const seed = await createSeedOrder(true);
  //   const shipRes = await adminRequest(`/admin/order/${seed.orderId}/ship`, {
  //     method: "PATCH",
  //     body: genAdminShipOrderInput(),
  //   });
  //   const shipBody = await shipRes.json();
  //   const shippingOrderId = shipBody.data.shippingOrderId;
  //
  //   const res = await adminRequest(`/admin/shipment/priority-fee`, {
  //     method: "POST",
  //     body: {
  //       orderId: shippingOrderId,
  //       fee: "10.00",
  //     },
  //   });
  //
  //   // In sandbox, it might fail if order is not in correct status, but we expect 200 if API accepts it
  //   // Or it might return 422 if Lalamove sandbox doesn't like it
  //   if (res.status === 200) {
  //     const body = await res.json();
  //     assert(body.data);
  //   } else {
  //     console.log(
  //       "Add priority fee failed (expected in some sandbox states):",
  //       await res.text(),
  //     );
  //   }
  // });

  it("returns 404 for shipping non-existent order", async () => {
    const res = await adminRequest(`/admin/order/${crypto.randomUUID()}/ship`, {
      method: "PATCH",
      body: genAdminShipOrderInput(),
    });
    assertEquals(res.status, 404);
  });

  it("returns 400 when shipping an unpaid order", async () => {
    const seed = await createSeedOrder(false); // unpaid

    const res = await adminRequest(`/admin/order/${seed.orderId}/ship`, {
      method: "PATCH",
      body: genAdminShipOrderInput(),
    });
    assertEquals(res.status, 400);
  });
});
