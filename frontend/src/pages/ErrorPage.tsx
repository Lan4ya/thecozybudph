"use client";

import { useRouteError, isRouteErrorResponse } from "react-router";
import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { AppError } from "@/api/_error";
import { AlertCircle, ArrowLeft, Home, RefreshCw } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background px-6 overflow-hidden">
      {/* Soft Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-destructive)_0%,transparent_65%)] opacity-[0.03] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="z-10 max-w-md w-full text-center space-y-6"
      >
        <div className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 shadow-[0_0_20px_rgba(var(--color-destructive),0.05)]">
          <AlertCircle className="h-9 w-9 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="font-apple text-primary text-3xl font-semibold tracking-tight sm:text-4xl">
            {title || "Something went wrong"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
            {finalMessage ||
              "An unexpected error occurred. Please try again or contact support if the issue persists."}
          </p>
        </div>

        {/* Action Hierarchy */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          {status === 500 ? (
            <Button
              onClick={() => navigate(0)}
              variant="default"
              size="lg"
              className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium gap-2 transition-transform active:scale-[0.98]"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          ) : (
            <Button
              onClick={() => navigate(-1)}
              variant="default"
              size="lg"
              className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium gap-2 transition-transform active:scale-[0.98]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Button>
          )}

          {/* Secondary Escape Hatch (Always visible) */}
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium gap-2 border-muted hover:bg-muted/50 transition-transform active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Home
          </Button>
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
    return <ErrorPage title="Oops! An Error" message={error.message} />;
  }

  return <ErrorPage title="Unknown Error" message="Something went wrong." />;
}
