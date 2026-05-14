import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/nav/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { ProductQueryStateProvider } from "@/providers/ProductQueryProvider";
import { useInitAuthStore } from "@/hooks/useInitAuthStore";
import { TanstackQueryDevtoolsToggle } from "@/components/TanstackQueryDevToolsToggle";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import { ScrollToTop } from "@/components/ScrollToTop";

export const NAV_HIDDEN_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/confirm-email",
];
export const FOOTER_HIDDEN_PATHS = [
  ...NAV_HIDDEN_PATHS,
  "/cart",
  "/shop/products",
  "/checkout",
  "/profile/admin",
  "/payment",
];
export const PROTECTED_ROUTES = ["/profile", "/checkout"];

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname.startsWith(p));

function Root() {
  const pathName = useLocation().pathname;
  const hideNav = matchesPath(pathName, NAV_HIDDEN_PATHS);
  const hideFooter = matchesPath(pathName, FOOTER_HIDDEN_PATHS);

  // subscribe to auth state changes
  useInitAuthStore();

  ScrollToTop();

  return (
    <ProductQueryStateProvider>
      <TanstackQueryDevtoolsToggle />

      <SessionExpiredModal />

      <div
        className={cn(
          "min-h-screen!",
          !hideNav &&
            // hardcoded nav bar height (getting the actual height has delay which causes jank on page load)
            "pt-[56.15px] lg:pt-[61.166px]",
        )}
      >
        {!hideNav && <NavBar />}
        <Outlet />
      </div>

      {!hideFooter && <Footer />}
    </ProductQueryStateProvider>
  );
}

export default Root;
