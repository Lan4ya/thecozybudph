import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { cn } from "@/lib/utils/cn";
import { ProgressiveImage } from "../ProgressiveImage";
import isDev from "@/lib/utils/isDev";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

const navItems = [
  { label: "Shop", href: "/shop" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Sign up", href: "/auth/signup" },
  { label: "Log in", href: "/auth/login" },
  { label: "Profile", href: "/profile" },
];

export const DesktopNavLinks = ({
  cartItemsCount,
  session,
}: {
  cartItemsCount: number;
  session: Session | null;
}) => {
  const [hovered, setHovered] = useState<string | null>(null);
  const location = useLocation();
  const active = hovered ?? location.pathname;
  const user = session?.user;

  const [avatar, setAvatarUrl] = useState<string>("/fallback-avatar.png");

  useEffect(() => {
    if (!user) return;

    const initAvatar = async () => {
      // Use user's avatar if available
      if (user.user_metadata?.avatar_url) {
        setAvatarUrl(user.user_metadata.avatar_url);
        return;
      }

      // Fallback to trigger-populated avatar_path (random avatar from avatar set)
      const avatarPath = user?.user_metadata?.avatar_path;
      if (avatarPath) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarPath);
        const publicUrl = data.publicUrl;
        setAvatarUrl(publicUrl);

        // Persist it to avatar_url so we don't do this check again
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: publicUrl },
          });
        } catch (err) {
          isDev &&
            console.error("Failed to auto-persist fallback avatar:", err);
        }
      }
    };

    initAvatar();
  }, [user, session?.user?.user_metadata?.avatar_url]);

  return (
    <div
      className="flex items-center gap-8 relative"
      onMouseLeave={() => setHovered(null)}
    >
      {/* Links */}
      {navItems.map(({ label, href }) => {
        if (label === "Profile" && !session) {
          return null;
        }

        if ((label === "Sign up" || label === "Log in") && session) {
          return null;
        }

        return (
          <div
            key={href}
            className="relative flex flex-col items-center justify-center h-full"
            onMouseEnter={() => setHovered(href)}
          >
            <NavLink
              to={href}
              className={cn(
                "text-foreground text-lg font-medium transition-colors flex items-center justify-center",
                label === "Profile" && "size-9",
              )}
            >
              {label === "Profile" ? (
                <div className="size-full rounded-full overflow-hidden border border-border">
                  <ProgressiveImage
                    decoding="sync"
                    isEager={true}
                    src={avatar}
                    alt="Profile"
                  />
                </div>
              ) : (
                label
              )}
            </NavLink>

            <AnimatePresence>
              {active === href && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-2 h-0.5 bg-primary rounded-full w-full"
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
        className="relative flex flex-col -ml-2 items-center justify-center h-full"
        onMouseEnter={() => setHovered("/cart")}
      >
        <NavLink
          to="/cart"
          className="transition-colors relative flex items-center justify-center"
        >
          <div className="absolute -right-3 -top-2 flex-center text-secondary-foreground text-[9px] font-medium bg-secondary size-4 rounded-full select-none">
            {cartItemsCount}
          </div>
          <ShoppingCart className="size-6" />
        </NavLink>

        <AnimatePresence>
          {active === "/cart" && (
            <motion.div
              layoutId="nav-underline"
              className="absolute -bottom-2 h-0.5 bg-primary rounded-full w-full"
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
