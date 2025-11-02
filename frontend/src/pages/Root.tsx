import { Outlet } from "react-router";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils/cn";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function Root() {
  const path = window.location.pathname;
  const isMediumScreenAndBelow = useMediaQuery("(max-width: 1023px)");
  const ptVal = isMediumScreenAndBelow ? "pt-15" : "pt-20";

  return (
    <div
      className={cn(path !== "/home" && ptVal, "flex flex-col min-h-screen")}
    >
      <NavBar />
      <Outlet />
      <Footer />
    </div>
  );
}

export default Root;
