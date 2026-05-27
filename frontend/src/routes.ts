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
import AccountPage from "./pages/profile/pages/settings/pages/account/AccountPage.tsx";
import AddAddressPage from "./pages/profile/pages/settings/pages/account/pages/AddAddressPage.tsx";
import EditAddressPage from "./pages/profile/pages/settings/pages/account/pages/EditAddressPage.tsx";
import NotificationsPage from "./pages/profile/pages/settings/pages/notification/NotificationsPage.tsx";
import PrivacyPage from "./pages/profile/pages/settings/pages/privacy/PrivacyPage.tsx";
import {
  AdminDashboardLoader,
  AdminDashboard,
  AdminDashboardEvents,
  AdminDashboardOrders,
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
              { path: "item/:itemId", Component: OrderDetails },
            ],
          },
          {
            path: "settings",
            Component: Settings,
            children: [
              { index: true, loader: () => redirect("account") },
              {
                path: "account",
                Component: AccountPage,
              },
              { path: "notifications", Component: NotificationsPage },
              { path: "privacy", Component: PrivacyPage },
            ],
          },
          { path: "settings/account/address/add", Component: AddAddressPage },
          {
            path: "settings/account/address/:addressId/edit",
            Component: EditAddressPage,
          },
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
