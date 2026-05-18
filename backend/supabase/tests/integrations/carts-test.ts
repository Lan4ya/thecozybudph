import app from "@functions/cart/index.ts";
import { createDrizzle, supabaseService } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { createProduct } from "@shared/modules/product/application/create-product.ts";
import { products } from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { eq } from "drizzle-orm";
import { getTestToken } from "../helpers/get-test-token.ts";
import { genCreateProductInput } from "../helpers/inputs.ts";

type JsonBody = Record<string, unknown> | unknown[] | null;
type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: JsonBody;
};

describe("Cart API", () => {
  let token = "";
  let userDb: ReturnType<typeof createDrizzle>;
  let productId = "";
  let variantId = "";
  let secondVariantId = "";
  let cartItemId = "";

  const getDbFromToken = async (jwtToken: string) => {
    const { data } = await supabaseService.auth.getClaims(jwtToken);
    if (!data) throw AppError.forbidden("Invalid token");

    const jwt = data.claims;
    return createDrizzle(jwt);
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

  const addCartItem = async (payload: {
    productId: string;
    variantId: string;
    quantity: number;
    cardMessages: string[];
  }) => {
    const res = await apiRequest("/cart/items", {
      method: "POST",
      body: payload,
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: {
        id: string;
        quantity: number;
        product: { variant: { id: string } };
      };
    };

    assert(body.data.id);
    return body.data.id;
  };

  beforeAll(async () => {
    token = await getTestToken();
    userDb = await getDbFromToken(token);

    const product = await createProduct(
      userDb,
      supabaseService,
      genCreateProductInput(),
    );

    productId = product.id;
    variantId = product.variants[0].id;
    secondVariantId = product.variants[1].id;

    assert(productId);
    assert(variantId);
    assert(secondVariantId);
  });

  afterAll(async () => {
    // Best-effort cart cleanup.
    const getRes = await apiRequest("/cart/items", { method: "GET" });
    if (getRes.status === 200) {
      const getBody = (await getRes.json()) as {
        data?: Array<{ id: string }>;
      };

      const ids = (getBody.data ?? []).map((i) => i.id).filter(Boolean);
      if (ids.length > 0) {
        await apiRequest("/cart/items", {
          method: "DELETE",
          body: { cartItemIds: ids },
        });
      }
    }

    await userDb.admin.delete(products).where(eq(products.id, productId));
  });

  it("adds an item to the cart", async () => {
    cartItemId = await addCartItem({
      productId,
      variantId,
      quantity: 2,
      cardMessages: ["Message 1", "Message 2"],
    });

    const getRes = await apiRequest("/cart/items", { method: "GET" });
    assertEquals(getRes.status, 200);

    const getBody = (await getRes.json()) as {
      data: Array<{ id: string; quantity: number }>;
    };

    const item = getBody.data.find((i) => i.id === cartItemId);
    assert(item);
    assertEquals(item.quantity, 2);
  });

  it("updates cart item quantity and messages", async () => {
    const res = await apiRequest(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: {
        quantity: 5,
        cardMessages: ["Updated Message"],
      },
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: {
        item: {
          quantity: number;
          cardMessages: string[];
        };
      };
    };

    assertEquals(body.data.item.quantity, 5);
    assertEquals(body.data.item.cardMessages.length, 1);
    assertEquals(body.data.item.cardMessages[0], "Updated Message");
  });

  it("updates cart item variant (Case C: no existing target)", async () => {
    const res = await apiRequest(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: {
        newVariantId: secondVariantId,
        quantity: 1,
        cardMessages: ["New Variant Message"],
      },
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: {
        item: {
          id: string;
          product: { variant: { id: string } };
        };
        deletedItemId: string | null;
      };
    };

    assertEquals(body.data.item.product.variant.id, secondVariantId);
    assertEquals(body.data.deletedItemId, null);
    cartItemId = body.data.item.id;
  });

  it("updates cart item variant (Case B: merge with existing target)", async () => {
    const originalVariantCartItemId = await addCartItem({
      productId,
      variantId,
      quantity: 1,
      cardMessages: ["Original Variant"],
    });

    const mergeRes = await apiRequest(`/cart/items/${cartItemId}`, {
      method: "PATCH",
      body: {
        newVariantId: variantId,
        quantity: 2,
        cardMessages: ["Merged Message"],
      },
    });

    assertEquals(mergeRes.status, 200);

    const mergeBody = (await mergeRes.json()) as {
      data: {
        item: { id: string };
        deletedItemId: string;
      };
    };

    assertEquals(mergeBody.data.item.id, originalVariantCartItemId);
    assertEquals(mergeBody.data.deletedItemId, cartItemId);

    cartItemId = originalVariantCartItemId;
  });

  it("deletes cart items", async () => {
    const res = await apiRequest("/cart/items", {
      method: "DELETE",
      body: {
        cartItemIds: [cartItemId],
      },
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: { deletedItemIds: string[] };
    };

    assertEquals(body.data.deletedItemIds.includes(cartItemId), true);
  });
});
