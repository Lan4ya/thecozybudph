import { PageSpinner } from "@/lib/ui/__shadcn__/spinner";

export const RouteLoader = () => {
  return (
    <div className="fixed inset-0 overflow-hidden bg-background z-10000 flex items-center justify-center">
      <PageSpinner />
    </div>
  );
};
