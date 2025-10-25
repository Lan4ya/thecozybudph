("use client");

import { useRouteError, isRouteErrorResponse } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Link } from "react-router";

type ErrorPageProps = {
  status?: number;
  title?: string;
  message?: string;
};

const messages: Record<number, string> = {
  401: "You’re not authorized to view this page.",
  404: "The page you’re looking for doesn’t exist.",
  500: "Something went wrong on our servers.",
};

export const ErrorPage = ({ status, title, message }: ErrorPageProps) => {
  const finalMessage = message || (status ? messages[status] : null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <h1 className="font-back-to-black text-primary text-6xl md:text-7xl">
          {title || "Error"}
        </h1>

        {/* Message fallback */}
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
          {finalMessage || "Something went wrong. Please try again later."}
        </p>

        {/* CTA button */}
        <div className="mt-8">
          <Button asChild variant="default" size="lg" className="rounded-2xl">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export function CatchAllErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <ErrorPage status={error.status} title={`${error.status}`} />;
  }

  if (error instanceof Error) {
    return <ErrorPage title="Error" message={error.message} />;
  }

  return <ErrorPage title="Unknown Error" message="Something went wrong." />;
}
