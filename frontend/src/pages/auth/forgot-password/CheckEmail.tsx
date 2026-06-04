import { ASSETS } from "@/lib/constants/assets";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/ui/__shadcn__/card";
import { Link, useNavigate } from "react-router";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import SideImage from "../SideImage";
import { motion } from "framer-motion";
import { useActionCooldown } from "@/hooks/useCooldown";
import { useToast } from "@/providers/ToastProvider";
import { handleSupabaseAuthError } from "@/lib/utils/format";
import { AuthAPI } from "@/api/auth";

import { useMutation } from "@tanstack/react-query";
import { Turnstile } from "@marsidev/react-turnstile";
import type { AppError } from "@/api/_error";

const { VITE_CF_TURNSTILE_SITE_KEY } = import.meta.env;

const CheckEmail = () => {
  const sentEmail =
    sessionStorage.getItem("forgot_password_recovery_email") || "";
  const isLgScreen = useIsLgScreenMin();

  const [cfTurnstileToken, setCfTurnstileToken] = useState("");

  const { onCooldown, timeRemaining, startCooldown } = useActionCooldown(
    `cooldown:password_reset:${sentEmail}`,
  );

  const { addToast } = useToast();
  const navigate = useNavigate();

  const { mutateAsync: resendMutation, isPending: resendLoading } = useMutation(
    {
      mutationFn: async () =>
        AuthAPI.requestResetPassword({
          email: sentEmail,
          cfTurnstileToken,
        }),
      onSuccess: () => {
        addToast("Email resent! Please check your inbox.", "success");
        startCooldown();
        setCfTurnstileToken("");
      },

      onError: (error: AppError) => {
        const message = handleSupabaseAuthError(error);
        addToast(message, "error");
      },
    },
  );

  const handleResend = async () => {
    if (!sentEmail || !cfTurnstileToken) return;
    await resendMutation();
  };

  return (
    <div className="custom-container flex lg:flex lg:gap-15 xl:gap-30 pt-6 justify-center items-center h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:justify-center h-full max-w-md w-full"
      >
        <Link
          to="/"
          className="p-2 mb-10 text-sm w-24 flex-center gap-1 border rounded-lg hover:bg-accent/5 transition-colors"
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        {/* LOGO */}
        <div className="px-4 w-full py-3 mb-6 flex-center">
          <img
            loading="eager"
            decoding="sync"
            src={ASSETS.LOGO_ONELINE}
            alt="logo"
            className="h-full w-40"
          />
        </div>

        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/70">
          <>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto bg-green-100/50 p-3 rounded-full w-fit">
                <Mail className="size-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Check your email
              </CardTitle>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  A password reset link has been sent to{" "}
                  <span className="font-medium text-foreground underline decoration-accent/30 decoration-2 underline-offset-4">
                    {sentEmail}
                  </span>
                  .
                </p>

                <p className="text-muted-foreground text-sm">
                  Please check your inbox and click the reset link to create a
                  new password.
                </p>

                <p className="text-muted-foreground/60 text-sm">
                  Wrong email?
                  <Button
                    variant="minimal"
                    size="sm"
                    className="p-1! text-link"
                    onClick={() => {
                      navigate("/auth/forgot-password", { replace: true });
                    }}
                  >
                    Change email
                  </Button>
                </p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <Turnstile
                  siteKey={VITE_CF_TURNSTILE_SITE_KEY}
                  options={{
                    appearance: "interaction-only",
                  }}
                  onSuccess={(token: string) => setCfTurnstileToken(token)}
                  onExpire={() => setCfTurnstileToken("")}
                  onError={() => setCfTurnstileToken("")}
                />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={resendLoading || !cfTurnstileToken || onCooldown}
                >
                  {onCooldown ? (
                    `Resend in ${timeRemaining}`
                  ) : (
                    <span className="flex items-center gap-2">
                      {resendLoading && <Spinner />}
                      {resendLoading ? "Resending..." : "Resend Link"}
                    </span>
                  )}
                </Button>

                <p className="text-muted-foreground/60 text-xs italic">
                  Didn’t receive the email? Check your spam folder.
                </p>
              </div>

              <div className="pt-4 border-t border-border/50">
                <Link to="/auth/login" className="text-link text-sm">
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </>
        </Card>
      </motion.div>

      {isLgScreen && <SideImage />}
    </div>
  );
};

export default CheckEmail;
