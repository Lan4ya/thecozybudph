import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import type { AppError } from "@/api/_error";

// Example usage to enable persistence (saving to localStorage):
// const { data, error, isFetching } = useSuspenseQuery({
//   queryKey: ["foo"],
//   queryFn: () => bar(),
//   meta: { persist: true }, <-- Add this option ---
// });

declare module "@tanstack/react-query" {
  interface Register {
    defaultError: AppError;
  }
}
const staleTime = 30 * 60 * 1000; // 30 mins

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime,
      gcTime: staleTime * 2,
      retry: 2,
      meta: { persist: false }, // Default not saving to localStorage
    },
  },
});

const asyncStoragePersister = createAsyncStoragePersister({
  storage: window.localStorage,
});

const TanstackQueryProvider = ({ children }: PropsWithChildren) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.meta?.persist === true,
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
};

export default TanstackQueryProvider;
