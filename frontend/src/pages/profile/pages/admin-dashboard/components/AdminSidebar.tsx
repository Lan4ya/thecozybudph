import { NavLink } from "react-router";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BarChart3, CalendarDays, Package, ShoppingCart } from "lucide-react";
import { Drawer, DrawerContent } from "@/lib/ui/__shadcn__/drawer";
import { cn } from "@/lib/utils/cn";
import { useAdminDashboardStore } from "../hooks/useAdminDashboardStore";

export const adminNavLinks = [
  { label: "Products", to: "/profile/admin/products", icon: Package },
  { label: "Orders", to: "/profile/admin/orders", icon: ShoppingCart },
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
  const { isSidebarOpen, setSidebarOpen } = useAdminDashboardStore();

  return (
    <>
      <Drawer
        open={isSidebarOpen}
        onOpenChange={setSidebarOpen}
        direction="left"
      >
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
              <AdminNavLinks onNavigate={() => setSidebarOpen(false)} />
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
