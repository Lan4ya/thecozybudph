import { Eye, Globe } from "lucide-react";
import { Switch } from "@/lib/ui/__shadcn__/switch";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useState } from "react";

export function Privacy() {
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
        <div className="flex items-center justify-between py-4 px-1 hover:bg-primary/20 rounded-lg transition-colors">
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

        <div className="flex items-center justify-between py-4 px-1 hover:bg-primary/20 rounded-lg transition-colors">
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
              Permanently delete your account and all associated data. This
              action cannot be undone.
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
