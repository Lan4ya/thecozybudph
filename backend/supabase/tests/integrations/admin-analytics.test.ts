import adminApp from "@functions/admin/index.ts";
import { supabaseService } from "@shared/db/client.ts";
import { assertEquals, assert } from "@std/assert";
import { describe, it, beforeAll } from "@std/testing/bdd";
import { getTestToken, getTestAdminToken } from "../helpers/utils.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

describe("Admin Analytics API", () => {
  let userToken = "";
  let adminToken = "";

  const adminRequest = async (path: string, init: JsonRequestInit = {}) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${adminToken}`);

    let body: string | undefined;
    if (init.body !== undefined && init.body !== null) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(init.body);
    }

    return await adminApp.request(path, {
      method: init.method,
      headers,
      body,
    });
  };

  beforeAll(async () => {
    userToken = await getTestToken();
    adminToken = await getTestAdminToken();
  });

  describe("Security", () => {
    it("returns 401 Unauthorized when no token is provided", async () => {
      const res = await adminApp.request("/admin/analytics", { method: "GET" });
      assertEquals(res.status, 401);
    });

    it("returns 403 Forbidden for non-admin users", async () => {
      const headers = { Authorization: `Bearer ${userToken}` };
      const res = await adminApp.request("/admin/analytics", {
        method: "GET",
        headers,
      });
      assertEquals(res.status, 403);
    });
  });

  describe("Data Retrieval", () => {
    it("successfully retrieves live analytics data", async () => {
      const res = await adminRequest("/admin/analytics", { method: "GET" });
      
      assertEquals(res.status, 200);
      
      const body = await res.json();
      const data = body.data;

      // Verify structure
      assert(data.keyMetrics);
      assert(data.keyMetrics.totalRevenue);
      assert(data.keyMetrics.totalOrders);
      assert(data.keyMetrics.totalCustomers);
      assert(data.keyMetrics.conversionRate);
      
      assert(Array.isArray(data.revenueTrend));
      assert(Array.isArray(data.categorySales));
      assert(Array.isArray(data.topProducts));
      assert(Array.isArray(data.dailyOrders));
      assert(Array.isArray(data.customerAcquisition));
      assert(Array.isArray(data.recentTransactions));
      assert(Array.isArray(data.productPerformance));

      // Verify that customerAcquisition is returned (even if mocked in backend)
      assertEquals(data.customerAcquisition.length > 0, true);
    });
  });
});
