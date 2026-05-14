import "@std/dotenv/load";
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createClient } from "supabase";
import { buildApp, buildRoute } from "@shared/factory/mod.ts";
import {
  createProductHandler,
  deleteProductHandler,
  updateProductHandler,
} from "../admin/admin-handlers.ts";
import { getTestAdminToken, getTestToken } from "./helpers/get-test-token.ts";
import { fakeAuthMiddleware } from "./helpers/fake-middlewares.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const route = buildRoute({
  middlewares: ["supabase", "auth", "admin", "supabaseService", "drizzle"],
  overrides: {
    auth: fakeAuthMiddleware(),
  },
});

route.post("/product", ...createProductHandler);
route.patch("/product/:id", ...updateProductHandler);
route.delete("/product", ...deleteProductHandler);

const app = buildApp("admin", route);

type ProductFormOverrides = Record<string, string>;

function createProductForm(overrides: ProductFormOverrides = {}) {
  const form = new FormData();

  const defaults: Record<string, string> = {
    name: "Rose Bouquet",
    description: "Test description",
    categoryName: "flowers",
    collectionName: "summer",
    primaryImageIndex: "0",

    options: JSON.stringify([
      {
        name: "size",
        values: ["small", "medium"],
      },
    ]),

    variants: JSON.stringify([
      {
        priceCents: 10000,
        attributes: {
          size: "small",
        },
      },
      {
        priceCents: 15000,
        attributes: {
          size: "medium",
        },
      },
    ]),
  };

  for (const [key, value] of Object.entries({
    ...defaults,
    ...overrides,
  })) {
    form.set(key, value);
  }

  form.append(
    "productImages",
    new File(["abc"], "test.jpg", {
      type: "image/jpeg",
    }),
  );

  return form;
}

async function cleanupProduct(productId?: string) {
  if (!productId) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    throw new Error(`Failed to delete test product: ${error.message}`);
  }
}

describe(
  "/admin/product",
  {
    sanitizeResources: false,
    sanitizeOps: false,
  },
  () => {
    let productId: string;

    it("returns 403 Forbidden", async () => {
      const token = await getTestToken(supabase);

      const res = await app.request("/admin/product", {
        method: "POST",
        // @ts-ignore -- Deno and Undici FormData types are incompatible only at type level
        body: createProductForm(),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assertEquals(res.status, 403);
    });

    it("creates product: POST", async () => {
      const token = await getTestAdminToken(supabase);

      const res = await app.request("/admin/product", {
        method: "POST",
        // @ts-ignore -- Deno and Undici FormData types are incompatible only at type level
        body: createProductForm(),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assertEquals(res.status, 200);

      const body = await res.json();

      assertEquals(!!body.data, true);

      productId = body.data.id;

      assertEquals(!!productId, true);

      await cleanupProduct(productId);
    });

    it("updates product: PATCH", async () => {
      const token = await getTestAdminToken(supabase);

      // create seed product first
      const createRes = await app.request("/admin/product", {
        method: "POST",
        // @ts-ignore -- Deno and Undici FormData types are incompatible only at type level
        body: createProductForm(),
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const createBody = await createRes.json();

      const productId = createBody.data.id;

      const updateRes = await app.request(`/admin/product/${productId}`, {
        method: "PATCH",
        // @ts-ignore -- Deno and Undici FormData types are incompatible only at type level
        body: createProductForm({
          name: "updated name test",

          options: JSON.stringify([
            {
              name: "stem count",
              values: ["3", "6"],
            },
          ]),

          variants: JSON.stringify([
            {
              priceCents: 10000,
              attributes: {
                "stem count": "3",
              },
            },
            {
              priceCents: 20000,
              attributes: {
                "stem count": "6",
              },
            },
          ]),
        }),

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assertEquals(updateRes.status, 200);

      const updateBody = await updateRes.json();

      assertEquals(updateBody.data.name, "updated name test");

      await cleanupProduct(productId);
    });

    it("deletes product", async () => {
      const token = await getTestAdminToken(supabase);

      // seed product
      const createRes = await app.request("/admin/product", {
        method: "POST",

        // @ts-ignore -- Deno and Undici FormData types are incompatible only at type level
        body: createProductForm(),

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      assertEquals(createRes.status, 200);

      const createBody = await createRes.json();

      const productId = createBody.data.id;

      assertEquals(!!productId, true);

      // delete product
      const deleteRes = await app.request("/admin/product", {
        method: "DELETE",
        body: JSON.stringify({ productIds: [productId] }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      assertEquals(deleteRes.status, 200);
    });
  },
);
