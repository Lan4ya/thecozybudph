import { Outlet, useLocation } from "react-router";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";

function Root() {
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen",
        location.pathname !== "/" && "pt-15 lg:pt-20",
      )}
    >
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Root;
