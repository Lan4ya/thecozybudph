import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
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
        // 👁️‍🗨️ Below is an example usage 'Per Query' to disable persistence...
        // const { data, error, isFetching } =ruseSuspenseQuery<Product[]>({
        //   queryKey: ["foo"],
        //   queryFn: () => bar(),
        //   meta: { persist: false }, <-- ADD THIS OPTION
        // });
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.meta?.persist !== false,
        },
      }}
    >
      {children}

      <ReactQueryDevtools initialIsOpen={false} buttonPosition="top-left" />
    </PersistQueryClientProvider>
  );
};

export default TanstackQueryProvider;
