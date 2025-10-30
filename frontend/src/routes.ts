import { createBrowserRouter, redirect } from "react-router";
import Root from "./pages/Root.tsx";
import Home from "./pages/home/Home.tsx";
import Shop from "./pages/shop/Shop.tsx";
import About from "./pages/about/About.tsx";
import Contact from "./pages/contact/Contact.tsx";
import Events from "./pages/events/Events.tsx";
import AdminDashboard, {
  AdminDashboardFallback,
  loader as AdminLoader,
} from "./pages/admin/AdminDashboard.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboardProducts from "./pages/admin/components/admin-dashboard-orders/AdminDashboardStocks.tsx";
import AdminDashboardOrders from "./pages/admin/components/admin-dashboard-stocks/AdminDashboardOrders.tsx";
import { CatchAllErrorPage } from "./pages/ErrorPage.tsx";

const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: CatchAllErrorPage,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "shop", Component: Shop },
      { path: "events", Component: Events },
      { path: "contact", Component: Contact },
    ],
  },
  {
    path: `/admin-${admin_route_hash}/login`,
    Component: AdminLogin,
    ErrorBoundary: CatchAllErrorPage,
  },
  {
    path: `/admin-${admin_route_hash}/dashboard`,
    loader: AdminLoader,
    HydrateFallback: AdminDashboardFallback,
    Component: AdminDashboard,
    ErrorBoundary: CatchAllErrorPage,
    children: [
      {
        index: true,
        loader: () => redirect("products"),
      },
      { path: "products", Component: AdminDashboardProducts },
      { path: "orders", Component: AdminDashboardOrders },
    ],
  },
]);

export default router;
