import { createBrowserRouter, redirect } from "react-router";
import Root from "./pages/Root.tsx";
import Home from "./pages/home/Home.tsx";
import Shop from "./pages/shop/Shop.tsx";
import Cart from "./pages/cart/Cart.tsx";
import About from "./pages/about/About.tsx";
import Contact from "./pages/contact/Contact.tsx";
import Events from "./pages/events/Events.tsx";
import AdminDashboard, {
  loader as AdminLoader,
} from "./pages/admin/Dashboard.tsx";
import AdminLogin from "./pages/admin/pages/login/Login.tsx";
import AdminDashboardProducts from "./pages/admin/pages/products/Products.tsx";
import AdminDashboardOrders from "./pages/admin/pages/orders/Orders.tsx";
import { CatchAllErrorPage } from "./pages/ErrorPage.tsx";
import { RouteLoader } from "./components/RouteLoaderFallback.tsx";
import { ProductCheckout } from "./pages/shop/pages/product-checkout/Checkout.tsx";
import Login from "./pages/auth/Login.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import SignUp from "./pages/auth/Signup.tsx";
import TOS from "./pages/TOS/TOS.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy.tsx";

const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: CatchAllErrorPage,
    children: [
      { index: true, Component: Home },
      { path: "auth/signup", Component: SignUp },
      { path: "auth/login", Component: Login },
      { path: "dashboard", Component: Dashboard },
      { path: "about", Component: About },
      {
        path: "shop",
        children: [
          { index: true, Component: Shop },
          {
            path: "products/:id",
            Component: ProductCheckout,
          },
        ],
      },
      { path: "events", Component: Events },
      { path: "cart", Component: Cart },
      { path: "contact", Component: Contact },
      { path: "terms-of-service", Component: TOS },
      { path: "privacy-policy", Component: PrivacyPolicy },
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
    HydrateFallback: RouteLoader,
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
