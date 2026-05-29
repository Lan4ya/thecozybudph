import LOGO from "@/assets/thecozybud/logo_transparent_oneline1.png";
import { useLayoutEffect, useState } from "react";
import isDev from "@/lib/utils/isDev";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowLeft, MailCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/ui/__shadcn__/card";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import SideImage from "../SideImage";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/providers/ToastProvider";
import { useCooldown } from "@/hooks/useCooldown";
import { handleError } from "@/lib/utils/format";
import { isAuthApiError } from "@supabase/supabase-js";

const { VITE_APP_URL } = import.meta.env;

const ConfirmEmail = () => {
  const storedConfirmEmail =
    sessionStorage.getItem("signup_confirm_email") || "";

  const navigate = useNavigate();
  const isLgScreen = useIsLgScreenMin();
  const [loading, setLoading] = useState(false);

  const redirectUrl = isDev ? "http://localhost:5173/" : VITE_APP_URL;

  const { addToast } = useToast();
  const { countdown, isLocked, startCooldown } = useCooldown(
    120,
    `email_cooldown_signup_${storedConfirmEmail}`,
  );

  const handleResend = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: storedConfirmEmail,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;

      addToast("Email resent! Please check your inbox.", "success");
      startCooldown();
    } catch (error: unknown) {
      if (isDev) console.error("Resend Error:", error);
      addToast(handleError(error), "error");

      if (isAuthApiError(error) && error.status === 429) {
        startCooldown();
      }
    } finally {
      setLoading(false);
    }
  };

  useLayoutEffect(() => {
    if (!storedConfirmEmail) {
      navigate("/auth/signup", { replace: true });
      return;
    }
  }, [navigate, storedConfirmEmail]);

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
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
              <MailCheck className="size-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Almost there!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-muted-foreground">
              A confirmation email has been sent to{" "}
              <span className="font-medium text-foreground underline decoration-accent/30 decoration-2 underline-offset-4">
                {storedConfirmEmail}
              </span>
              . Please check your inbox and click the verification link to
              activate your account.
            </p>

            <div className="flex flex-col items-center gap-2">
              {/* Resend Email */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleResend}
                disabled={loading || isLocked}
                className=""
              >
                {isLocked ? (
                  `Resend in ${countdown}s`
                ) : (
                  <span className="flex items-center gap-2">
                    {loading && <Spinner />}
                    Resend Link
                  </span>
                )}
              </Button>

              <p className="text-muted-foreground/60 text-xs italic">
                Didn’t receive the email? Check your spam folder.
              </p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Link
                to="/auth/signup"
                className="text-sm text-primary hover:underline font-medium"
              >
                Back to Signup
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isLgScreen && <SideImage />}
    </div>
  );
};

export default ConfirmEmail;
