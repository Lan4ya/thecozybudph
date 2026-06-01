import { beforeAll, beforeEach, describe, expect, it } from "vitest";

/*
  Tests for CheckoutLoader.tsx
  - Uses a small localStorage mock so the Zustand persist middleware can initialize
  - Dynamically imports the loader and the zustand store after setting the mock
  - Exercises redirect and happy-path behavior explicitly
*/

function createLocalStorageMock() {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key: string, value: string) {
      store[key] = String(value);
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    key(index: number) {
      return Object.keys(store)[index] ?? null;
    },
    get length() {
      return Object.keys(store).length;
    },
  } as Storage;
}

// Ensure a localStorage is available before modules that reference it are imported
;(globalThis as any).localStorage = createLocalStorageMock();

let CheckoutLoader: any;
let useCheckoutStore: any;

beforeAll(async () => {
  // import after localStorage mock is in place
  const loaderMod = await import("../../src/pages/checkout/CheckoutLoader");
  CheckoutLoader = loaderMod.default;

  const storeMod = await import("../../src/pages/checkout/store/useCheckoutStore");
  useCheckoutStore = storeMod.useCheckoutStore;
});

beforeEach(() => {
  // reset persisted storage and zustand state to deterministic baseline
  (globalThis as any).localStorage.clear();

  useCheckoutStore.setState({
    checkoutIds: null,
    source: null,
    orderItemsUI: [],
    address: null,
    shipping: null,
    payment: {
      type: undefined,
      total: undefined,
      status: "idle",
    },
  });
});

describe("CheckoutLoader loader", () => {
  it("redirects to /shop when there's no checkout session", async () => {
    useCheckoutStore.setState({ checkoutIds: null });

    try {
      await CheckoutLoader({ params: { sessionId: "00000000-0000-4000-8000-000000000000" } });
      throw new Error("Expected loader to throw a redirect");
    } catch (err: any) {
      expect(err).toBeTruthy();
      // react-router redirect() returns a Response with a Location header
      expect(err.status).toBe(302);
      expect(err.headers?.get("Location")).toBe("/shop");
    }
  });

  it("redirects to payment status when payment is pending and payment id exists", async () => {
    const sessionId = "11111111-1111-4111-8111-111111111111";
    const paymentId = "22222222-2222-4222-8222-222222222222";

    useCheckoutStore.setState({
      checkoutIds: { session: sessionId, payment: paymentId },
      payment: { status: "pending" },
    });

    try {
      await CheckoutLoader({ params: { sessionId } });
      throw new Error("Expected loader to throw a redirect to payment status");
    } catch (err: any) {
      expect(err.status).toBe(302);
      expect(err.headers?.get("Location")).toBe(`/payment/${paymentId}/status`);
    }
  });

  it("allows navigation (returns null) when session matches and payment is idle", async () => {
    const sessionId = "33333333-3333-4333-8333-333333333333";
    const paymentId = "44444444-4444-4444-4444-444444444444";

    useCheckoutStore.setState({
      checkoutIds: { session: sessionId, payment: paymentId },
      payment: { status: "idle" },
    });

    const result = await CheckoutLoader({ params: { sessionId } });
    expect(result).toBeNull();
  });

  it("returns 404 when sessionId is invalid uuid or doesn't match stored session", async () => {
    const sessionIdStore = "55555555-5555-4555-8555-555555555555";

    useCheckoutStore.setState({
      checkoutIds: { session: sessionIdStore },
      payment: { status: "idle" },
    });

    // invalid uuid
    try {
      await CheckoutLoader({ params: { sessionId: "not-a-uuid" } });
      throw new Error("Expected loader to throw 404 for invalid uuid");
    } catch (err: any) {
      expect(err.status).toBe(404);
    }

    // mismatched uuid
    try {
      await CheckoutLoader({ params: { sessionId: "66666666-6666-4666-8666-666666666666" } });
      throw new Error("Expected loader to throw 404 for mismatched uuid");
    } catch (err: any) {
      expect(err.status).toBe(404);
    }
  });
});
