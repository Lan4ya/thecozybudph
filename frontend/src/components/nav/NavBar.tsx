import { useCallback, useEffect, useState } from "react";
import LOGO from "@/assets/thecozybud/logo_transparent_oneline1.png";
// import LOGOS from "@/assets/thecozybud/logo_transparent_oneline1.svg";
import { ShoppingCart } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";
import { NavLink, useLocation } from "react-router";
import { useAnimateOnView } from "@/hooks/useAnimateOnView";
import { MobileDrawer } from "./MobileDrawer";
import { DesktopNavLinks } from "./DesktopNavLinks";
import { useCartQuery } from "@/features/cart/hooks/useCartQuery";
// import logo_mini_transparent from "@/assets/thecozybud/logo_mini_transparent.png";

const NavBar = () => {
  const isMediumScreenAndBelow = useMediaQuery("(max-width: 1023px)");
  const [isBackgroundShown, setShowBackground] = useState(false);
  const pathname = useLocation().pathname;
  const { registerSentinel, visibleMap } = useAnimateOnView();
  const { data: cartItems } = useCartQuery();
  const cartItemsCount = cartItems?.length ?? 0;

  useEffect(() => {
    if (pathname !== "/" || isMediumScreenAndBelow) {
      setShowBackground(true);
      return;
    }

    const handleScroll = () => {
      const shouldShow = window.scrollY > 0;
      setShowBackground((prev) => (prev === shouldShow ? prev : shouldShow));
    };
    handleScroll();

    const onScroll = () => window.requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, isMediumScreenAndBelow]);

  const handleLogoClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <nav
      ref={registerSentinel}
      className={cn(
        "custom-container fixed top-0 z-49 max-w-screen py-3 flex-between ease-out duration-900 transition-opacity transition-transform",
        visibleMap[0]
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-8",
        isBackgroundShown && "shadow-xs bg-background backdrop-blur-sm ",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-1">
        <NavLink
          to="/"
          className="font-back-to-black select-none text-primary hover:text-primary/85 text-2xl lg:text-3xl lg:font-semibold"
          onClick={handleLogoClick}
        >
          <div className={cn("w-32 lg:w-37 p-0 m-0 ")}>
            <img
              decoding="async"
              src={LOGO}
              alt="logo"
              className="w-full h-full"
            />
          </div>
        </NavLink>
      </div>

      {/* Mobile Layout */}
      {isMediumScreenAndBelow && (
        <div className="flex-center gap-6">
          <div className="relative">
            <div className="absolute -right-3.5 -top-[9px] flex-center text-secondary-foreground text-[9px] font-medium bg-secondary size-5 rounded-full select-none">
              {cartItemsCount}
            </div>

            <NavLink
              to="/cart"
              className={cn(
                "text-primary-foreground text-lg hover:text-primary-foreground/80 cursor-pointer",
                "text-foreground hover:text-foreground/80",
              )}
            >
              <ShoppingCart className="size-5.5" />
            </NavLink>
          </div>

          <MobileDrawer />
        </div>
      )}

      {/* Desktop Layout */}
      {!isMediumScreenAndBelow && (
        <DesktopNavLinks
          cartItemsCount={cartItemsCount}
          isBackgroundShown={isBackgroundShown}
        />
      )}
    </nav>
  );
};

export default NavBar;
