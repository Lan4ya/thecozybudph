import app from "@functions/auth/index.ts";
import { assert, assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { stub } from "@std/testing/mock";
import { AuthActions } from "@shared/modules/auth/mod.ts";
import { TEST_USER_EMAIL } from "../helpers/setup.ts";
import { getTestToken } from "../helpers/utils.ts";

type JsonRequestInit = {
  method?: string;
  headers?: HeadersInit;
  body?: unknown;
};

describe("Auth API", () => {
  const apiRequest = async (
    path: string,
    init: JsonRequestInit = {},
    token?: string,
  ) => {
    const headers = new Headers(init.headers);
    const authToken = token;
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

  describe("POST /auth/password-reset", () => {
    it("requests a password reset", async () => {
      const requestPasswordResetStub = stub(
        AuthActions,
        "requestPasswordReset",
        () => Promise.resolve({ success: true }),
      );

      try {
        const res = await apiRequest("/auth/password-reset", {
          method: "POST",
          body: {
            email: TEST_USER_EMAIL,
            cfTurnstileToken: "dummy-token",
          },
        });

        assertEquals(res.status, 200);
        const body = await res.json();
        assertEquals(body.data.success, true);
      } finally {
        requestPasswordResetStub.restore();
      }
    });

    it("returns 422 on invalid email", async () => {
      const res = await apiRequest("/auth/password-reset", {
        method: "POST",
        body: {
          email: "invalid-email",
          cfTurnstileToken: "dummy-token",
        },
      });

      assertEquals(res.status, 422);
    });
  });

  describe("POST /auth/resend-verification", () => {
    it("resends verification email", async () => {
      const resendEmailVerificationStub = stub(
        AuthActions,
        "resendEmailVerification",
        () => Promise.resolve({ success: true }),
      );

      try {
        const res = await apiRequest("/auth/resend-verification", {
          method: "POST",
          body: {
            email: TEST_USER_EMAIL,
          },
        });

        assertEquals(res.status, 200);
        const body = await res.json();
        assertEquals(body.data.success, true);
      } finally {
        resendEmailVerificationStub.restore();
      }
    });

    it("returns 422 on invalid email", async () => {
      const res = await apiRequest("/auth/resend-verification", {
        method: "POST",
        body: {
          email: "not-an-email",
        },
      });

      assertEquals(res.status, 422);
    });
  });
});
