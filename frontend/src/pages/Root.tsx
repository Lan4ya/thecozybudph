import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/nav/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { ScrollToTop } from "@/components/ScrollTop";
import { ProductQueryProvider } from "@/providers/ProductQueryProvider";

function Root() {
  const pn = useLocation().pathname;
  const hideNav = pn === "/auth/login" || pn === "/auth/signup";
  const hideFooter = pn === "/auth/login" || pn === "/auth/signup";

  return (
    <ProductQueryProvider>
      <div
        className={cn(
          "flex flex-col min-h-screen",
          pn !== "/" &&
            pn !== "/auth/signup" &&
            pn !== "/auth/login" &&
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
  );
}

export default Root;
