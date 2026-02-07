import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/nav/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { ScrollToTop } from "@/components/ScrollTop";
import { ProductQueryProvider } from "@/providers/ProductQueryProvider";
import SessionGuard from "@/components/SessionGuard";

function Root() {
  const pathName = useLocation().pathname;
  const hideNav = pathName === "/auth/login" || pathName === "/auth/signup";
  const hideFooter = pathName === "/auth/login" || pathName === "/auth/signup";

  return (
    <>
      <SessionGuard />

      <ProductQueryProvider>
        <div
          className={cn(
            "flex flex-col min-h-screen",
            pathName !== "/" &&
              pathName !== "/auth/signup" &&
              pathName !== "/auth/login" &&
              "pt-15 lg:pt-20",
          )}
        >
          {/*  always scroll to top on route change */}
          <ScrollToTop />

          {!hideNav && <NavBar />}
          <Outlet />
          {!hideFooter && <Footer />}
        </div>
      </ProductQueryProvider>
    </>
  );
}

export default Root;
