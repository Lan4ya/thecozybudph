import { createBrowserRouter, redirect } from "react-router";
import { RouteLoaderSpinner } from "./components/RouteLoaderSpinner.tsx";
import { CatchAllErrorPage } from "./pages/ErrorPage.tsx";
import Root from "./pages/Root.tsx";
import RootLoader from "./pages/RootLoader.tsx";
import About from "./pages/about/About.tsx";
import { AuthLoader, ConfirmEmail, Login, Signup } from "./pages/auth";
import Cart from "./pages/cart/Cart.tsx";
import Contact from "./pages/contact/Contact.tsx";
import Events from "./pages/events/Events.tsx";
import Home from "./pages/home/Home.tsx";
import PrivacyPolicy from "./pages/privacy-policy/PrivacyPolicy.tsx";
import Profile from "./pages/profile/Profile.tsx";
import { Shop, ShopProduct } from "./pages/shop";
import TermsOfService from "./pages/terms-of-service/TermsOfService.tsx";
import FAQ from "./pages/FAQ/FAQ.tsx";
import MyPurchases from "./pages/profile/pages/my-purchases/MyPurchases.tsx";
import OrderDetails from "./pages/profile/pages/my-purchases/OrderDetails.tsx";
import Settings from "./pages/profile/pages/settings/Settings.tsx";
import {
  AdminDashboardLoader,
  AdminDashboard,
  AdminDashboardEvents,
  AdminDashboardOrders,
  AdminDashboardUsers,
  AdminDashboardAnalytics,
  AdminDashboardProducts,
} from "@/pages/profile/pages/admin-dashboard/index.ts";
import {
  Checkout,
  CheckoutLoader,
  CheckoutAddressSelection,
  CheckoutPaymentConfirmation,
  CheckoutPaymentConfirmationLoader,
} from "@/pages/checkout/index.ts";
import {
  CheckoutPaymentStatus,
  CheckoutPaymentStatusLoader,
} from "./pages/payment/index.ts";

const router = createBrowserRouter([
  {
    path: "/",
    loader: RootLoader,
    Component: Root,
    ErrorBoundary: CatchAllErrorPage,
    children: [
      { index: true, Component: Home },

      {
        path: "auth/signup",
        loader: AuthLoader,
        Component: Signup,
      },

      {
        path: "auth/confirm-email",
        loader: AuthLoader,
        Component: ConfirmEmail,
      },

      {
        path: "auth/login",
        loader: AuthLoader,
        Component: Login,
      },

      {
        path: "profile",
        children: [
          { index: true, Component: Profile },
          {
            path: "my-purchases",
            children: [
              { index: true, Component: MyPurchases },
              { path: ":orderId", Component: OrderDetails },
            ],
          },
          { path: "settings", Component: Settings },
          {
            path: "admin",
            loader: AdminDashboardLoader,
            HydrateFallback: RouteLoaderSpinner,
            Component: AdminDashboard,
            children: [
              {
                index: true,
                loader: () => redirect("products"),
                Component: AdminDashboardProducts,
              },
              { path: "products", Component: AdminDashboardProducts },
              { path: "orders", Component: AdminDashboardOrders },
              { path: "users", Component: AdminDashboardUsers },
              { path: "analytics", Component: AdminDashboardAnalytics },
              { path: "events", Component: AdminDashboardEvents },
            ],
          },
        ],
      },

      {
        path: "shop",
        children: [
          { index: true, Component: Shop },
          {
            path: "products/:id",
            Component: ShopProduct,
          },
        ],
      },

      {
        path: "checkout/:sessionId",
        children: [
          { index: true, Component: Checkout, loader: CheckoutLoader },
          {
            path: "address-selection",
            Component: CheckoutAddressSelection,
            loader: CheckoutLoader,
          },
          {
            path: "order/:orderId/pay",
            Component: CheckoutPaymentConfirmation,
            loader: CheckoutPaymentConfirmationLoader,
          },
        ],
      },

      {
        path: "payment/:paymentId/status",
        Component: CheckoutPaymentStatus,
        loader: CheckoutPaymentStatusLoader,
      },

      { path: "events", Component: Events },

      { path: "cart", Component: Cart },

      { path: "contact", Component: Contact },

      { path: "terms-of-service", Component: TermsOfService },

      { path: "privacy-policy", Component: PrivacyPolicy },

      { path: "about", Component: About },

      { path: "FAQ", Component: FAQ },
    ],
  },
]);

export default router;
