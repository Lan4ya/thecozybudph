import { PageSpinner } from "@/lib/ui/__shadcn__/spinner";

export const RouteLoader = () => (
  <div className="absolute inset-0 bg-background z-10000 flex-center">
    <PageSpinner />
  </div>
);
