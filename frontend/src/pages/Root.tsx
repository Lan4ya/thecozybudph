import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/nav/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { ScrollToTop } from "@/components/ScrollTop";
import { ProductQueryProvider } from "@/providers/ProductQueryProvider";

function Root() {
  const location = useLocation();

  return (
    <ProductQueryProvider>
      <div
        className={cn(
          "flex flex-col min-h-screen",
          location.pathname !== "/" && "pt-15 lg:pt-20",
        )}
      >
        <ScrollToTop />
        <NavBar />
        <Outlet />
        <Footer />
      </div>
    </ProductQueryProvider>
  );
}

export default Root;
