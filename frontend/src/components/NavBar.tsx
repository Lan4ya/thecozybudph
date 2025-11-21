import { useCallback, useEffect, useState } from "react";
import LOGO from "@/assets/thecozybud/logo_transparent_oneline1.png";
// import LOGOS from "@/assets/thecozybud/logo_transparent_oneline1.svg";
import { Button } from "@/lib/ui/__shadcn__/button";
import { ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";
import { NavLink, useLocation } from "react-router";
import { useAnimateOnView } from "@/hooks/useAnimateOnView";
// import logo_mini_transparent from "@/assets/thecozybud/logo_mini_transparent.png";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const NavBar = () => {
  const isMediumScreenAndBelow = useMediaQuery("(max-width: 1023px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBackgroundShown, setShowBackground] = useState(false);
  const pathname = useLocation().pathname;
  const { registerSentinel, visibleMap } = useAnimateOnView();

  useEffect(() => {
    if (pathname !== "/") {
      setShowBackground(true);
      return;
    }

    const handleScroll = () => {
      // only update state if it actually changes
      const shouldShow = window.scrollY > 0;
      setShowBackground((prev) => (prev === shouldShow ? prev : shouldShow));
    };
    const onScroll = () => window.requestAnimationFrame(handleScroll);

    window.addEventListener("scroll", onScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const handleLogoClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <nav
      ref={registerSentinel}
      className={cn(
        "custom-container fixed top-0 z-999 max-w-screen py-3 flex-between ease-out duration-900 transition-opacity transition-transform",
        visibleMap[0]
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-6",
        !menuOpen &&
          isBackgroundShown &&
          "border-b-foreground shadow-xs bg-background backdrop-blur-sm ",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-1">
        <NavLink
          to="/"
          className={cn(
            "font-back-to-black select-none text-primary hover:text-primary/85 text-2xl lg:text-3xl lg:font-semibold",
            // pathname === "/" ? "cursor-default" : "cursor-pointer",
          )}
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

      {!menuOpen && isMediumScreenAndBelow && (
        <div className="flex-center gap-6">
          <div className="relative">
            <div className="absolute -right-[14px] -top-[9px] flex-center text-secondary-foreground text-[9px] font-medium bg-secondary size-5 rounded-full select-none">
              0
            </div>

            {/* Cart  */}
            <NavLink
              to="/cart"
              className={cn(
                "text-primary-foreground text-lg hover:text-primary-foreground/80 cursor-pointer",
                isBackgroundShown && "text-foreground hover:text-foreground/80",
              )}
            >
              <ShoppingCart />
            </NavLink>
          </div>

          {/* Mobile Menu */}
          <Button
            variant="minimal"
            size="auto"
            className="group"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <Menu
              className={cn(
                "text-primary-foreground group-hover:text-primary-foreground/80",
                isBackgroundShown &&
                  "text-foreground group-hover:text-foreground/80",
              )}
            />
          </Button>
        </div>
      )}

      <AnimatePresence>
        {menuOpen && isMediumScreenAndBelow && (
          // Mobile Dropdown Overlay
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-screen fixed inset-0 z-998 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center pb-[20%] space-y-6"
          >
            {/* Close Button */}
            <Button
              variant="minimal"
              size="auto"
              onClick={() => setMenuOpen(false)}
              className="p-1 border-2 rounded-md absolute top-3 right-4 md:right-8"
            >
              <X className="text-primary-foreground" />
            </Button>

            {/* Menu Items */}
            {navItems.map(({ label, href }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + (idx + 0) * 0.05 }}
              >
                <NavLink
                  to={href}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "text-primary-foreground font-medium hover:text-primary transition-colors",
                      isActive ? "text-primary" : null,
                    )
                  }
                >
                  {label}
                </NavLink>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!isMediumScreenAndBelow && (
        <DesktopNavLinks isBackgroundShown={isBackgroundShown} />
      )}
    </nav>
  );
};

const DesktopNavLinks = ({
  isBackgroundShown,
}: {
  isBackgroundShown: boolean;
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const location = useLocation();
  const active = hovered ?? location.pathname;

  return (
    <div
      className="flex items-center gap-8 relative"
      onMouseLeave={() => setHovered(null)}
    >
      {/* Links */}
      {navItems.map(({ label, href }) => (
        <div
          key={href}
          className="relative flex flex-col items-center"
          onMouseEnter={() => setHovered(href)}
        >
          <NavLink
            to={href}
            className={cn(
              "text-primary-foreground hover:text-primary-foreground/70 text-lg font-medium transition-colors",
              isBackgroundShown && "text-foreground hover:text-primary/70",
            )}
          >
            {label}
          </NavLink>

          <AnimatePresence>
            {active === href && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-1 h-0.5 bg-primary rounded-full w-full"
                initial={{ opacity: 0, scaleX: 0.8 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0.8 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 26,
                  mass: 0.3,
                }}
              />
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Cart */}
      <div
        className="relative flex flex-col items-center"
        onMouseEnter={() => setHovered("/cart")}
      >
        <NavLink
          to="/cart"
          className={cn(
            "text-primary-foreground hover:text-primary-foreground/70 transition-colors relative",
            isBackgroundShown && "text-foreground hover:text-primary/70",
          )}
        >
          <div className="absolute -right-[14px] -top-[9px] flex-center text-secondary-foreground text-[9px] font-medium bg-secondary size-5 rounded-full select-none">
            0
          </div>
          <ShoppingCart />
        </NavLink>

        <AnimatePresence>
          {active === "/cart" && (
            <motion.div
              layoutId="nav-underline" // Different layoutId for cart
              className="absolute -bottom-1 h-0.5 bg-primary rounded-full w-8" // Fixed width for cart
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0.8 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 26,
                mass: 0.3,
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NavBar;
