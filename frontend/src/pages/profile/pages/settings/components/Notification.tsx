import { Separator } from "@/lib/ui/__shadcn__/separator";
import { Switch } from "@/lib/ui/__shadcn__/switch";
import { useState } from "react";

export function Notifications() {
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
            className="flex items-center justify-between py-4 px-1 hover:bg-primary/20 rounded-lg transition-colors"
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
