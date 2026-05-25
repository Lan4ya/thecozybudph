import app from "@functions/cart/index.ts";
import { createDrizzle, supabaseService } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { createProduct } from "@shared/modules/product/application/create-product.ts";
import { cartItems, products } from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { eq, inArray } from "drizzle-orm";
import { getTestToken } from "../helpers/utils.ts";
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
  let profileId = "";

  const createdProductIds: string[] = [];

  const getDbFromToken = async (jwtToken: string) => {
    const { data } = await supabaseService.auth.getClaims(jwtToken);
    if (!data) throw AppError.forbidden({ message: "Invalid token" });

    const jwt = data.claims;
    return createDrizzle(jwt);
  };

  const apiRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (init.headers === undefined || !(init.headers as any)["Authorization"]) {
      headers.set("Authorization", `Bearer ${token}`);
    }

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

    const { data } = await supabaseService.auth.getClaims(token);
    profileId = data!.claims.sub;

    const product = await createProduct(
      userDb,
      supabaseService,
      genCreateProductInput(),
    );

    productId = product.id;
    createdProductIds.push(productId);
    variantId = product.variants[0].id;
    secondVariantId = product.variants[1].id;

    assert(productId);
    assert(variantId);
    assert(secondVariantId);
  });

  afterAll(async () => {
    // Thorough cart cleanup for the test user
    const cart = await userDb.admin.query.carts.findFirst({
      where: (carts, { eq }) => eq(carts.profileId, profileId),
    });

    if (cart) {
      await userDb.admin.delete(cartItems).where(eq(cartItems.cartId, cart.id));
    }

    if (createdProductIds.length > 0) {
      await userDb.admin
        .delete(products)
        .where(inArray(products.id, createdProductIds));
    }
  });

  describe("Security & Validation", () => {
    it("returns 401 Unauthorized when no token is provided", async () => {
      const res = await app.request("/cart/items", {
        method: "GET",
      });
      assertEquals(res.status, 401);
    });

    it("returns 400 Bad Request for non-existent variant ID", async () => {
      const res = await apiRequest("/cart/items", {
        method: "POST",
        body: {
          productId,
          variantId: crypto.randomUUID(),
          quantity: 1,
          cardMessages: [],
        },
      });
      assertEquals(res.status, 400);
    });
  });

  describe("Upsert & Merge Logic", () => {
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

    it("merges quantity and messages when adding the same variant again", async () => {
      const secondAddId = await addCartItem({
        productId,
        variantId,
        quantity: 3,
        cardMessages: ["Message 3"],
      });

      assertEquals(secondAddId, cartItemId);

      const getRes = await apiRequest("/cart/items", { method: "GET" });
      const getBody = await getRes.json();
      const item = getBody.data.find((i: any) => i.id === cartItemId);

      assertEquals(item.quantity, 5); // 2 + 3
      assertEquals(item.cardMessages.length, 3);
      assertEquals(item.cardMessages.includes("Message 3"), true);
    });

    it("handles concurrent additions of the same variant", async () => {
      const newProduct = await createProduct(
        userDb,
        supabaseService,
        genCreateProductInput(),
      );
      createdProductIds.push(newProduct.id);
      const vId = newProduct.variants[0].id;

      await Promise.all([
        addCartItem({
          productId: newProduct.id,
          variantId: vId,
          quantity: 1,
          cardMessages: ["C1"],
        }),
        addCartItem({
          productId: newProduct.id,
          variantId: vId,
          quantity: 1,
          cardMessages: ["C2"],
        }),
      ]);

      const getRes = await apiRequest("/cart/items", { method: "GET" });
      const getBody = await getRes.json();
      const item = getBody.data.find(
        (i: any) => i.product.id === newProduct.id,
      );

      assert(item);
      assertEquals(item.quantity, 2);
    });
  });

  describe("Variant Updates", () => {
    it("updates cart item quantity and messages", async () => {
      const res = await apiRequest(`/cart/items/${cartItemId}`, {
        method: "PATCH",
        body: {
          quantity: 10,
          cardMessages: ["Updated Message Only"],
        },
      });

      assertEquals(res.status, 200);
      const body = await res.json();
      assertEquals(body.data.item.quantity, 10);
      assertEquals(body.data.item.cardMessages[0], "Updated Message Only");
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
      const body = await res.json();
      assertEquals(body.data.item.product.variant.id, secondVariantId);
      assertEquals(body.data.deletedItemId, null);
      cartItemId = body.data.item.id;
    });

    it("updates cart item variant (Case B: merge with existing target)", async () => {
      // 1. Add variantId (V1) to cart first
      const originalVariantCartItemId = await addCartItem({
        productId,
        variantId,
        quantity: 1,
        cardMessages: ["V1 Initial"],
      });

      // 2. Change secondVariantId (V2) back to variantId (V1)
      const mergeRes = await apiRequest(`/cart/items/${cartItemId}`, {
        method: "PATCH",
        body: {
          newVariantId: variantId,
          quantity: 2,
          cardMessages: ["Merged V2 -> V1"],
        },
      });

      assertEquals(mergeRes.status, 200);
      const mergeBody = await mergeRes.json();

      assertEquals(mergeBody.data.item.id, originalVariantCartItemId);
      assertEquals(mergeBody.data.deletedItemId, cartItemId);

      cartItemId = originalVariantCartItemId;
    });

    it("returns 400 Bad Request when updating to a variant of a different product", async () => {
      const otherProduct = await createProduct(
        userDb,
        supabaseService,
        genCreateProductInput(),
      );
      createdProductIds.push(otherProduct.id);
      const otherVariantId = otherProduct.variants[0].id;

      const res = await apiRequest(`/cart/items/${cartItemId}`, {
        method: "PATCH",
        body: {
          newVariantId: otherVariantId,
          quantity: 1,
          cardMessages: [],
        },
      });

      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(body.message, "Variant does not belong to the same product");
    });
  });

  it("deletes cart items", async () => {
    const res = await apiRequest("/cart/items", {
      method: "DELETE",
      body: {
        cartItemIds: [cartItemId],
      },
    });

    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.data.deletedItemIds.includes(cartItemId), true);
  });
});
