import { useEffect, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { ShoppingCart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";
import { Link, useLocation } from "react-router";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const NavBar = () => {
  const isMediumScreenAndBelow = useMediaQuery("(max-width: 1023px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed top-0 z-[999] w-screen py-3 flex-between px-4 md:px-8",
        !menuOpen &&
          isScrolled &&
          "border-b-primary-foreground shadow-xs bg-background backdrop-blur-sm ",
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-1">
        <Link
          to="/"
          reloadDocument
          className="font-back-to-black text-primary hover:text-primary/80 text-xl lg:text-3xl lg:font-semibold"
        >
          TheCozyBud
        </Link>
      </div>

      {/* Mobile Menu Button */}
      {!menuOpen && isMediumScreenAndBelow && (
        <Button
          variant="minimal"
          size="auto"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <Menu className="hover:text-current/80" />
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
            className="h-screen fixed inset-0 z-[998] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center pb-[20%] space-y-6"
          >
            {/* Close Button */}
            <div className="absolute top-3 right-4 md:right-8">
              <Button
                variant="minimal"
                size="auto"
                onClick={() => setMenuOpen(false)}
                className=""
              >
                <X className="text-primary-foreground" />
              </Button>
            </div>

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

              <Link
                to="/cart"
                className="text-primary-foreground text-lg hover:text-primary transition-colors cursor-pointer"
              >
                <ShoppingCart />
              </Link>
            </motion.div>

            {/* Menu Items */}
            {navItems.map(({ label, href }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + (idx + 1) * 0.05 }}
              >
                <Link
                  to={href}
                  className="text-primary-foreground font-bold hover:text-primary transition-colors"
                >
                  {label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!isMediumScreenAndBelow && <DesktopNavLinks />}
    </div>
  );
};

const DesktopNavLinks = () => {
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
          <Link
            to={href}
            className="text-primary text-lg font-bold hover:text-primary/70 transition-colors"
          >
            {label}
          </Link>

          {/* Animated underline */}
          <AnimatePresence>
            {active === href && (
              <motion.div
                layoutId="nav-underline"
                className="absolute -bottom-1 h-[2px] w-full bg-primary rounded-full"
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
        <Link
          to="/cart"
          className="text-primary hover:text-primary/70 transition-colors relative"
        >
          <div className="absolute -right-[14px] -top-[9px] flex-center text-secondary-foreground text-[9px] font-medium bg-secondary size-5 rounded-full select-none">
            0
          </div>
          <ShoppingCart />
        </Link>

        <AnimatePresence>
          {active === "/cart" && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-1 h-[2px] w-full bg-primary rounded-full"
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
