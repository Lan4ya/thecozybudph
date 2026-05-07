import { Button } from "@/lib/ui/__shadcn__/button";
import { Menu } from "lucide-react";
import { useAdminDashboardStore } from "../hooks/useAdminDashboardStore";
import { useLocation } from "react-router";
import { adminNavLinks } from "./AdminSidebar";

const AdminHeader = () => {
  const { setSidebarOpen } = useAdminDashboardStore();
  const pathname = useLocation().pathname;
  const activeLabel =
    adminNavLinks.find(({ to }) => pathname.startsWith(to))?.label ??
    "Products";

  return (
    <header className="lg:hidden sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="custom-container grid grid-cols-3 justify-between items-center  py-3">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="shrink-0"
          onClick={() => setSidebarOpen(true)}
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
  );
};

export default AdminHeader;
