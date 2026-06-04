import { ASSETS } from "@/lib/constants/assets";
import { useState } from "react";
import isDev from "@/lib/utils/isDev";
import { Turnstile } from "@marsidev/react-turnstile";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  useForm,
  useWatch,
  Controller,
  type SubmitHandler,
} from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/ui/__shadcn__/card";
import { Link, useNavigate } from "react-router";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import googleIcon from "@/assets/icons/google.svg";
import { useIsLgScreenMin } from "@/hooks/useMediaQuery";
import {
  signUpFormSchema,
  type SignUpFormData,
  type SignupInput,
} from "@cozybud/schemas";
import { Input } from "@/lib/ui/__shadcn__/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleError } from "@/lib/utils/format";
import SideImage from "../SideImage";
import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/api";
import type { AppError } from "@/api/_error";
import { OAuthSignin } from "../OAuthSignin";
import { useActionCooldown } from "@/hooks/useCooldown";

const { VITE_CF_TURNSTILE_SITE_KEY } = import.meta.env;

const Signup = () => {
  const [passVisible, setPassVisible] = useState(false);

  const navigate = useNavigate();
  const isLgScreen = useIsLgScreenMin();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setError,
    control,
  } = useForm<SignUpFormData>({
    defaultValues: {
      email: "mayadesuu304@gmail.com",
      password: "password123",
    },
    resolver: zodResolver(signUpFormSchema),
  });

  const [email, password, turnstileToken] = useWatch({
    control,
    name: ["email", "password", "cfTurnstileToken"],
  });

  const emailErr = errors.email;
  const passErr = errors.password;
  const rootErr = errors.root;

  const { onCooldown, timeRemaining, startCooldown } = useActionCooldown(
    `cooldown:email_verification:${email}`,
  );

  const { mutate: signupMutation, isPending: signupLoading } = useMutation({
    mutationFn: async (payload: SignupInput) => AuthAPI.signup(payload),
    onSuccess: (data) => {
      if (data.user?.identities?.length === 0) {
        setError("email", {
          type: "server",
          message: "email is already registered",
        });
        return;
      }
      startCooldown();
      sessionStorage.setItem("signup_attempt", email);
      navigate("/auth/confirm-email");
    },
    onError: (error: AppError) => {
      if (error) {
        setError("root", {
          type: "server",
          message: error.message,
        });
        throw error;
      }
    },
  });

  const handleSignInWithOAuth = async () => {
    clearErrors();
    try {
      const { data } = await OAuthSignin();
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

  const onSubmit: SubmitHandler<SignUpFormData> = async (data) => {
    clearErrors();
    signupMutation(data);
  };

  return (
    <div className="custom-container flex lg:flex lg:gap-15 xl:gap-30 pt-6 justify-center items-center h-screen">
      <div className="flex flex-col lg:justify-center h-full max-w-md">
        <Link
          to="/"
          className="p-2 mb-6 xl:mb-10 text-sm w-24 flex-center gap-1 border rounded-lg "
        >
          <ArrowLeft className="size-4" /> Home
        </Link>

        {/* LOGO */}
        <div className="px-4 w-full py-3 mb-2 xl:mb-6  flex-center">
          <img
            loading="eager"
            decoding="sync"
            src={ASSETS.LOGO_ONELINE}
            alt="logo"
            className="h-full w-40"
          />
        </div>

        {/* Signup Form */}
        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/70">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold text-foreground">
              Sign up for an account
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
                  {...register("email")}
                  type="text"
                  placeholder="youremail@email.com"
                  className="bg-popover border-border/60"
                />
                {emailErr && (
                  <p className="text-xs text-red-500 mt-1">
                    {emailErr.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="mb-5 relative">
                <label className="block text-sm text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={passVisible ? "text" : "password"}
                    placeholder="Enter a strong password"
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
                      siteKey={VITE_CF_TURNSTILE_SITE_KEY}
                      options={{
                        theme: "dark",
                        size: "flexible",
                        appearance: "interaction-only",
                      }}
                      onSuccess={(token: string) => field.onChange(token)}
                      onExpire={() => field.onChange("")}
                      onError={() => field.onChange("")}
                    />
                  )}
                />
              </div>

              <Button
                type="submit"
                className="border w-full flex-center"
                disabled={
                  signupLoading ||
                  !email ||
                  !password ||
                  !turnstileToken ||
                  onCooldown
                }
              >
                {
                  signupLoading ? (
                    <Spinner />
                  ) : onCooldown ? null : null /* spacer */
                }
                {signupLoading
                  ? "Signing up"
                  : onCooldown
                    ? `Wait ${timeRemaining}`
                    : "Sign up"}
              </Button>

              {/* Root Err */}
              {rootErr && (
                <p className="text-xs text-red-500 mt-1 line-clamp-2 text-center">
                  {rootErr.message}
                </p>
              )}

              <div className="text-muted-foreground mt-2 text-sm">
                Already have an account?
                <Link
                  to="/auth/login"
                  className="pl-1 text-blue-500 hover:text-blue-500/90 hover:underline"
                >
                  Login to your account
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

export default Signup;
