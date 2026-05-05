import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  BarChart3,
  CalendarDays,
  Menu,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Drawer, DrawerContent } from "@/lib/ui/__shadcn__/drawer";
import { cn } from "@/lib/utils/cn";

const adminNavLinks = [
  { label: "Products", to: "/profile/admin/products", icon: Package },
  { label: "Orders", to: "/profile/admin/orders", icon: ShoppingCart },
  { label: "Users", to: "/profile/admin/users", icon: Users },
  { label: "Analytics", to: "/profile/admin/analytics", icon: BarChart3 },
  { label: "Events", to: "/profile/admin/events", icon: CalendarDays },
];

const AdminNavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
  <nav className="space-y-1">
    {adminNavLinks.map(({ label, to, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/75 transition-colors hover:bg-primary/10 hover:text-foreground",
            isActive && "bg-primary/10 text-primary",
          )
        }
      >
        <Icon className="size-4" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);

export const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = useLocation().pathname;
  const activeLabel =
    adminNavLinks.find(({ to }) => pathname.startsWith(to))?.label ??
    "Products";

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="custom-container grid grid-cols-3 justify-between items-center  py-3">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="shrink-0"
            onClick={() => setIsOpen(true)}
          >
            <Menu className="size-4" />
            <span className="sr-only">Open admin navigation</span>
          </Button>
          <p className="text-lg font-semibold justify-self-center">
            {activeLabel}
          </p>
          <div className="text-sm text-muted-foreground justify-self-end">
            {" "}
            0 {activeLabel}
          </div>
        </div>
      </header>

      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="left">
        <DrawerContent
          aria-describedby={undefined}
          className="h-full max-w-[300px] p-0"
        >
          <VisuallyHidden>
            <DialogTitle>Admin navigation</DialogTitle>
          </VisuallyHidden>
          <div className="flex h-full flex-col bg-card">
            <div className="border-b px-4 py-4">
              <p className="text-base font-semibold">Admin Dashboard</p>
              <p className="text-sm text-muted">Manage your storefront</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <AdminNavLinks onNavigate={() => setIsOpen(false)} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <aside className="hidden lg:flex lg:w-72 lg:border-r border-border/30 lg:flex-col  lg:bg-card/40">
        <div className="sticky top-0 h-screen p-4">
          <div className="">
            <p className="text-lg font-semibold">Admin Dashboard</p>
            <p className="mt-1 text-sm text-muted">Manage your storefront</p>
            <div className="mt-5">
              <AdminNavLinks />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
