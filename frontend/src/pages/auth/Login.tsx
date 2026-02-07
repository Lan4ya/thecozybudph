import sign_up_pic from "@/assets/thecozybud/TCB_4.png";
import LOGO from "@/assets/thecozybud/logo_transparent_oneline1.png";
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
import { useIsLargeScreen } from "@/hooks/useMediaQuery";
import { useRedirectIfAuthed } from "@/hooks/useRedirectIfAuthed";
import { logInSchema, type LogIn } from "@TheCozyBud/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import isDev from "@/lib/utils/isDev";
// import { Checkbox } from "@/lib/ui/__shadcn__/checkbox";
// import { Label } from "@radix-ui/react-label";

const Login = () => {
  const checkingAuth = useRedirectIfAuthed();
  const [loading, setLoading] = useState(false);
  const [passVisible, setPassVisible] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    // setValue,
    formState: { errors },
    clearErrors,
    setError,
  } = useForm<LogIn>({
    resolver: zodResolver(logInSchema),
    defaultValues: {
      email: "aileenambong30@gmail.com",
      password: "test1234",
    },
  });
  const { email, password } = watch();

  const disabled = !email || !password;

  const emailErr = errors.email;
  const passErr = errors.password;
  const rootErr = errors.root;

  const isLgScreen = useIsLargeScreen();

  const handleSignInWithOAuth = async () => {
    clearErrors();

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: isDev
            ? "http://localhost:5173/"
            : "https://thecozybud.vercel.app/", // NOTE: idk yet if im deploy to vercel or cloudflare
        },
      });
      if (error) throw error;

      sessionStorage.setItem("notifyLogInSuccess", "success");
      isDev && console.log({ data });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";

      setError("root", {
        type: "server",
        message,
      });

      isDev && console.error(message);
    }
  };

  async function onSubmit() {
    clearErrors();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      sessionStorage.setItem("notifyLogInSuccess", "success");
      isDev && console.log({ data });
      navigate(isDev ? "/" : "https://thecozybud.vercel.app/"); // NOTE: idk yet if im deploy to vercel or cloudflare
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";

      isDev && console.error(message);

      setError("root", {
        type: "server",
        message,
      });
    }
    setLoading(false);
  }

  if (checkingAuth) return null;

  return (
    <div className="grid lg:grid-cols-[45%_1fr] h-screen">
      <div className="custom-container flex justify-center w-full">
        <div className="relative w-full max-w-md pt-30 lg:pt-40 xl:pt-50">
          <div className="px-4 w-full py-3 mb-6 flex-center">
            <img
              loading="eager"
              decoding="sync"
              src={LOGO}
              alt="logo"
              className="h-full w-40"
            />
          </div>

          <Link
            to="/"
            className="py-2 pl-2 pr-3 text-sm flex-center gap-1 border rounded-lg absolute top-4 left-3"
          >
            <ArrowLeft className="size-4" /> Home
          </Link>
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
                      to="/forgot-password"
                      className="ml-auto text-blue-500 hover:text-blue-500/90 hover:underline text-sm"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Input
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
                    <p className="text-xs text-red-500 mt-1">
                      {passErr.message}
                    </p>
                  )}
                </div>

                {/* Log In */}
                <Button
                  type="submit"
                  className="border w-full"
                  disabled={loading || disabled}
                >
                  {loading ? <Spinner className="mr-1" /> : null}
                  {loading ? "Logging in..." : "Log in"}
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
      </div>

      {isLgScreen && (
        <div className="max-h-screen">
          <img
            className="object-cover w-full h-full "
            loading="eager"
            src={sign_up_pic}
            alt="signup image"
          />
        </div>
      )}
    </div>
  );
};

export default Login;
