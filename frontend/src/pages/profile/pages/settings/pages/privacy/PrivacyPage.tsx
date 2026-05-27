import { Globe } from "lucide-react";
import { Separator } from "@/lib/ui/__shadcn__/separator";
import { useState } from "react";
import { SettingsRow } from "../../components/SettingsRow";

export default function PrivacyPage() {
  const [settings, setSettings] = useState({
    profileVisible: true,
    marketingCookies: true,
    analyticsCookies: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  return (
    <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Privacy & Security</h3>
        <p className="text-sm text-muted-foreground">
          Manage your privacy preferences and data settings.
        </p>
      </div>

      <Separator />

      <div className="space-y-1">
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
          className="hover:bg-primary/10"
        />

        <SettingsRow
          label="Analytics Cookies"
          description="Help us improve by allowing anonymous usage analytics."
          checked={settings.analyticsCookies}
          onCheckedChange={() => toggle("analyticsCookies")}
          className="hover:bg-primary/10"
        />
      </div>
    </div>
  );
}
