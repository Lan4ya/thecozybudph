import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { ScrollToTop } from "@/components/ScrollTop";
import { FilterProvider } from "@/providers/FilterProvider";

function Root() {
  const location = useLocation();

  return (
    <FilterProvider>
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
    </FilterProvider>
  );
}

export default Root;
