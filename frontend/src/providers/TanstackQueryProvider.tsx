import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // experimental_prefetchInRender: true,
      staleTime: 1000 * 60 * 60 * 1, // 1haa
      gcTime: 1000 * 60 * 60 * 1, // 1h
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
        // 👁️‍🗨️ Below is an example usage 'PER QUERY' to enable persistence across refresh
        // useSuspenseQuery({
        //   ...otherOptions,
        //   meta: { persist: true },
        // });
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.meta?.persist === true,
        },
      }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};

export default TanstackQueryProvider;
