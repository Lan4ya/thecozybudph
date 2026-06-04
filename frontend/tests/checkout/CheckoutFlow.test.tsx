// import React from "react";
// import { vi, beforeEach, describe, it, expect } from "vitest";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { ToastProvider } from "../../src/providers/ToastProvider";
// import { useCheckoutStore } from "../../src/pages/checkout/store/useCheckoutStore";
//
// // Lightweight localStorage mock used by the zustand persist middleware
// function createLocalStorageMock() {
//   let store: Record<string, string> = {};
//   return {
//     getItem(key: string) {
//       return Object.prototype.hasOwnProperty.call(store, key)
//         ? store[key]
//         : null;
//     },
//     setItem(key: string, value: string) {
//       store[key] = String(value);
//     },
//     removeItem(key: string) {
//       delete store[key];
//     },
//     clear() {
//       store = {};
//     },
//     key(index: number) {
//       return Object.keys(store)[index] ?? null;
//     },
//     get length() {
//       return Object.keys(store).length;
//     },
//   } as Storage;
// }
//
// // Provide DOM timer/animation polyfills used by some UI libs
// if (!(globalThis as any).requestAnimationFrame) {
//   (globalThis as any).requestAnimationFrame = (cb: FrameRequestCallback) =>
//     setTimeout(cb, 0) as unknown as number;
// }
//
// (globalThis as any).localStorage = createLocalStorageMock();
//
// // Mock react-router hooks used by checkout children (navigate, params, NavLink/Link)
// const mockNavigate = vi.fn();
// const SESSION_ID = "11111111-1111-4111-8111-111111111111";
// vi.mock("react-router", () => {
//   const React = require("react");
//   return {
//     useNavigate: () => mockNavigate,
//     useParams: () => ({ sessionId: SESSION_ID }),
//     NavLink: (props: any) =>
//       React.createElement("a", { href: props.to, ...props }, props.children),
//     Link: (props: any) =>
//       React.createElement("a", { href: props.to, ...props }, props.children),
//   };
// });
//
// // Mock the API so no network calls are made and we can assert payloads
// const mockedCreateOrder = vi.fn(async (payload: unknown) => {
//   return {
//     orderId: "00000000-0000-4000-8000-000000000001",
//     paymentId: "00000000-0000-4000-8000-000000000002",
//   };
// });
// vi.mock("@/api", () => ({ OrderAPI: { createOrder: mockedCreateOrder } }));
//
// let Checkout: React.FC | null = null;
//
// beforeEach(async () => {
//   // reset mocks and localStorage
//   mockNavigate.mockReset();
//   mockedCreateOrder.mockReset();
//   (globalThis as any).localStorage.clear();
//
//   // reset zustand state to deterministic baseline
//   useCheckoutStore.setState({
//     checkoutIds: null,
//     source: null,
//     orderItemsUI: [],
//     address: null,
//     shipping: null,
//     payment: { type: undefined, total: undefined, status: "idle" },
//   });
//
//   // import the Checkout page after mocks are in place
//   const mod = await import("../../src/pages/checkout/Checkout");
//   Checkout = mod.default;
// });
//
// describe("Checkout end-to-end flow (unit)", () => {
//   it("happy path: pre-order -> createOrder called, store updated, navigates to pay", async () => {
//     // populate store with a valid payload that passes createOrderSchema validation
//     useCheckoutStore.setState({
//       checkoutIds: { session: SESSION_ID },
//       source: "shop",
//       orderItemsUI: [
//         {
//           quantity: 1,
//           cardMessages: [],
//           productId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
//           variantId: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
//           attributes: {},
//           name: "Test product",
//           priceCents: 1000,
//           imageUrl: "https://example.com/image.jpg",
//         },
//       ],
//       address: {
//         id: "cccccccc-cccc-4ccc-cccc-cccccccccccc",
//         fullName: "Jane Doe",
//         phoneNumber: "+639123456789",
//         addressLine: "123 Street",
//         barangay: "Barangay 1",
//         city: "City",
//         province: "Province",
//         region: "Region",
//         postalCode: "1234",
//         isDefault: true,
//       } as any,
//       shipping: { quotationId: "quote-1", fee: 100, serviceType: "motorcycle" },
//       payment: { type: "gcash", total: 1100, status: "idle" },
//     });
//
//     const qc = new QueryClient({
//       defaultOptions: {
//         queries: { retry: false },
//         mutations: { retry: false },
//       },
//     });
//
//     const { container } = render(
//       <QueryClientProvider client={qc}>
//         <ToastProvider>
//           <Checkout />
//         </ToastProvider>
//       </QueryClientProvider>,
//     );
//
//     // Find the Pre-order button and click it
//     const btn = await screen.findByRole("button", { name: /Pre-order/i });
//     expect(btn).toBeEnabled();
//
//     fireEvent.click(btn);
//
//     // Wait for the mocked API to have been called
//     await waitFor(() => {
//       expect(mockedCreateOrder).toHaveBeenCalled();
//     });
//
//     // Assert payload shape contains the important fields
//     const payload = (mockedCreateOrder.mock.calls[0] || [])[0];
//     expect(payload).toMatchObject({
//       source: "shop",
//       items: [
//         expect.objectContaining({
//           productId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
//           variantId: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
//           quantity: 1,
//         }),
//       ],
//       addressId: "cccccccc-cccc-4ccc-cccc-cccccccccccc",
//       shippingQuoteId: "quote-1",
//       paymentMethodType: "gcash",
//       serviceType: "motorcycle",
//     });
//
//     // onSuccess handler should set checkoutIds and payment status and navigate
//     await waitFor(() => {
//       const ids = useCheckoutStore.getState().checkoutIds;
//       expect(ids?.order).toBe("00000000-0000-4000-8000-000000000001");
//       expect(ids?.payment).toBe("00000000-0000-4000-8000-000000000002");
//       expect(useCheckoutStore.getState().payment?.status).toBe("verification");
//     });
//
//     expect(mockNavigate).toHaveBeenCalledWith(
//       `/checkout/${SESSION_ID}/order/00000000-0000-4000-8000-000000000001/pay`,
//     );
//
//     // snapshot of rendered output is useful for debugging regressions
//     expect(container).toMatchSnapshot();
//   });
//
//   it("disables pre-order button when required data missing (no shippingQuote)", async () => {
//     useCheckoutStore.setState({
//       checkoutIds: { session: SESSION_ID },
//       source: "shop",
//       orderItemsUI: [
//         {
//           quantity: 1,
//           cardMessages: [],
//           productId: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
//           variantId: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
//           attributes: {},
//           name: "Test product",
//           priceCents: 1000,
//           imageUrl: "https://example.com/image.jpg",
//         },
//       ],
//       address: { id: "cccccccc-cccc-4ccc-cccc-cccccccccccc" } as any,
//       shipping: null,
//       payment: { type: "gcash", total: 1100, status: "idle" },
//     });
//
//     const qc = new QueryClient({
//       defaultOptions: { queries: { retry: false } },
//     });
//
//     render(
//       <QueryClientProvider client={qc}>
//         <ToastProvider>
//           <Checkout />
//         </ToastProvider>
//       </QueryClientProvider>,
//     );
//
//     const btn = await screen.findByRole("button", { name: /Pre-order/i });
//     expect(btn).toBeDisabled();
//   });
// });
