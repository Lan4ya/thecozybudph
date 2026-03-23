import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useState } from "react";

interface CustomErrorBoundaryProps {
  children: React.ReactNode;
  uiMessage: string;
  // onReset?: () => void;
}

// A Minimal Error Boundary Wrapper.

// Unless it's really needed to have a customized error component then use
// <ErrorBoundary/> directly with a customized fallback, otherwise this will probably be enough

export function CustomErrorBoundary({
  children,
  uiMessage,
  // onReset,
}: CustomErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <ErrorFallback {...props} uiMessage={uiMessage} />
      )}
      // onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
}

export interface ErrorFallbackProps extends FallbackProps {
  uiMessage: string;
}

function ErrorFallback({ error, uiMessage }: ErrorFallbackProps) {
  const [showError, setShowError] = useState(false);

  return (
    <div className="col-span-full gap-2 text-center py-10 flex-center flex-col">
      <p className="text-destructive">{uiMessage}</p>

      <Button
        variant="outline"
        className=""
        onClick={() => setShowError((p) => !p)}
      >
        {showError ? "hide error" : "show error"}
      </Button>

      {showError && <p className="text-destructive mb-4">{error.message}</p>}
    </div>
  );
}
