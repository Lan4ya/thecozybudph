import { useState } from "react";
import { Button } from "@/lib/ui/__shadcn__/button";
import { supabase } from "@/lib/supabase/client";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import isDev from "@/lib/utils/isDev";
import { useNavigate } from "react-router";
import { useRedirectIfAuthed } from "@/hooks/useRedirectIfAuthed";

export const ConfirmEmail = () => {
  const checkingAuth = useRedirectIfAuthed();

  const navigate = useNavigate();

  const email = localStorage.getItem("confirm-email");
  if (!email) {
    navigate("/auth/signup");
    return null;
  }

  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setError(null);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: isDev
          ? "http://localhost:5173/dashboard"
          : "https:thecozybud.vercel.app",
      },
    });

    if (error) {
      setError(error.message || "Failed to resend email. Try again later.");
    } else {
      setSent(true);
      localStorage.removeItem("confirm-email");
    }

    setResending(false);
  };

  if (checkingAuth) return null;

  return (
    <div className="h-screen max-w-md mx-auto p-6 backdrop-blur-md rounded-xl shadow-md flex-center flex-col  text-center space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">Almost there!</h2>
      <p className="text-gray-600">
        A confirmation email has been sent to{" "}
        <span className="font-medium text-gray-800">{email}</span>. Please check
        your inbox and click the verification link to activate your account.
      </p>

      {sent ? (
        <p className="text-green-600 font-medium">
          Verification email resent! Check your inbox.
        </p>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="flex items-center justify-center gap-2"
          onClick={handleResend}
          disabled={resending}
        >
          {resending && <Spinner />}
          Resend Email
        </Button>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <p className="text-gray-400 text-xs mt-2">
        Didn’t receive the email? Check your spam folder.
      </p>
    </div>
  );
};
