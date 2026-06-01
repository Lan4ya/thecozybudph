import { Separator } from "@/lib/ui/__shadcn__/separator";
import { useState } from "react";
import { SettingsRow } from "../../components/SettingsRow";

export default function NotificationsPage() {
  const [settings, setSettings] = useState({
    emailOrders: true,
    emailPromos: true,
    smsOrders: true,
    pushEnabled: true,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  };

  const rows: {
    key: keyof typeof settings;
    label: string;
    description: string;
  }[] = [
    {
      key: "emailOrders",
      label: "Order Updates",
      description:
        "Receive emails about order confirmations, shipping, and delivery.",
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
      key: "pushEnabled",
      label: "Push Notifications",
      description: "Browser push notifications for real-time updates.",
    },
  ];

  return (
    <div className="bg-card rounded-xl border p-5 md:p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Choose how and when you want to be notified.
        </p>
      </div>

      <Separator />

      <div className="px-2 space-y-1">
        {rows.map((row) => (
          <SettingsRow
            key={row.key}
            label={row.label}
            description={row.description}
            checked={settings[row.key]}
            onCheckedChange={() => toggle(row.key)}
            className="hover:bg-primary/10"
          />
        ))}
      </div>
    </div>
  );
}
