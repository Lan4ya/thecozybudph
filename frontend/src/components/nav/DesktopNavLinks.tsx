import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import { cn } from "@/lib/utils/cn";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/FAQ" },
  { label: "Sign up", href: "/auth/signup" },
  { label: "Log in", href: "/auth/login" },
  { label: "Profile", href: "/profile" },
];

export const DesktopNavLinks = ({
  cartItemsCount,
  isBackgroundShown,
  hasSession,
}: {
  cartItemsCount: number;
  isBackgroundShown: boolean;
  hasSession: boolean;
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const location = useLocation();
  const active = hovered ?? location.pathname;

  return (
    <div
      className="flex items-center gap-10 relative"
      onMouseLeave={() => setHovered(null)}
    >
      {/* Links */}
      {navItems.map(({ label, href }) => {
        if (label === "Profile" && !hasSession) {
          return;
        }

        if ((label === "Sign up" || label === "Log in") && hasSession) {
          return;
        }

        return (
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
        );
      })}

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
          <div className="absolute -right-3.5 -top-[9px] flex-center text-secondary-foreground text-[9px] font-medium bg-secondary size-5 rounded-full select-none">
            {cartItemsCount}
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
