import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { User, Bell, Shield } from "lucide-react";
import { Privacy } from "./components/Privacy";
import { Account } from "./components/Account";
import { Notifications } from "./components/Notification";

type SettingsTab = "account" | "notifications" | "privacy";

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "account", label: "Account", icon: <User className="size-4" /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="size-4" />,
  },
  { id: "privacy", label: "Privacy", icon: <Shield className="size-4" /> },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  const TabContent = {
    account: Account,
    notifications: Notifications,
    privacy: Privacy,
  }[activeTab];

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
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center px-2 rounded-md gap-3 py-3 text-sm font-medium transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary"
                      : "text-foreground/75 hover:bg-primary/10",
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm">
              <TabContent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
