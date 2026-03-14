import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/nav/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { ProductQueryProvider } from "@/providers/ProductQueryProvider";
import SessionGuard from "@/components/SessionGuard";
import { initAuthStore } from "@/store/useAuthStore";
import { useEffect, useMemo } from "react";

const NAV_HIDDEN_PATHS = ["/auth/login", "/auth/signup", "/auth/confirm-email"];
const FOOTER_HIDDEN_PATHS = [...NAV_HIDDEN_PATHS, "/cart", "/shop/products"];

function Root() {
  const pathName = useLocation().pathname;

  const matchesPath = (pathname: string, paths: string[]) =>
    paths.some((p) => pathname.startsWith(p));

  const hideNav = useMemo(
    () => matchesPath(pathName, NAV_HIDDEN_PATHS),
    [pathName],
  );

  const hideFooter = useMemo(
    () => matchesPath(pathName, FOOTER_HIDDEN_PATHS),
    [pathName],
  );

  useEffect(() => {
    const cleanup = initAuthStore();
    return cleanup;
  }, []);

  return (
    <>
      <SessionGuard />

      <ProductQueryProvider>
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
      </ProductQueryProvider>
    </>
  );
}

export default Root;
