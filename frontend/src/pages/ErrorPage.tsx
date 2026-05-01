("use client");

import { useRouteError, isRouteErrorResponse } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AppError } from "@/lib/axios/client";

type ErrorPageProps = {
  status?: number;
  title?: string;
  message?: string;
};

const messages: Record<number, string> = {
  401: "You’re not authorized to view this page.",
  404: "Oops! The page you’re looking for doesn’t exist.",
  500: "Oops! Something went wrong on our servers.",
};

export const ErrorPage = ({ status, title, message }: ErrorPageProps) => {
  const navigate = useNavigate();

  const finalMessage =
    message || (status ? messages[status] : "Something went wrong.");

  // Set global auth status to expired to toggle SessionExpiredModal. Token
  // expired can happen if user tries to request something from the server and
  // for some reason the token doesn't refresh properly, server responding with
  // "Token expired". Ofc this prob won't happen that much since supabase auto
  // refresh token is reliable.
  const isTokenExpired = status === 401 && finalMessage === "Token expired";
  useEffect(() => {
    if (isTokenExpired) {
      useAuthStore.setState({
        status: "expired",
      });
    }
  }, [isTokenExpired]);

  if (isTokenExpired) {
    // SessionExpiredModal will render at this point so we don't need to render anything here
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Title */}
        <h1 className="font-back-to-black text-primary text-6xl md:text-7xl">
          {title || "Error"}
        </h1>

        {/* Message */}
        <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto">
          {finalMessage}
        </p>

        {/* CTA */}
        <div className="mt-8">
          {status === 500 ? (
            <Button
              onClick={() => navigate(0)}
              variant="default"
              size="lg"
              className="rounded-2xl"
              aria-label="Retry loading the page"
            >
              Try again
            </Button>
          ) : status === 404 || status === 401 ? (
            <Button
              onClick={() => navigate(-1)}
              variant="default"
              size="lg"
              className="rounded-2xl"
            >
              Go back
            </Button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};

export function CatchAllErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error) || error instanceof AppError) {
    return <ErrorPage status={error.status} title={`${error.status}`} />;
  }

  if (error instanceof Error) {
    return <ErrorPage title="Error" message={error.message} />;
  }

  return <ErrorPage title="Unknown Error" message="Something went wrong." />;
}
