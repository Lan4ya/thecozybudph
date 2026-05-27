import { Separator } from "@/lib/ui/__shadcn__/separator";
import { useState } from "react";
import { SettingsRow } from "./SettingsRow";

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
