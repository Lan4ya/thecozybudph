import app from "@functions/admin/index.ts";
import { adminDb } from "@shared/db/client.ts";
import { products } from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, describe, it } from "@std/testing/bdd";
import { inArray } from "drizzle-orm";
import { getTestToken, getTestAdminToken } from "../helpers/utils.ts";
import { genCreateProductForm } from "../helpers/inputs.ts";

describe("Admin Products API", () => {
  const createdProductIds: string[] = [];

  afterAll(async () => {
    if (createdProductIds.length > 0) {
      await adminDb
        .delete(products)
        .where(inArray(products.id, createdProductIds));
    }
  });

  it("returns 401 Unauthorized when no token is provided", async () => {
    const res = await app.request("/admin/product", {
      method: "POST",
      // @ts-ignore
      body: genCreateProductForm(),
    });

    assertEquals(res.status, 401);
  });

  it("returns 403 Forbidden for non-admin users", async () => {
    const token = await getTestToken();

    const res = await app.request("/admin/product", {
      method: "POST",
      // @ts-ignore -- Deno and Node type incompatibily
      body: genCreateProductForm(),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    assertEquals(res.status, 403);
  });

  const authHeaders = async () => {
    const token = await getTestAdminToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const createSeedProduct = async (overrides: any = {}) => {
    const headers = await authHeaders();
    const res = await app.request("/admin/product", {
      method: "POST",
      // @ts-ignore -- Deno and Node type incompatibily
      body: genCreateProductForm(overrides),
      headers,
    });

    if (res.status === 200) {
      const body = await res.json();
      const productId = body.data?.id;
      if (productId) {
        createdProductIds.push(productId);
      }
      return { productId, headers, res };
    }

    return { headers, res };
  };

  const deleteSeedProduct = async (
    productId: string,
    headers: Record<string, string>,
  ) => {
    const res = await app.request("/admin/product", {
      method: "DELETE",
      body: JSON.stringify({ productIds: [productId] }),
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    assertEquals(res.status, 200);
  };

  it("creates a product: POST", async () => {
    const { productId } = await createSeedProduct();
    assert(productId);
  });

  it("returns 400 Bad Request for invalid product payload (missing variants)", async () => {
    const { res } = await createSeedProduct({ variants: [] });
    assertEquals(res.status, 400);
  });

  it("updates product: PATCH", async () => {
    const { productId, headers } = await createSeedProduct();
    assert(productId);

    const updateRes = await app.request(`/admin/product/${productId}`, {
      method: "PATCH",
      // @ts-ignore -- Deno and Node type incompatibily
      body: genCreateProductForm({
        name: "updated name test",
        options: [
          {
            name: "stem count",
            values: ["3", "6"],
          },
        ],
        variants: [
          {
            priceCents: 10000,
            attributes: { "stem count": "3" },
          },
          {
            priceCents: 20000,
            attributes: { "stem count": "6" },
          },
        ],
      }) as BodyInit,
      headers,
    });

    assertEquals(updateRes.status, 200);

    const updateBody = await updateRes.json();
    assertEquals(updateBody.data.name, "updated name test");
    assertEquals(updateBody.data.variants.length, 2);
  });

  it("returns 404 Not Found when updating non-existent product", async () => {
    const headers = await authHeaders();
    const fakeId = crypto.randomUUID();
    const res = await app.request(`/admin/product/${fakeId}`, {
      method: "PATCH",
      // @ts-ignore
      body: genCreateProductForm(),
      headers,
    });

    assertEquals(res.status, 404);
  });

  it("deletes product", async () => {
    const { productId, headers } = await createSeedProduct();
    assert(productId);

    await deleteSeedProduct(productId, headers);
  });

  it("bulk deletes products", async () => {
    const { productId: id1, headers } = await createSeedProduct();
    const { productId: id2 } = await createSeedProduct();
    assert(id1);
    assert(id2);

    const res = await app.request("/admin/product", {
      method: "DELETE",
      body: JSON.stringify({ productIds: [id1, id2] }),
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
    });

    assertEquals(res.status, 200);

    // Verify they are gone
    const remaining = await adminDb.query.products.findMany({
      where: inArray(products.id, [id1, id2]),
    });
    assertEquals(remaining.length, 0);
  });
});
