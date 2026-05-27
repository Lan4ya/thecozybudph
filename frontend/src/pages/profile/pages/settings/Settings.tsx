import { cn } from "@/lib/utils/cn";
import { User, Bell, Shield } from "lucide-react";
import { NavLink, Outlet } from "react-router";

const tabs: { id: string; label: string; icon: React.ReactNode; path: string }[] = [
  { id: "account", label: "Account", icon: <User className="size-4" />, path: "account" },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="size-4" />,
    path: "notifications",
  },
  { id: "privacy", label: "Privacy", icon: <Shield className="size-4" />, path: "privacy" },
];

const Settings = () => {
  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Manage your account preferences and configuration
            </p>
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <nav className="bg-card rounded-xl border p-4 space-y-1 overflow-hidden sticky top-6">
              {tabs.map((tab) => (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) =>
                    cn(
                      "w-full flex items-center px-2 rounded-md gap-3 py-3 text-sm font-medium transition-colors text-left",
                      isActive
                        ? "bg-primary/20 text-primary"
                        : "text-foreground/75 hover:bg-primary/10",
                    )
                  }
                >
                  {tab.icon}
                  {tab.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
