import { Outlet } from "react-router";
import { Button } from "@/lib/ui/__shadcn__/button";
// import Footer from "../components/Footer";
// import { ThemeProvider } from "@/contexts/theme";
// import TanstackQueryProvider from "../contexts/TanstackQuery";
// import { useQueryErrorResetBoundary } from "@tanstack/react-query";
// import { ErrorBoundary } from "react-error-boundary";
// import Nav from "@/components/Navbar";
// import { useSyncFiltersWithURL } from "@/hooks/useSyncFiltersWithURL";

const FallbackRender = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  return (
    <div className="mx-auto max-w-[2000px] px-4 min-h-screen flex flex-col items-center justify-center bg-prim text-fg p-4 text-center">
      <h1 className="text-2xl font-bold mb-4 text-red-600">
        Something went wrong.
      </h1>
      <p className="text-sm text-muted-foreground mb-2">{error.message}</p>
      <Button onClick={() => resetErrorBoundary()}>Try again</Button>
    </div>
  );
};

function Root() {
  // const { reset } = useQueryErrorResetBoundary();

  return (
    <div className="mx-auto max-w-[2000px] flex flex-col min-h-screen">
      {/* <Nav /> */}
      <Outlet />
      {/* <Footer /> */}
    </div>
  );
}

export default Root;
