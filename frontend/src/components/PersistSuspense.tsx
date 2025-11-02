import { Suspense, type ReactNode } from "react";
import { useIsRestoring } from "@tanstack/react-query";

// add: PersistSuspense - Suspense integration for Tanstack Query's
// useSuspenseQuery hook

// Workaround for using useSuspenseQuery with CSR and persisted cache (localStorage, db
// cache, etc.) which doesn't work with React's Suspense.

// https://github.com/TanStack/query/issues/8400

type PersistGateProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

export function PersistGate({ children, fallback = null }: PersistGateProps) {
  const isRestoring = useIsRestoring();
  return isRestoring ? fallback : children;
}

type PersistSuspenseProps = {
  children: ReactNode;
  fallback: ReactNode;
};

const PersistSuspense = ({ children, fallback }: PersistSuspenseProps) => {
  return (
    <Suspense fallback={fallback}>
      <PersistGate fallback={fallback}>{children}</PersistGate>
    </Suspense>
  );
};

export default PersistSuspense;
