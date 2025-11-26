import { ShoppingBag, CalendarDays, Info, Mail, LogIn } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { cn } from "@/lib/utils/cn";
import { Menu } from "lucide-react";

const icons = {
  shop: ShoppingBag,
  events: CalendarDays,
  about: Info,
  contact: Mail,
  "sign-in": LogIn,
};

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/lib/ui/__shadcn__/drawer";
import { NavLink, useLocation } from "react-router";

export const MobileDrawer = ({
  isBackgroundShown,
  navItems,
}: {
  isBackgroundShown: boolean;
  navItems: { label: string; href: string }[];
}) => {
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
            isBackgroundShown && "text-foreground hover:text-foreground/80",
          )}
        >
          <Menu className="size-6" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="custom-container w-full rounded-t-2xl shadow-xl border border-border/50 pb-40">
        <div className="-top-2 translate-x-1/2 right-[50%] w-[100px] h-2 rounded-full absolute bg-input/30 z-5"></div>

        <div className="flex flex-col  mt-6 gap-1">
          {navItems.map(({ label, href }) => {
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
