import { ASSETS } from "@/lib/constants/assets";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
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
import googleIcon from "@/assets/icons/google.svg";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import { logInFormSchema, type LogInFormData } from "@cozybud/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, Controller } from "react-hook-form";
import isDev from "@/lib/utils/isDev";
import { handleError } from "@/lib/utils/format";
import SideImage from "../SideImage";
import { OAuathSignin } from "../OAuathSignin";
import { Turnstile } from "@marsidev/react-turnstile";

import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/api";

const { VITE_CF_TURNSTILE_SITE_KEY } = import.meta.env;

const Login = () => {
  const [passVisible, setPassVisible] = useState(false);

  const navigate = useNavigate();

  const siteKey =
    VITE_CF_TURNSTILE_SITE_KEY || (isDev ? "1x00000000000000000000AA" : "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,

    control,
  } = useForm<LogInFormData>({
    resolver: zodResolver(logInFormSchema),
    defaultValues: !isDev
      ? {
          email: "",
          password: "",
        }
      : {
          email: "admin@local.dev",
          password: "password123",
        },
  });

  const [email, password, cfTurnstileToken] = useWatch({
    control,
    name: ["email", "password", "cfTurnstileToken"],
  });

  const disabled = !email || !password || !cfTurnstileToken;

  const emailErr = errors.email;
  const passErr = errors.password;
  const rootErr = errors.root;

  const isLgScreen = useIsLgScreenMin();

  const handleSignInWithOAuth = async () => {
    clearErrors();
    try {
      const { data } = await OAuathSignin();
      isDev && console.log({ data });
    } catch (err: unknown) {
      const message = handleError(err);
      setError("root", {
        type: "server",
        message,
      });
      isDev && console.error(message);
    }
  };

  const { mutateAsync: loginMutation, isPending: loginLoading } = useMutation({
    mutationFn: async (payload: LogInFormData) => AuthAPI.login(payload),
    onSuccess: async (data) => {
      const { error } = await supabase.auth.setSession({
        access_token: data.accessToken,
        refresh_token: data.refreshToken,
      });

      if (error) throw error;

      sessionStorage.setItem("activeLogin", "true");
      isDev && console.log({ data });
      navigate("/");
    },
    onError: (error: unknown) => {
      const message = handleError(error);
      setError("root", {
        type: "server",
        message,
      });
    },
  });

  async function onSubmit(data: LogInFormData) {
    clearErrors();
    await loginMutation(data);
  }

  return (
    <div className="custom-container flex lg:flex lg:gap-15 xl:gap-30 pt-6 justify-center items-center h-screen">
      <div className="flex flex-col lg:justify-center h-full max-w-md">
        <Link
          to="/"
          className="p-2 mb-10 text-sm w-24 flex-center gap-1 border rounded-lg "
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        <div className="px-4 w-full py-3 mb-6 flex-center">
          <img
            loading="eager"
            decoding="sync"
            src={ASSETS.LOGO_ONELINE_ALT}
            alt="logo"
            className="h-full w-40"
          />
        </div>

        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/70">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-foreground">
              Log in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(
                onSubmit,
                (err) => isDev && console.log("Form validation errors:", err),
              )}
              className="flex flex-col"
            >
              {/* Email */}
              <div className="mb-5">
                <label className="block text-sm mb-1 text-muted-foreground">
                  Email
                </label>
                <Input
                  placeholder="youremail@email.com"
                  type="email"
                  required
                  {...register("email")}
                  className="bg-popover border-border/60"
                />

                {/* Email Errs */}
                {emailErr && (
                  <p className="text-xs text-red-500 mt-1">
                    {emailErr.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-5 relative">
                <div className="flex-between mb-1">
                  <label className="block text-sm text-muted-foreground">
                    Password
                  </label>

                  <Link
                    to="/auth/forgot-password"
                    className="ml-auto text-blue-500 hover:text-blue-500/90 hover:underline text-sm"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    placeholder="Enter your password"
                    {...register("password")}
                    type={passVisible ? "text" : "password"}
                    required
                    className="pr-10 bg-popover border-border/60"
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

                {/* Pass Err */}
                {passErr && (
                  <p className="text-xs text-red-500 mt-1">{passErr.message}</p>
                )}
              </div>

              {/* CF Turnstile */}
              <div className="flex justify-center mb-2 w-full">
                <Controller
                  control={control}
                  name="cfTurnstileToken"
                  render={({ field }) => (
                    <Turnstile
                      siteKey={siteKey}
                      options={{
                        theme: "dark",
                        size: "flexible",
                        appearance: "always",
                      }}
                      onSuccess={(token: string) => field.onChange(token)}
                      onExpire={() => field.onChange("")}
                      onError={() => field.onChange("")}
                    />
                  )}
                />
              </div>

              {/* Log In */}
              <Button
                type="submit"
                className="border w-full"
                disabled={loginLoading || disabled}
              >
                {loginLoading ? <Spinner /> : null}
                {loginLoading ? "Logging in..." : "Log in"}
              </Button>

              {/* Root Error  */}
              {rootErr && (
                <p className="text-xs text-red-500 mt-1 line-clamp-2 text-center">
                  {rootErr.message}
                </p>
              )}

              <div className="text-muted-foreground mt-2 text-sm">
                New to CozyBud?
                <Link
                  to="/auth/signup"
                  className="pl-1 text-blue-500 hover:text-blue-500/90 hover:underline"
                >
                  Sign up for an account
                </Link>
              </div>
            </form>

            <div className="mt-4 flex-center gap-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <div className="text-gray-500 text-sm">
                Or connect to CozyBud with
              </div>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Google OAuth */}
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2 mt-4 w-full"
              onClick={handleSignInWithOAuth}
            >
              <img src={googleIcon} alt="Google" className="size-4" />
              <span className="mt-0.5">Google</span>
            </Button>

            {/* TOS and Privacy Policy */}
            <p className="text-muted-foreground mt-4 text-sm">
              By creating an account you agree to the
              <Link className="underline" to="/terms-of-service">
                {" "}
                Terms of Service{" "}
              </Link>{" "}
              and our
              <Link className="underline" to="/privacy-policy">
                {" "}
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>

      {isLgScreen && <SideImage />}
    </div>
  );
};

export default Login;
