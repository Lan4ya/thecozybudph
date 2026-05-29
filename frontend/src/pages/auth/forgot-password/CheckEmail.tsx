import LOGO from "@/assets/thecozybud/logo_transparent_oneline1.png";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/ui/__shadcn__/card";
import { Link, useLocation, useNavigate } from "react-router";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import isDev from "@/lib/utils/isDev";
import SideImage from "../SideImage";
import { motion } from "framer-motion";
import { useCooldown } from "@/hooks/useCooldown";
import { useToast } from "@/providers/ToastProvider";
import { handleSupabaseAuthError } from "@/lib/utils/format";
import { RESET_PASSWORD_REDIRECT_URL } from "./SubmitEmail";

// PHASE 2: Prompting user to check email and click recovery link.

const CheckEmail = () => {
  const location = useLocation();

  const initialEmail =
    location.state?.email ||
    sessionStorage.getItem("forgot_password_recovery_email");

  const [loading, setLoading] = useState(false);
  const [sentEmail, _setSentEmail] = useState<string>(initialEmail || "");

  const isLgScreen = useIsLgScreenMin();

  const { countdown, isLocked, startCooldown } = useCooldown(
    180,
    `email_cooldown_recovery_${sentEmail}`,
  );

  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleResend = async () => {
    if (!sentEmail) return;

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sentEmail, {
        redirectTo: RESET_PASSWORD_REDIRECT_URL,
      });
      if (error) throw error;

      addToast("Email resent! Please check your inbox.", "success");
      startCooldown();
    } catch (err: unknown) {
      if (isDev) console.error(err);
      const message = handleSupabaseAuthError(err);
      addToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeRemaining = `${minutes}:${seconds.toString().padStart(2, "0")}`;

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
            src={LOGO}
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

                <p className="text-muted-foreground text-sm">
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResend}
                  disabled={loading || isLocked}
                >
                  {isLocked ? (
                    `Resend in ${timeRemaining}`
                  ) : (
                    <span className="flex items-center gap-2">
                      {loading && <Spinner />}
                      {loading ? "Resending Link..." : "Resend Link"}
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
