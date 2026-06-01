import { type ReactNode } from "react";
import { Switch } from "@/lib/ui/__shadcn__/switch";
import { cn } from "@/lib/utils/cn";

interface SettingsRowProps {
  label: ReactNode;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

export function SettingsRow({
  label,
  description,
  checked,
  onCheckedChange,
  className,
}: SettingsRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-3 px-2 rounded-lg transition-colors",
        className,
      )}
    >
      <div className="pr-4">
        <div className="text-sm font-medium">{label}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(!checked && "dark:[&_span]:bg-background")}
      />
    </div>
  );
}
