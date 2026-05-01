import { supabase } from "@/lib/supabase/client";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import isDev from "@/lib/utils/isDev";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Edit, ChevronRight, Shield } from "lucide-react";
import DefaultAvatar from "@/assets/thecozybud/avatar.png";
import { useAuthStore } from "@/store/useAuthStore";
import { handleError } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";

const Row = ({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick?: () => void;
  icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-4 py-4 md:px-5 md:py-4 hover:bg-card/60 transition-colors"
  >
    <div className="flex items-center gap-3 text-sm md:text-base">
      {icon}
      {label}
    </div>
    <ChevronRight className="size-4 text-muted" />
  </button>
);

const Section = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="bg-card rounded-xl border overflow-hidden">
    {title && (
      <div className="px-4 py-3 md:px-5 text-xs text-muted uppercase tracking-wide">
        {title}
      </div>
    )}
    <div className="divide-y">{children}</div>
  </div>
);

const Profile = () => {
  const session = useAuthStore((s) => s.session);
  const isAdmin = session?.user?.app_metadata?.role === "admin";

  const [signingOut, setSigningOut] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const userName =
    session?.user?.user_metadata?.name ?? session?.user?.email?.split("@")[0];

  const handleLogout = async () => {
    setSigningOut(true);

    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;

      navigate("/auth/login", { replace: true });
    } catch (err) {
      const message = handleError(err);
      addToast("Logout failed. Please try again.", "error");
      isDev && console.error(message);

      setSigningOut(false);
    }
  };

  return (
    <div className="w-full px-4 py-6 md:px-6 lg:px-8">
      {/* Container */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex sm:items-center gap-4 bg-card/40 p-5 rounded-xl border">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border shrink-0">
            <img
              src={DefaultAvatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-lg md:text-xl font-semibold truncate">
              {userName}
            </p>
            <p className="text-sm text-muted truncate">
              {session?.user?.email}
            </p>
          </div>

          <Button
            size="icon"
            variant="outline"
            className="self-start sm:self-auto"
            onClick={() => navigate("/profile/edit")}
          >
            <Edit className="size-4" />
          </Button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left (Main) */}
          <div className="lg:col-span-2 space-y-6">
            <Section title="Account">
              <Row
                label="My Purchases"
                onClick={() => navigate("/profile/my-purchases")}
              />
              <Row
                label="Vouchers"
                onClick={() => navigate("/profile/vouchers")}
              />
              <Row
                label="Settings"
                onClick={() => navigate("/profile/settings")}
              />
            </Section>

            {isAdmin && (
              <Section title="Admin">
                <Row
                  label="Dashboard"
                  icon={<Shield className="size-4 text-primary" />}
                  onClick={() => navigate("/profile/admin")}
                />
              </Section>
            )}
          </div>

          {/* Right (Side / Actions) */}
          <div className="space-y-6">
            <Section title="Danger Zone">
              <div className="p-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLogout}
                  disabled={signingOut}
                >
                  {signingOut && <Spinner />}
                  {signingOut ? "Logging out..." : "Logout"}
                </Button>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
