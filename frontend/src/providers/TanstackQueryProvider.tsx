import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

// Example usage 'per query' to enable persistence (saving to localStorage):
// const { data, error, isFetching } = useSuspenseQuery({
//   queryKey: ["foo"],
//   queryFn: () => bar(),
//   meta: { persist: true }, <-- Add this option ---
// });

const staleTime = 30 * 60 * 1000; // 30 mins

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime,
      gcTime: staleTime * 2,
      retry: 2,
      meta: { persist: false }, // default not saving to localStorage
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
