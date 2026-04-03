import {
  Outlet,
  redirect,
  useLocation,
  type LoaderFunctionArgs,
} from "react-router";
import NavBar from "@/components/nav/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { ProductQueryStateProvider } from "@/providers/ProductQueryProvider";
import { useInitAuthStore } from "@/hooks/useInitAuthStore";
import { supabase } from "@/lib/supabase/client";
import { TanstackQueryDevtoolsToggle } from "@/components/TanstackQueryDevToolsToggle";
import SessionExpiredModal from "@/components/SessionExpiredModal";
import { ScrollToTop } from "@/components/ScrollToTop";

const NAV_HIDDEN_PATHS = ["/auth/login", "/auth/signup", "/auth/confirm-email"];
const FOOTER_HIDDEN_PATHS = [
  ...NAV_HIDDEN_PATHS,
  "/cart",
  "/shop/products",
  "/checkout",
  "/profile/admin",
];
const PROTECTED_ROUTES = ["/profile"];

const matchesPath = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname.startsWith(p));

export const RootLoader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const pathname = url.pathname;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAuthRoute = matchesPath(pathname, PROTECTED_ROUTES);

  // Hard redirect for auth routes if no session.
  if (isAuthRoute && !session) {
    throw redirect("/auth/login");
  }

  return session;
};

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
          "flex flex-col min-h-screen",
          pathName !== "/" &&
            !hideNav &&
            // hardcoded nav bar height (getting the actual height has delay which causes jank on page load)
            "pt-[56.15px] lg:pt-[61.166px]",
        )}
      >
        {!hideNav && <NavBar />}
        <Outlet />
        {!hideFooter && <Footer />}
      </div>
    </ProductQueryStateProvider>
  );
}

export default Root;
