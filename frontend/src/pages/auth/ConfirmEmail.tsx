import LOGO from "@/assets/thecozybud/logo_transparent_oneline1.png";
import { useLayoutEffect, useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { supabase } from "@/lib/supabase/client";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import isDev from "@/lib/utils/isDev";
import { useNavigate } from "react-router";

const ConfirmEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);

  useLayoutEffect(() => {
    const storedEmail = localStorage.getItem("confirm-email");
    if (!storedEmail) {
      navigate("/auth/signup", { replace: true });
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);

  const [isResending, setResending] = useState(false);
  const [isSent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setError(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: isDev
          ? "http://localhost:5173/"
          : "https:thecozybud.vercel.app",
      },
    });

    if (error) {
      isDev && console.log(error.message);
      setError("Failed to resend email. Please try again later.");
      return;
    }

    setSent(true);
    setResending(false);
  };

  if (!email) return null;

  return (
    <main className="custom-container border flex-center flex-col min-h-screen">
      <div className="px-4 w-full py-3 mb-6 flex-center">
        <img
          loading="eager"
          decoding="sync"
          src={LOGO}
          alt="logo"
          className="h-full w-40"
        />
      </div>

      <div className="border h-[50vh] shadow-md  max-w-md p-6 backdrop-blur-md rounded-xl flex-center flex-col text-center space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Almost there!
        </h2>
        <p className="text-gray-600">
          A confirmation email has been sent to{" "}
          <span className="font-medium text-gray-800">{email}</span>. Please
          check your inbox and click the verification link to activate your
          account.
        </p>

        {isSent ? (
          <p className="text-green-600 font-medium">
            Verification email resent! Check your inbox.
          </p>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="flex items-center justify-center gap-2"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending && <Spinner />}
            Resend
          </Button>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <p className="text-gray-400 text-xs mt-2">
          Didn’t receive the email? Check your spam folder.
        </p>
      </div>
    </main>
  );
};

export default ConfirmEmail;
