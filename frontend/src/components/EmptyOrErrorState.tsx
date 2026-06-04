import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { Button } from "@/lib/ui/__shadcn__/button";
import { AlertCircle } from "lucide-react";
import type { ComponentType } from "react";
import { useNavigate } from "react-router";

interface EmptyOrErrorStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ComponentType<{ className?: string }>;
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

export function EmptyOrErrorState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = AlertCircle,

  // React Error boundary props if used with React Error Boundary as FallbackComponent
  error,
  resetErrorBoundary,
}: EmptyOrErrorStateProps) {
  const navi = useNavigate();

  const displayTitle = title;
  const displayDescription = description ?? error?.message;

  // Use action prop -> Fallback to react error boundary -> -1 history
  const displayAction = onAction ?? resetErrorBoundary ?? (() => navi(-1));
  const displayLabel =
    actionLabel ?? (resetErrorBoundary ? "Try again" : "Go back");

  useLockBodyScroll();

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <Icon className="size-8 text-destructive" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight">{displayTitle}</h2>
      {displayDescription && (
        <p className="mt-2 text-muted-foreground max-w-md">
          {displayDescription}
        </p>
      )}

      <Button onClick={displayAction} className="mt-6 rounded-full">
        {displayLabel}
      </Button>
    </div>
  );
}
