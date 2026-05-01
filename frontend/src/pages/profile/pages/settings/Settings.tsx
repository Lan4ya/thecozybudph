import { useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "@/lib/utils/cn";
import { Switch } from "@/lib/ui/__shadcn__/switch";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Input } from "@/lib/ui/__shadcn__/input";
import {
  User,
  Bell,
  Shield,
  Palette,
  ChevronRight,
  Mail,
  Smartphone,
  Moon,
  Eye,
  Globe,
  Save,
} from "lucide-react";

type SettingsTab = "account" | "notifications" | "appearance" | "privacy";

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "account", label: "Account", icon: <User className="size-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="size-4" /> },
  { id: "appearance", label: "Appearance", icon: <Palette className="size-4" /> },
  { id: "privacy", label: "Privacy", icon: <Shield className="size-4" /> },
];

// ─── Account Settings ──────────────────────────────────────
function AccountSettings() {
  const [form, setForm] = useState({
    displayName: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "+63 912 345 6789",
    bio: "Flower enthusiast & loyal customer 🌸",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Account Information</h3>
        <p className="text-sm text-muted-foreground">
          Update your personal details and public profile.
        </p>
      </div>

      <Separator />

      <div className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium">Display Name</label>
          <Input
            value={form.displayName}
            onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={form.email} className="pl-9" readOnly />
          </div>
          <p className="text-xs text-muted-foreground">
            Contact support to change your email address.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number</label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="min-w-[100px]">
          <Save className="size-4 mr-2" />
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}

// ─── Notification Settings ─────────────────────────────────
function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailOrders: true,
    emailPromos: true,
    smsOrders: false,
    smsDelivery: true,
    pushEnabled: true,
    newsletter: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const rows: { key: keyof typeof settings; label: string; description: string }[] = [
    {
      key: "emailOrders",
      label: "Order Updates",
      description: "Receive emails about order confirmations, shipping, and delivery.",
    },
    {
      key: "emailPromos",
      label: "Promotions & Deals",
      description: "Get notified about sales, discounts, and special offers.",
    },
    {
      key: "smsOrders",
      label: "SMS Order Alerts",
      description: "Get text messages for important order status changes.",
    },
    {
      key: "smsDelivery",
      label: "SMS Delivery Updates",
      description: "Receive SMS when your order is out for delivery.",
    },
    {
      key: "pushEnabled",
      label: "Push Notifications",
      description: "Browser push notifications for real-time updates.",
    },
    {
      key: "newsletter",
      label: "Weekly Newsletter",
      description: "Our curated newsletter with floral tips and new arrivals.",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Choose how and when you want to be notified.
        </p>
      </div>

      <Separator />

      <div className="space-y-1">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between py-4 px-1 hover:bg-muted/20 rounded-lg transition-colors"
          >
            <div className="pr-4">
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-xs text-muted-foreground">{row.description}</p>
            </div>
            <Switch
              checked={settings[row.key]}
              onCheckedChange={() => toggle(row.key)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Appearance Settings ───────────────────────────────────
function AppearanceSettings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how CozyBud looks for you.
        </p>
      </div>

      <Separator />

      {/* Theme */}
      <div className="space-y-3">
        <label className="text-sm font-medium flex items-center gap-2">
          <Moon className="size-4" />
          Theme
        </label>
        <div className="grid grid-cols-3 gap-3 max-w-sm">
          {(["light", "dark", "system"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors",
                theme === t
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted/50"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Density */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Interface Density</label>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {(["comfortable", "compact"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDensity(d)}
              className={cn(
                "px-4 py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors",
                density === d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:bg-muted/50"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color Preview */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Accent Color</label>
        <div className="flex gap-3">
          {["#4ade80", "#f472b6", "#60a5fa", "#fbbf24", "#a78bfa"].map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Privacy Settings ──────────────────────────────────────
function PrivacySettings() {
  const [settings, setSettings] = useState({
    profileVisible: true,
    orderHistoryPrivate: false,
    marketingCookies: true,
    analyticsCookies: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Privacy & Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your privacy preferences and data settings.
        </p>
      </div>

      <Separator />

      <div className="space-y-1">
        <div className="flex items-center justify-between py-4 px-1 hover:bg-muted/20 rounded-lg transition-colors">
          <div className="pr-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <Eye className="size-4" />
              Public Profile
            </p>
            <p className="text-xs text-muted-foreground">
              Allow others to see your profile and public activity.
            </p>
          </div>
          <Switch
            checked={settings.profileVisible}
            onCheckedChange={() => toggle("profileVisible")}
          />
        </div>

        <div className="flex items-center justify-between py-4 px-1 hover:bg-muted/20 rounded-lg transition-colors">
          <div className="pr-4">
            <p className="text-sm font-medium">Private Order History</p>
            <p className="text-xs text-muted-foreground">
              Hide your order history from other users.
            </p>
          </div>
          <Switch
            checked={settings.orderHistoryPrivate}
            onCheckedChange={() => toggle("orderHistoryPrivate")}
          />
        </div>

        <div className="flex items-center justify-between py-4 px-1 hover:bg-muted/20 rounded-lg transition-colors">
          <div className="pr-4">
            <p className="text-sm font-medium flex items-center gap-2">
              <Globe className="size-4" />
              Marketing Cookies
            </p>
            <p className="text-xs text-muted-foreground">
              Allow us to use cookies for personalized ads and offers.
            </p>
          </div>
          <Switch
            checked={settings.marketingCookies}
            onCheckedChange={() => toggle("marketingCookies")}
          />
        </div>

        <div className="flex items-center justify-between py-4 px-1 hover:bg-muted/20 rounded-lg transition-colors">
          <div className="pr-4">
            <p className="text-sm font-medium">Analytics Cookies</p>
            <p className="text-xs text-muted-foreground">
              Help us improve by allowing anonymous usage analytics.
            </p>
          </div>
          <Switch
            checked={settings.analyticsCookies}
            onCheckedChange={() => toggle("analyticsCookies")}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
        <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-4 space-y-3">
          <div>
            <p className="text-sm font-medium">Delete Account</p>
            <p className="text-xs text-muted-foreground">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Page ────────────────────────────────────
const Settings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const navigate = useNavigate();

  const TabContent = {
    account: AccountSettings,
    notifications: NotificationSettings,
    appearance: AppearanceSettings,
    privacy: PrivacySettings,
  }[activeTab];

  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/profile")}
            className="shrink-0"
          >
            <ChevronRight className="size-4 rotate-180" />
          </Button>
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
            <nav className="bg-card rounded-xl border overflow-hidden sticky top-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors text-left",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/75 hover:bg-muted/50"
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
