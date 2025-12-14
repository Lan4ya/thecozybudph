import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const navItems = [
  { label: "Profile", href: "/profile" },
  { label: "Shop", href: "/shop" },
  { label: "Events", href: "/events" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/FAQ" },
  { label: "Sign up", href: "/auth/signup" },
  { label: "Log in", href: "/auth/login" },
];

import {
  MessageCircleQuestionMark,
  ShoppingBag,
  CalendarDays,
  Info,
  Mail,
  LogIn,
  UserPlus,
  User,
} from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { cn } from "@/lib/utils/cn";
import { Menu } from "lucide-react";

const icons = {
  shop: ShoppingBag,
  events: CalendarDays,
  about: Info,
  contact: Mail,
  FAQ: MessageCircleQuestionMark,
  profile: User,
  "auth/signup": UserPlus,
  "auth/login": LogIn,
};

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/lib/ui/__shadcn__/drawer";
import { NavLink, useLocation } from "react-router";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { DialogTitle } from "@radix-ui/react-dialog";
import isDev from "@/lib/utils/isDev";

export const MobileDrawer = () => {
  const [hasSession, setHasSession] = useState(false);

  supabase.auth.getSession().then(({ data: { session } }) => {
    isDev && console.log("has session: ", session);
    if (session) {
      setHasSession(true);
    }
  });

  const location = useLocation();
  const pn = location.pathname;

  return (
    <Drawer>
      {/* @ts-ignore */}
      <DrawerTrigger asChild>
        <Button
          variant="minimal"
          size="auto"
          className={cn(
            "text-primary-foreground hover:text-primary-foreground/80",
            "text-foreground hover:text-foreground/80",
          )}
        >
          <Menu className="size-6" />
        </Button>
      </DrawerTrigger>

      <DrawerContent
        aria-describedby={undefined}
        className="custom-container w-full h-[400px] rounded-t-2xl shadow-xl border border-border/50 pb-40"
      >
        {/* <div className="-top-2 translate-x-1/2 right-[50%] w-[100px] h-2 rounded-full absolute bg-input/30 z-5"></div> */}

        <VisuallyHidden>
          <DialogTitle>nav menu</DialogTitle>
        </VisuallyHidden>

        <div className="flex flex-col  mt-6 gap-1">
          {navItems.map(({ label, href }) => {
            if (label === "Profile" && !hasSession) {
              return;
            }

            if ((label === "Sign up" || label === "Log in") && hasSession) {
              return;
            }

            const key = href.replace(/^\//, "") as keyof typeof icons;
            const Icon = icons[key];

            return (
              // @ts-ignore
              <DrawerClose asChild key={href}>
                <NavLink
                  to={href}
                  className={cn(
                    "py-2.5 px-2 flex items-center gap-2",
                    "text-foreground/80 hover:text-foreground hover:bg-input/30 rounded-md transition-colors",
                    pn === href && "bg-input/30",
                  )}
                >
                  {Icon && <Icon className="size-5" />}
                  {label}
                </NavLink>
              </DrawerClose>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
