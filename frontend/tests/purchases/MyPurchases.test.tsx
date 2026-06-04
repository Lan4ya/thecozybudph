import React from "react";
import { vi, beforeEach, describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "../../src/providers/ToastProvider";
import MyPurchases from "../../src/pages/profile/pages/my-purchases/MyPurchases";

// Mock react-router
const mockNavigate = vi.fn();
vi.mock("react-router", () => {
  const React = require("react");
  return {
    useNavigate: () => mockNavigate,
    Link: (props: any) =>
      React.createElement("a", { href: props.to, ...props }, props.children),
  };
});

// Mock the API
const mockQueryOrders = vi.fn();
vi.mock("@/api", () => ({
  OrderAPI: {
    queryOrders: (...args: any[]) => mockQueryOrders(...args),
  },
}));

// Mock FlowerSpinner and PersistSuspense to avoid heavy rendering
vi.mock("@/components/RouteLoaderSpinner", () => ({
  FlowerSpinner: () =>
    React.createElement("div", { "data-testid": "loading" }, "Loading..."),
}));

vi.mock("@/components/PersistSuspense", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("MyPurchases Component", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.resetAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          suspense: true,
        },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{ui}</ToastProvider>
      </QueryClientProvider>,
    );
  };

  it("renders order list correctly", async () => {
    const mockOrders = [
      {
        item: {
          id: "item-1",
          quantity: 1,
          name: "Red Roses",
          category: "Bouquet",
          primaryImageUrl: "https://example.com/rose.jpg",
          variantAttributes: { color: "red" },
          priceCents: 5000,
        },
        id: "order-1",
        status: "toShip",
        totalCents: 5500,
        expiresAt: new Date().toISOString(),
      },
    ];

    mockQueryOrders.mockResolvedValue(mockOrders);

    renderWithProviders(<MyPurchases />);

    expect(await screen.findByText("My Purchases")).toBeInTheDocument();
    expect(await screen.findByText("Red Roses")).toBeInTheDocument();

    // Use getAllByText or find specific status badge
    const statusBadges = await screen.findAllByText("To Ship");
    expect(statusBadges.length).toBeGreaterThan(0);
  });

  it("changes tabs and filters orders", async () => {
    mockQueryOrders.mockResolvedValue([]);

    renderWithProviders(<MyPurchases />);

    const toShipTab = await screen.findByRole("tab", { name: /To Ship/i });
    fireEvent.click(toShipTab);

    await waitFor(() => {
      expect(mockQueryOrders).toHaveBeenCalledWith(
        expect.objectContaining({ status: "toShip" }),
      );
    });
  });

  it("shows empty state when no orders found", async () => {
    mockQueryOrders.mockResolvedValue([]);

    renderWithProviders(<MyPurchases />);

    expect(await screen.findByText("No orders yet")).toBeInTheDocument();
    expect(screen.getByText("Explore Products")).toBeInTheDocument();
  });
});
