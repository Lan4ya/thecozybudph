import app from "@functions/profile/index.ts";
import { assert, assertEquals } from "@std/assert";
import { afterAll, beforeAll, describe, it } from "@std/testing/bdd";
import { getTestToken } from "../helpers/get-test-token.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

type ProfileData = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
};

describe("Profile API", () => {
  let authToken = "";
  let originalProfile: Pick<ProfileData, "name" | "phone"> | null = null;

  const apiRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    if (authToken) {
      headers.set("Authorization", `Bearer ${authToken}`);
    }

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
    authToken = await getTestToken();
    assertEquals(typeof authToken, "string");
    assertEquals(authToken.length > 0, true);

    const res = await apiRequest("/profile", { method: "GET" });
    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: ProfileData;
    };

    originalProfile = {
      name: body.data.name,
      phone: body.data.phone,
    };
  });

  afterAll(async () => {
    if (!authToken || !originalProfile) return;

    await apiRequest("/profile", {
      method: "PATCH",
      body: {
        name: originalProfile.name,
        phone: originalProfile.phone,
      },
    });
  });

  it("returns 401 when no Authorization header", async () => {
    const res = await app.request("/profile", {
      method: "GET",
    });

    assertEquals(res.status, 401);
  });

  it("returns 401 when invalid token", async () => {
    const res = await app.request("/profile", {
      method: "GET",
      headers: {
        Authorization: "Bearer invalid.token.here",
      },
    });

    assertEquals(res.status, 401);
  });

  it("gets the authenticated user's profile", async () => {
    const res = await apiRequest("/profile", {
      method: "GET",
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: ProfileData;
    };

    assert(body.data);
    assertEquals(typeof body.data.id, "string");
    assertEquals(typeof body.data.email, "string");
  });

  it("updates the user's profile (name and phone)", async () => {
    const updatePayload = {
      name: "Test User Updated",
      phone: "+639171234567",
    };

    const res = await apiRequest("/profile", {
      method: "PATCH",
      body: updatePayload,
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: ProfileData;
    };

    assertEquals(body.data.name, updatePayload.name);
    assertEquals(body.data.phone, updatePayload.phone);
  });

  it("verifies the profile updates persisted", async () => {
    const res = await apiRequest("/profile", {
      method: "GET",
    });

    assertEquals(res.status, 200);

    const body = (await res.json()) as {
      data: ProfileData;
    };

    assertEquals(body.data.name, "Test User Updated");
    assertEquals(body.data.phone, "+639171234567");
  });
});
