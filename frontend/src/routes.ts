import { lazy } from "react";
import { createBrowserRouter, redirect } from "react-router";
import { CatchAllErrorPage } from "./pages/ErrorPage.tsx";
import Root from "./pages/Root.tsx";
import RootLoader from "./pages/RootLoader.tsx";
import {
  AuthLoader,
  ForgotPasswordCheckEmailLoader,
  ForgotPasswordResetPasswordLoader,
} from "./pages/auth";
import { AdminDashboardLoader } from "@/pages/profile/pages/admin-dashboard/index.ts";
import { CheckoutLoader } from "@/pages/checkout/index.ts";
import {
  PaymentConfirmationLoader,
  PaymentStatusLoader,
} from "@/pages/payment/index.ts";
import CheckoutEditAddressPage from "./pages/checkout/pages/address-edit/EditAddress.tsx";
import CheckoutCreateAddressPage from "./pages/checkout/pages/address-create/CreateAddress.tsx";
import OrderDetailsLoader from "./pages/profile/pages/my-purchases/OrderDetailsLoader.tsx";

const HomePage = lazy(() => import("./pages/home/Home.tsx"));
const AboutPage = lazy(() => import("./pages/about/About.tsx"));
const SignupPage = lazy(() =>
  import("./pages/auth").then((m) => ({ default: m.Signup })),
);
const SignupConfirmEmailPage = lazy(() =>
  import("./pages/auth").then((m) => ({ default: m.SignupConfirmEmail })),
);
const LoginPage = lazy(() =>
  import("./pages/auth").then((m) => ({ default: m.Login })),
);
const ForgotPasswordSubmitEmailPage = lazy(() =>
  import("./pages/auth").then((m) => ({
    default: m.ForgotPasswordSubmitEmail,
  })),
);
const ForgotPasswordCheckEmailPage = lazy(() =>
  import("./pages/auth").then((m) => ({ default: m.ForgotPasswordCheckEmail })),
);
const ForgotPasswordResetPasswordPage = lazy(() =>
  import("./pages/auth").then((m) => ({
    default: m.ForgotPasswordResetPassword,
  })),
);
const CartPage = lazy(() => import("./pages/cart/Cart.tsx"));
const ContactPage = lazy(() => import("./pages/contact/Contact.tsx"));
const EventsPage = lazy(() => import("./pages/events/Events.tsx"));
const PrivacyPolicyPage = lazy(
  () => import("./pages/privacy-policy/PrivacyPolicy.tsx"),
);
const ProfilePage = lazy(() => import("./pages/profile/Profile.tsx"));
const ShopPage = lazy(() =>
  import("./pages/shop").then((m) => ({ default: m.Shop })),
);
const ShopProductPage = lazy(() =>
  import("./pages/shop").then((m) => ({ default: m.ShopProduct })),
);
const TermsOfServicePage = lazy(
  () => import("./pages/terms-of-service/TermsOfService.tsx"),
);
const FAQPage = lazy(
  () => import("./pages/frequently-asked-questions/FAQ.tsx"),
);
const MyPurchases = lazy(
  () => import("./pages/profile/pages/my-purchases/MyPurchases.tsx"),
);
const MyInquiriesPage = lazy(
  () => import("./pages/profile/pages/my-inquiries/MyInquiries.tsx"),
);
const OrderDetailsPage = lazy(
  () => import("./pages/profile/pages/my-purchases/OrderDetails.tsx"),
);
const SettingsPage = lazy(
  () => import("./pages/profile/pages/settings/Settings.tsx"),
);
const AccountPage = lazy(
  () => import("./pages/profile/pages/settings/pages/account/AccountPage.tsx"),
);
const AddressesPage = lazy(
  () => import("./pages/profile/pages/addresses/AddressesPage.tsx"),
);
const ProfileCreateAddressPage = lazy(
  () => import("./pages/profile/pages/addresses/pages/CreateAddress.tsx"),
);
const ProfileEditAddressPage = lazy(
  () => import("./pages/profile/pages/addresses/pages/EditAddress.tsx"),
);
const NotificationsPage = lazy(
  () =>
    import("./pages/profile/pages/settings/pages/notification/NotificationsPage.tsx"),
);
const PrivacyPage = lazy(
  () => import("./pages/profile/pages/settings/pages/privacy/PrivacyPage.tsx"),
);
const AdminDashboardPage = lazy(() =>
  import("@/pages/profile/pages/admin-dashboard/index.ts").then((m) => ({
    default: m.AdminDashboard,
  })),
);
const AdminDashboardEventsPage = lazy(() =>
  import("@/pages/profile/pages/admin-dashboard/index.ts").then((m) => ({
    default: m.AdminDashboardEvents,
  })),
);
const AdminDashboardOrdersPage = lazy(() =>
  import("@/pages/profile/pages/admin-dashboard/index.ts").then((m) => ({
    default: m.AdminDashboardOrders,
  })),
);
const AdminDashboardAnalyticsPage = lazy(() =>
  import("@/pages/profile/pages/admin-dashboard/index.ts").then((m) => ({
    default: m.AdminDashboardAnalytics,
  })),
);
const AdminDashboardProductsPage = lazy(() =>
  import("@/pages/profile/pages/admin-dashboard/index.ts").then((m) => ({
    default: m.AdminDashboardProducts,
  })),
);
const CheckoutPage = lazy(() =>
  import("@/pages/checkout/index.ts").then((m) => ({ default: m.Checkout })),
);
const CheckoutAddressSelectionPage = lazy(() =>
  import("@/pages/checkout/index.ts").then((m) => ({
    default: m.CheckoutAddressSelection,
  })),
);
const PaymentConfirmationPage = lazy(() =>
  import("@/pages/payment/index.ts").then((m) => ({
    default: m.PaymentConfirmation,
  })),
);
const PaymentStatusPage = lazy(() =>
  import("./pages/payment/index.ts").then((m) => ({
    default: m.PaymentStatus,
  })),
);

const router = createBrowserRouter([
  {
    path: "/",
    loader: RootLoader,
    Component: Root,
    ErrorBoundary: CatchAllErrorPage,
    children: [
      { index: true, Component: HomePage },

      {
        path: "auth",
        loader: AuthLoader,
        children: [
          { path: "signup", Component: SignupPage },
          { path: "login", Component: LoginPage },
          { path: "confirm-email", Component: SignupConfirmEmailPage },
          {
            path: "forgot-password",
            children: [
              { index: true, Component: ForgotPasswordSubmitEmailPage },
              {
                path: "check-email",
                loader: ForgotPasswordCheckEmailLoader,
                Component: ForgotPasswordCheckEmailPage,
              },
              {
                path: "reset-password",
                loader: ForgotPasswordResetPasswordLoader,
                Component: ForgotPasswordResetPasswordPage,
              },
            ],
          },
        ],
      },

      {
        path: "profile",
        children: [
          { index: true, Component: ProfilePage },
          {
            path: "my-purchases",
            children: [
              { index: true, Component: MyPurchases },
              {
                path: "order/:orderId",
                Component: OrderDetailsPage,
                loader: OrderDetailsLoader,
              },
            ],
          },

          {
            path: "my-inquiries",
            Component: MyInquiriesPage,
          },

          {
            path: "settings",
            Component: SettingsPage,
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

          {
            path: "addresses",
            children: [
              { index: true, Component: AddressesPage },
              { path: "add", Component: ProfileCreateAddressPage },
              { path: ":addressId/edit", Component: ProfileEditAddressPage },
            ],
          },

          {
            path: "admin",
            loader: AdminDashboardLoader,
            Component: AdminDashboardPage,
            children: [
              {
                index: true,
                loader: () => redirect("products"),
                Component: AdminDashboardProductsPage,
              },
              { path: "products", Component: AdminDashboardProductsPage },
              { path: "orders", Component: AdminDashboardOrdersPage },
              { path: "analytics", Component: AdminDashboardAnalyticsPage },
              { path: "events", Component: AdminDashboardEventsPage },
            ],
          },
        ],
      },

      {
        path: "shop",
        children: [
          { index: true, Component: ShopPage },
          {
            path: "products/:id",
            Component: ShopProductPage,
          },
        ],
      },

      {
        path: "checkout/:sessionId",
        children: [
          { index: true, Component: CheckoutPage, loader: CheckoutLoader },
          {
            path: "address/selection",
            Component: CheckoutAddressSelectionPage,
            loader: CheckoutLoader,
          },
          {
            path: "address/:addressId/edit",
            Component: CheckoutEditAddressPage,
            loader: CheckoutLoader,
          },
          {
            path: "address/create",
            Component: CheckoutCreateAddressPage,
            loader: CheckoutLoader,
          },
        ],
      },

      {
        path: "payment/:paymentId/confirm",
        Component: PaymentConfirmationPage,
        loader: PaymentConfirmationLoader,
      },

      {
        path: "payment/:paymentId/status",
        Component: PaymentStatusPage,
        loader: PaymentStatusLoader,
      },

      { path: "events", Component: EventsPage },

      { path: "cart", Component: CartPage },

      { path: "contact", Component: ContactPage },

      { path: "terms-of-service", Component: TermsOfServicePage },

      { path: "privacy-policy", Component: PrivacyPolicyPage },

      { path: "about", Component: AboutPage },

      { path: "FAQ", Component: FAQPage },
    ],
  },
]);

export default router;
