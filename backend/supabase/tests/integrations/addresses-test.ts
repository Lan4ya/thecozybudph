import app from "@functions/address/index.ts";
import { createDrizzle, supabaseService } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { Address, addresses } from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { eq } from "drizzle-orm";
import { getTestToken } from "../helpers/get-test-token.ts";
import { genCreateAddressInput } from "../helpers/inputs.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

describe("Addresses API", () => {
  let token = "";
  let db: ReturnType<typeof createDrizzle>;
  let addressId = "";

  const getUserContext = async () => {
    const token = await getTestToken();
    const { data } = await supabaseService.auth.getClaims(token);
    if (!data) throw AppError.forbidden("Invalid token");

    const jwt = data.claims;
    return {
      token,
      db: createDrizzle(jwt),
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

  const seedAddress = async () => {
    const res = await apiRequest("/address", {
      method: "POST",
      body: genCreateAddressInput(),
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: { id: string };
    };

    assert(body.data.id);
    addressId = body.data.id;
  };

  const cleanup = async () => {
    if (!addressId) return;

    await db.admin.delete(addresses).where(eq(addresses.id, addressId));
  };

  beforeAll(async () => {
    const ctx = await getUserContext();
    token = ctx.token;
    db = ctx.db;

    await seedAddress();
  });

  afterAll(async () => {
    await cleanup();
  });

  it("creates an address", () => {
    assert(addressId);
  });

  it("gets all addresses", async () => {
    const res = await apiRequest("/address", {
      method: "GET",
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: Address[];
    };

    assertEquals(Array.isArray(body.data), true);

    const found = body.data.find((a) => a.id === addressId);
    assert(found);
  });

  it("gets default address", async () => {
    const res = await apiRequest("/address/default", {
      method: "GET",
    });

    assertEquals(res.status, 200);

    const body = await res.json();
    assert(body.data);
  });

  it("updates an address", async () => {
    const res = await apiRequest(`/address/${addressId}`, {
      method: "PATCH",
      body: {
        fullName: "Updated Name",
      },
    });

    assertEquals(res.status, 200);

    const body = await res.json();
    assertEquals(body.data.fullName, "Updated Name");
  });
});
