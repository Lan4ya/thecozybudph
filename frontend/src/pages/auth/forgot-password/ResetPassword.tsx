import { ASSETS } from "@/lib/constants/assets";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Eye, EyeOff, Lock } from "lucide-react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import isDev from "@/lib/utils/isDev";
import { handleError } from "@/lib/utils/format";
import SideImage from "../SideImage";
import { motion } from "framer-motion";
import {
  resetPasswordFormSchema,
  type ResetPassword as ResetPasswordType,
} from "@cozybud/schemas";

// PHASE 3 (Final Phase): Submitting new password for the account

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [passVisible, setPassVisible] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const isLgScreen = useIsLgScreenMin();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm<ResetPasswordType>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  const password = useWatch({ control, name: "password" });
  const disabled = !password;
  const passErr = errors.password;
  const rootErr = errors.root;

  const navigate = useNavigate();

  const onSubmit = async (data: ResetPasswordType) => {
    clearErrors();
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      await supabase.auth.signOut();
      sessionStorage.removeItem("forgot_password_recovery_email");

      setTimeout(() => {
        navigate("/auth/login");
      }, 10000);

      setResetComplete(true);
    } catch (err: unknown) {
      const message = handleError(err);
      if (isDev) console.error(message);

      setError("root", {
        type: "server",
        message,
      });
    } finally {
      setLoading(false);
    }
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

        <div className="px-4 w-full py-3 mb-6 flex-center">
          <img
            loading="eager"
            src={ASSETS.LOGO_ONELINE_ALT}
            alt="logo"
            className="h-full w-40"
          />
        </div>

        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/70">
          {!resetComplete ? (
            <>
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                  <Lock className="size-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-semibold text-foreground">
                  Create new password
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-center text-muted-foreground text-sm">
                  Enter a new password to secure your account.
                </p>

                <form
                  onSubmit={handleSubmit(
                    onSubmit,
                    (err) =>
                      isDev && console.log("Form validation errors:", err),
                  )}
                  className="flex flex-col space-y-4"
                >
                  <div className="relative">
                    <label className="block text-sm mb-1 text-muted-foreground">
                      New Password
                    </label>

                    <div className="relative">
                      <Input
                        {...register("password")}
                        type={passVisible ? "text" : "password"}
                        required
                        className="pr-10 bg-popover border-border/60"
                        placeholder="Enter a strong password"
                      />

                      <Button
                        type="button"
                        variant="minimal"
                        className="absolute top-1/2 -translate-y-1/2 right-3 p-0!"
                        onClick={() => setPassVisible((prev) => !prev)}
                      >
                        {passVisible ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </Button>
                    </div>

                    {passErr && (
                      <p className="text-xs text-red-500 mt-1">
                        {passErr.message}
                      </p>
                    )}
                  </div>

                  {rootErr && (
                    <p className="text-xs text-red-500 mt-1 line-clamp-2 text-center">
                      {rootErr.message}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="border w-full"
                    disabled={loading || disabled}
                  >
                    {loading && <Spinner />}
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </form>

                <div className="pt-4 border-t border-border/50 flex-center">
                  <Link to="/auth/login" className="text-sm text-link">
                    Back to Login
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto bg-green-100/50 p-3 rounded-full w-fit">
                  <Lock className="size-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl font-semibold text-foreground">
                  Password reset successfully!
                </CardTitle>
              </CardHeader>

              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground text-sm">
                  Your password has been reset. You can now log in with your new
                  password.
                </p>

                <p className="text-muted-foreground/60 text-xs italic">
                  Redirecting to login...
                </p>

                <div className="pt-4 border-t border-border/50">
                  <Link
                    to="/auth/login"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Go to Login
                  </Link>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </motion.div>

      {isLgScreen && <SideImage />}
    </div>
  );
};

export default ResetPassword;
