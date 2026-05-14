import { buildApp, buildRoute } from "@shared/factory/mod.ts";
import { assertEquals } from "@std/assert";
import "@std/dotenv/load";
import { describe, it } from "@std/testing/bdd";
import { createClient } from "supabase";
import {
  createOrderHandler,
  payOrderHandler,
} from "../checkout/checkout-handlers.ts";
import { getTestAdminToken, getTestToken } from "./helpers/get-test-token.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const route = buildRoute({
  middlewares: ["drizzle"],
});

route.post("/order", ...createOrderHandler);
route.post("/product/:id/pay", ...payOrderHandler);

const app = buildApp("checkout", route);

describe(
  "/checkout/order",
  {
    sanitizeResources: false,
    sanitizeOps: false,
  },
  () => {
    it("creates order", async () => {
      const token = await getTestToken(supabase);

      const res = await app.request("/checkout/order", {
        method: "POST",
        // @ts-ignore -- Deno and Undici FormData types are incompatible only at type level
        body: createProductForm(),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
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
