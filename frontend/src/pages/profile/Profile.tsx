import { supabase } from "@/lib/supabase/client";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import isDev from "@/lib/utils/isDev";
import { useState } from "react";
import { useNavigate } from "react-router";
import { Edit, ChevronRight } from "lucide-react";
import DefaultAvatar from "@/assets/thecozybud/avatar.png";
import { useAuthStore } from "@/store/useAuthStore";
import { handleError } from "@/lib/utils/format";
import { useToast } from "@/providers/ToastProvider";

const ChevronRightIcon = <ChevronRight className="text-gray-500" />;

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

    // INFO: clearing cache and stores on SIGNED_OUT event is already handled by onAuthStateChange()

    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;

      // Redirect
      navigate("/auth/login", { replace: true });
    } catch (err) {
      const message = handleError(err);
      addToast("Logout failed. Please try again.", "error");
      isDev && console.error(message);

      setSigningOut(false);
    }
  };

  return (
    <div className="">
      <div className="custom-container bg-sidebar border-b-4 flex items-center gap-2 py-8">
        <div className=" mr-1 w-14 h-14 overflow-hidden rounded-full border-2">
          <img
            className="w-full h-full object-cover"
            src={DefaultAvatar}
            alt="avatar"
          />
        </div>

        <h2 className="text-20-semibold">{userName}</h2>

        <Button variant="outline" size="icon">
          <Edit className="size-4" />
        </Button>
      </div>

      <Button
        variant="minimal"
        size="auto"
        className="custom-container flex justify-between border-b border-border/30 items-center gap-2 py-5"
      >
        My Purchases
        {ChevronRightIcon}
      </Button>
      <Button
        variant="minimal"
        size="auto"
        className="custom-container flex justify-between border-b border-border/30 items-center gap-2 py-5"
      >
        Settings
        {ChevronRightIcon}
      </Button>
      <Button
        variant="minimal"
        size="auto"
        className="custom-container flex justify-between border-b border-border/30 items-center gap-2 py-5"
      >
        Voucher
        {ChevronRightIcon}
      </Button>

      {isAdmin && (
        <Button
          variant="minimal"
          size="auto"
          className="custom-container flex justify-between border-b border-border/30 items-center gap-2 py-5"
          onClick={() => navigate("/profile/admin")}
        >
          Admin Dashboard
          {ChevronRightIcon}
        </Button>
      )}

      <div className="custom-container flex-center">
        <Button
          variant="destructive"
          onClick={handleLogout}
          disabled={signingOut}
          className="max-w-120 mt-60 w-full md:ml-auto md:w-40"
        >
          {signingOut ? <Spinner /> : null}
          {signingOut ? "Logging out" : "Logout"}
        </Button>
      </div>
    </div>
  );
};

export default Profile;
