import { Globe } from "lucide-react";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useState } from "react";
import { SettingsRow } from "./SettingsRow";

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
        <SettingsRow
          label="Private Order History"
          description="Hide your order history from other users."
          checked={settings.orderHistoryPrivate}
          onCheckedChange={() => toggle("orderHistoryPrivate")}
          className="hover:bg-primary/20"
        />

        <SettingsRow
          label={
            <div className="flex items-center gap-2">
              <Globe className="size-4" />
              Marketing Cookies
            </div>
          }
          description="Allow us to use cookies for personalized ads and offers."
          checked={settings.marketingCookies}
          onCheckedChange={() => toggle("marketingCookies")}
          className="hover:bg-muted/20"
        />

        <SettingsRow
          label="Analytics Cookies"
          description="Help us improve by allowing anonymous usage analytics."
          checked={settings.analyticsCookies}
          onCheckedChange={() => toggle("analyticsCookies")}
          className="hover:bg-muted/20"
        />
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
