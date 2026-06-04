import app from "@functions/event/index.ts";
import { assert, assertEquals } from "@std/assert";
import { describe, it, beforeAll } from "@std/testing/bdd";
import { getTestToken, getTestAdminToken } from "../helpers/utils.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

describe("Event Inquiry API", () => {
  let authToken = "";
  let adminToken = "";
  let createdInquiryId = "";

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

  const adminRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${adminToken}`);

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
    adminToken = await getTestAdminToken();
  });

  const validInquiry = {
    name: "Test User",
    email: "test@example.com",
    phone: "+639123456789",
    eventType: "wedding",
    eventDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    message: "Test message with enough characters",
    guestCount: 100,
    venue: "Test Venue",
    budget: "50k-100k",
  };

  it("creates a new event inquiry (guest)", async () => {
    const res = await app.request("/event/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validInquiry),
    });

    assertEquals(res.status, 200);
    const body = await res.json();
    assert(body.data);
    assertEquals(body.data.name, validInquiry.name);
    assertEquals(body.data.status, "new");
    createdInquiryId = body.data.id;
  });

  it("creates a new event inquiry (authenticated)", async () => {
    const res = await apiRequest("/event/inquiry", {
      method: "POST",
      body: validInquiry,
    });

    assertEquals(res.status, 200);
    const body = await res.json();
    assert(body.data);
    assert(body.data.profileId !== null);
  });

  it("queries user's own inquiries", async () => {
    const res = await apiRequest("/event/inquiry", {
      method: "GET",
    });

    assertEquals(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.data));
    assert(body.data.length > 0);
  });

  it("returns 401 for user inquiries without auth", async () => {
    const res = await app.request("/event/inquiry", {
      method: "GET",
    });

    assertEquals(res.status, 401);
  });

  it("queries all inquiries as admin", async () => {
    const res = await adminRequest("/event/inquiry/admin", {
      method: "GET",
    });

    assertEquals(res.status, 200);
    const body = await res.json();
    assert(Array.isArray(body.data));
    assert(body.data.length > 0);
  });

  it("returns 403 for query admin inquiries as user", async () => {
    const res = await apiRequest("/event/inquiry/admin", {
      method: "GET",
    });

    assertEquals(res.status, 403);
  });

  it("updates event inquiry status as admin", async () => {
    assert(createdInquiryId, "Must have a created inquiry ID");
    const payload = {
      status: "contacted",
      adminNote: "Talked to the customer, they are interested in options.",
    };

    const res = await adminRequest(`/event/inquiry/${createdInquiryId}`, {
      method: "PATCH",
      body: payload,
    });

    assertEquals(res.status, 200);
    const body = await res.json();
    assert(body.data);
    assertEquals(body.data.status, "contacted");
    assertEquals(body.data.adminNote, payload.adminNote);
  });

  it("returns 403 for update event inquiry status as user", async () => {
    assert(createdInquiryId, "Must have a created inquiry ID");
    const payload = {
      status: "contacted",
    };

    const res = await apiRequest(`/event/inquiry/${createdInquiryId}`, {
      method: "PATCH",
      body: payload,
    });

    assertEquals(res.status, 403);
  });

  it("returns 422 for invalid event inquiry data", async () => {
    const invalidInquiry = { ...validInquiry, email: "invalid-email" };
    const res = await app.request("/event/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidInquiry),
    });

    assertEquals(res.status, 422);
  });

  it("returns 422 for update with invalid status", async () => {
    assert(createdInquiryId, "Must have a created inquiry ID");
    const payload = {
      status: "invalid-status",
    };

    const res = await adminRequest(`/event/inquiry/${createdInquiryId}`, {
      method: "PATCH",
      body: payload,
    });

    assertEquals(res.status, 422);
  });

  it("returns 404 for updating non-existent inquiry", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";
    const payload = {
      status: "contacted",
    };

    const res = await adminRequest(`/event/inquiry/${nonExistentId}`, {
      method: "PATCH",
      body: payload,
    });

    assertEquals(res.status, 404);
  });
});
