import app from "@functions/address/index.ts";
import { createDrizzle, supabaseService } from "@shared/db/client.ts";
import { AppError } from "@shared/errors/Errors.ts";
import { AddressData, addresses } from "@shared/schemas/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { eq, inArray } from "drizzle-orm";
import { getTestToken, getTestAdminToken } from "../helpers/utils.ts";
import { genCreateAddressInput } from "../helpers/inputs.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

describe("Addresses API", () => {
  let token = "";
  let adminToken = "";
  let db: ReturnType<typeof createDrizzle>;
  let addressId = "";
  const createdIds: string[] = [];

  const getUserContext = async (jwtToken: string) => {
    const { data } = await supabaseService.auth.getClaims(jwtToken);
    if (!data) throw AppError.forbidden({ message: "Invalid token" });

    const jwt = data.claims;
    return {
      token: jwtToken,
      db: createDrizzle(jwt),
    };
  };

  const apiRequest = async (
    path: string,
    init: JsonRequestInit = {},
    customToken?: string,
  ) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${customToken ?? token}`);

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

  beforeAll(async () => {
    token = await getTestToken();
    adminToken = await getTestAdminToken();
    const ctx = await getUserContext(token);
    db = ctx.db;

    // Seed initial address
    const res = await apiRequest("/address", {
      method: "POST",
      body: genCreateAddressInput(),
    });
    const body = await res.json();
    addressId = body.data.id;
    createdIds.push(addressId);
  });

  afterAll(async () => {
    if (createdIds.length > 0) {
      await db.admin.delete(addresses).where(inArray(addresses.id, createdIds));
    }
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
      data: AddressData[];
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
    assertEquals(body.data.isDefault, true);
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
