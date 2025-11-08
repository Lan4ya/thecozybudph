import { NavLink } from "react-router";
import { useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

const adminPanelItems = [
  { label: "Products", href: `/admin-${admin_route_hash}/dashboard/products` },
  { label: "Orders", href: `/admin-${admin_route_hash}/dashboard/orders` },
  // { label: "About", href: "/" },
  // { label: "Contact", href: "/contact" },
];

const AdminDashboardNavbar = () => {
  const isMediumScreenAndBelow = useMediaQuery("(max-width: 1023px)");
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      className={cn(
        "fixed top-0 z-999 bg-background border-b-foreground shadow-xs w-full py-3 flex-between px-4 md:px-8",
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
          <Menu className={cn("text-primary group-hover:text-primary/80")} />
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

            {/* Menu Items */}
            {adminPanelItems.map(({ label, href }, idx) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.05 }}
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
    </nav>
  );
};

export default AdminDashboardNavbar;
