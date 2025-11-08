import { useEffect, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";
import { NavLink, useLocation } from "react-router";

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
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      setShowBackground(true);
      return;
    }

    const handleScroll = () => {
      setShowBackground(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  return (
    <nav
      className={cn(
        "fixed top-0 z-999 w-screen py-3 flex-between px-4 md:px-8",
        !menuOpen &&
          isBackgroundShown &&
          "border-b-foreground shadow-xs bg-background backdrop-blur-sm ",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-1">
        <NavLink
          to="/"
          reloadDocument
          className="font-back-to-black text-primary hover:text-primary/80 text-2xl lg:text-4xl lg:font-semibold"
        >
          TheCozyBud
        </NavLink>
      </div>

      {/* Mobile Menu Button */}
      {!menuOpen && isMediumScreenAndBelow && (
        <Button
          variant="minimal"
          size="auto"
          className="group"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Menu
            className={cn(
              "text-primary-foreground group-hover:text-primary-foreground/80",
              isBackgroundShown && "text-primary group-hover:text-primary/80",
            )}
          />
        </Button>
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

            {/* Cart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="relative"
            >
              {/* Cart item count */}
              <div className="absolute -right-[14px] -top-[9px] flex-center text-secondary-foreground text-[9px] font-medium bg-secondary size-5 rounded-full select-none">
                0
              </div>

              <NavLink
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "text-primary-foreground text-lg hover:text-primary transition-colors cursor-pointer",
                    isActive ? "text-primary" : null,
                  )
                }
              >
                <ShoppingCart />
              </NavLink>
            </motion.div>

            {/* Menu Items */}
            {navItems.map(({ label, href }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + (idx + 1) * 0.05 }}
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
              isBackgroundShown && "text-secondary hover:text-primary/70",
            )}
          >
            {label}
          </NavLink>

          {/* Animated underline */}
          <AnimatePresence>
            {active === href && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-1 h-0.5 w-full bg-primary rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
            isBackgroundShown && "text-secondary hover:text-primary/70",
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
              layoutId="nav-underline"
              className="absolute -bottom-1 h-0.5 w-full bg-primary rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
