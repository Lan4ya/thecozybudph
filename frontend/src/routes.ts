import { createBrowserRouter, redirect } from "react-router";
import Root from "./pages/Root.tsx";
import Home from "./pages/home/Home.tsx";
import Shop from "./pages/shop/Shop.tsx";
import Cart from "./pages/cart/Cart.tsx";
import About from "./pages/about/About.tsx";
import Contact from "./pages/contact/Contact.tsx";
import Events from "./pages/events/Events.tsx";
import AdminDashboard, {
  AdminLoader as AdminLoader,
} from "./pages/profile/pages/admin/Dashboard.tsx";
import AdminDashboardProducts from "./pages/profile/pages/admin/pages/products/Products.tsx";
import AdminDashboardOrders from "./pages/profile/pages/admin/pages/orders/Orders.tsx";
import { CatchAllErrorPage } from "./pages/ErrorPage.tsx";
import { RouteLoaderSpinner } from "./components/RouteLoaderSpinner.tsx";
import { ProductDetails } from "./pages/shop/pages/selected-product-details/ProductDetails.tsx";
import Login from "./pages/auth/Login.tsx";
import Profile from "./pages/profile/Profile.tsx";
import SignUp from "./pages/auth/Signup.tsx";
import TOS from "./pages/terms-of-service/TOS.tsx";
import PrivacyPolicy from "./pages/privacy-policy/PrivacyPolicy.tsx";
import { ConfirmEmail } from "./pages/auth/ConfirmEmail.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    ErrorBoundary: CatchAllErrorPage,
    children: [
      { index: true, Component: Home },

      { path: "auth/signup", Component: SignUp },

      { path: "auth/confirm-email", Component: ConfirmEmail },

      { path: "auth/login", Component: Login },

      {
        path: "profile",
        children: [
          { index: true, Component: Profile },
          {
            path: "admin",
            loader: AdminLoader,
            HydrateFallback: RouteLoaderSpinner,
            Component: AdminDashboard,
            children: [
              {
                index: true,
                loader: () => redirect("products"),
              },
              { path: "products", Component: AdminDashboardProducts },
              { path: "orders", Component: AdminDashboardOrders },
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
            Component: ProductDetails,
          },
        ],
      },

      { path: "events", Component: Events },

      { path: "cart", Component: Cart },

      { path: "contact", Component: Contact },

      { path: "terms-of-service", Component: TOS },

      { path: "privacy-policy", Component: PrivacyPolicy },

      { path: "about", Component: About },
    ],
  },
]);

export default router;
