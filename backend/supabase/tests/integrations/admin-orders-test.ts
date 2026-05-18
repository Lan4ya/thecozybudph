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
  products,
  PayOrderRes,
} from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { beforeAll, describe, it } from "@std/testing/bdd";
import { eq } from "drizzle-orm";
import { getTestToken } from "../helpers/get-test-token.ts";
import {
  createShippingQuotationInput,
  genCreateAddressInput,
  genCreateOrderInput,
  genCreateProductInput,
  genPayOrderInput,
} from "../helpers/inputs.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

type Fixture = {
  productId: string;
  addressId: string;
  variantId: string;
  shippingQuoteId: string;
};

describe("Orders API", () => {
  let token = "";
  let db: ReturnType<typeof createDrizzle>;
  let profileId = "";

  const getUserContext = async () => {
    const token = await getTestToken();
    const { data } = await supabaseService.auth.getClaims(token);
    if (!data) throw AppError.forbidden("Invalid token");

    const jwt = data.claims;
    return {
      token,
      db: createDrizzle(jwt),
      profileId: jwt.sub,
    };
  };

  const apiRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);

    const body =
      init.body === undefined ? undefined : JSON.stringify(init.body);
    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
    }

    return await app.request(path, {
      method: init.method,
      headers,
      body,
    });
  };

  const seedFixture = async (): Promise<Fixture> => {
    const product = await createProduct(
      db,
      supabaseService,
      genCreateProductInput(),
    );
    const address = await createAddress(db, genCreateAddressInput(), profileId);
    const [quotation] = await createShippingQuotation(
      createShippingQuotationInput(),
    );

    return {
      productId: product.id,
      addressId: address.id,
      variantId: product.variants[0].id,
      shippingQuoteId: quotation.id,
    };
  };

  const createOrder = async (fixture: Fixture) => {
    const res = await apiRequest("/order", {
      method: "POST",
      body: genCreateOrderInput({
        addressId: fixture.addressId,
        productId: fixture.productId,
        variantId: fixture.variantId,
        shippingQuoteId: fixture.shippingQuoteId,
      }),
      headers: {
        "Idempotency-Key": crypto.randomUUID(),
      },
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as { data: CreateOrderRes };
    assert(body.data.orderId);
    assert(body.data.paymentId);

    return body.data;
  };

  const cleanup = async (ids: {
    paymentId?: string;
    orderId?: string;
    addressId?: string;
    productId?: string;
  }) => {
    await db.admin.transaction(async (tx) => {
      if (ids.paymentId) {
        await tx.delete(payments).where(eq(payments.id, ids.paymentId));
      }

      if (ids.orderId) {
        await tx.delete(orders).where(eq(orders.id, ids.orderId));
      }

      if (ids.addressId) {
        await tx.delete(addresses).where(eq(addresses.id, ids.addressId));
      }

      if (ids.productId) {
        await tx.delete(products).where(eq(products.id, ids.productId));
      }
    });
  };

  beforeAll(async () => {
    const ctx = await getUserContext();
    token = ctx.token;
    db = ctx.db;
    profileId = ctx.profileId;
  });

  it("creates an order", async () => {
    const fixture = await seedFixture();

    try {
      const order = await createOrder(fixture);
      assertEquals(!!order.orderId, true);
      assertEquals(!!order.paymentId, true);
    } finally {
      await cleanup(fixture);
    }
  });

  it("queries user orders", async () => {
    const fixture = await seedFixture();

    try {
      const order = await createOrder(fixture);

      const queryRes = await apiRequest("/order", {
        method: "GET",
      });

      assertEquals(queryRes.status, 200);

      const queryBody = (await queryRes.json()) as {
        data: Array<{ id: string }>;
      };

      assertEquals(Array.isArray(queryBody.data), true);

      const found = queryBody.data.find((o) => o.id === order.orderId);
      assert(found);
    } finally {
      await cleanup(fixture);
    }
  });

  it("creates and pays an order", async () => {
    const fixture = await seedFixture();

    try {
      const order = await createOrder(fixture);

      const payOrderRes = await apiRequest(`/order/${order.orderId}/pay`, {
        method: "POST",
        body: genPayOrderInput({ paymentId: order.paymentId }),
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
        },
      });

      assertEquals(payOrderRes.status, 200);

      const payBody = (await payOrderRes.json()) as {
        data: PayOrderRes;
      };

      assert(payBody.data.paymentId);
    } finally {
      await cleanup({
        ...fixture,
      });
    }
  });
});
