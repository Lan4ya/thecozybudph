import app from "@functions/admin/index.ts";
import { adminDb } from "@shared/db/client.ts";
import { products } from "@shared/schemas/index.ts";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { eq } from "drizzle-orm";
import { getTestToken, getTestAdminToken } from "../helpers/get-test-token.ts";
import { genCreateProductForm } from "../helpers/inputs.ts";

describe("Admin Products API", () => {
  it("returns 403 Forbidden", async () => {
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

  const createSeedProduct = async () => {
    const headers = await authHeaders();
    const res = await app.request("/admin/product", {
      method: "POST",
      // @ts-ignore -- Deno and Node type incompatibily
      body: genCreateProductForm(),
      headers,
    });

    assertEquals(res.status, 200);

    const body = await res.json();
    const productId = body.data?.id;

    assertEquals(!!productId, true);

    return { productId, headers };
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

    assertEquals(!!productId, true);

    await adminDb.delete(products).where(eq(products.id, productId));
  });

  it("updates product: PATCH", async () => {
    const { productId, headers } = await createSeedProduct();

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

    await adminDb.delete(products).where(eq(products.id, productId));
  });

  it("deletes product", async () => {
    const { productId, headers } = await createSeedProduct();

    await deleteSeedProduct(productId, headers);
  });
});
