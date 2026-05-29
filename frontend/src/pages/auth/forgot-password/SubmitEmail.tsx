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
import { Input } from "@/lib/ui/__shadcn__/input";
import { Link, useNavigate } from "react-router";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import {
  forgotPasswordFormSchema,
  type ForgotPassword as ForgotPasswordType,
} from "@cozybud/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import isDev from "@/lib/utils/isDev";
import SideImage from "../SideImage";
import { motion } from "framer-motion";
import { FieldError } from "@/pages/checkout/components/FieldError";
import { useCooldown } from "@/hooks/useCooldown";
import { handleSupabaseAuthError } from "@/lib/utils/format";

const { VITE_APP_URL } = import.meta.env;

const getRedirectUrl = () => {
  if (isDev) return "http://localhost:5173/auth/forgot-password/reset-password";
  const baseUrl = VITE_APP_URL.startsWith("http")
    ? VITE_APP_URL
    : `https://${VITE_APP_URL}`;
  return `${baseUrl}/auth/forgot-password/reset-password`;
};

export const RESET_PASSWORD_REDIRECT_URL = getRedirectUrl();

// PHASE 1: Submitting which email account to recover password from

const SubmitEmail = () => {
  // Check if email was previously submitted in this session to pre-fill the form and manage cooldown
  const storedResetEmail = sessionStorage.getItem(
    "forgot_password_recovery_email",
  );

  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState<string>(storedResetEmail || "");

  const isLgScreen = useIsLgScreenMin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    control,
    clearErrors,
  } = useForm<ForgotPasswordType>({
    defaultValues: { email: "" },
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const email = useWatch({
    control,
    name: "email",
  });
  const emailErr = errors.email;
  const rootErr = errors.root;

  const { countdown, isLocked, startCooldown } = useCooldown(
    180,
    `email_cooldown_recovery_${sentEmail}`,
  );
  const navi = useNavigate();

  const onSubmit = async (data: ForgotPasswordType) => {
    clearErrors();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: RESET_PASSWORD_REDIRECT_URL,
      });

      if (error) throw error;

      setSentEmail(data.email);
      sessionStorage.setItem("forgot_password_recovery_email", data.email);

      startCooldown();

      navi("/auth/forgot-password/check-email");
    } catch (err: unknown) {
      if (isDev) console.error(err);
      const message = handleSupabaseAuthError(err);

      setError("root", {
        type: "server",
        message,
      });
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
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                <Mail className="size-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-semibold text-foreground">
                Reset your password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-center text-muted-foreground text-sm">
                Enter your email address and we'll send you a link to reset your
                password.
              </p>

              <form
                noValidate
                onSubmit={handleSubmit(
                  onSubmit,
                  (err) => isDev && console.log("Form validation errors:", err),
                )}
                className="flex flex-col"
              >
                {/* Email */}
                <div className="mb-5">
                  <label className="block text-sm mb-1 text-muted-foreground">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    {...register("email")}
                    className="bg-popover border-border/60"
                    placeholder="youremail@email.com"
                  />
                  {emailErr && <FieldError message={emailErr.message} />}
                </div>

                {/* Send Link */}
                <div>
                  <Button
                    type="submit"
                    className="border w-full"
                    disabled={loading || !email || isLocked}
                  >
                    {loading && <Spinner />}
                    {loading
                      ? "Sending Link..."
                      : isLocked
                        ? `Resend in ${timeRemaining}`
                        : "Send Reset Link"}
                  </Button>
                </div>

                {rootErr && <FieldError message={rootErr.message} />}
              </form>

              <div className="pt-4 flex-center border-t border-border/50">
                <Link to="/auth/login" className="text-sm text-link">
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

export default SubmitEmail;
