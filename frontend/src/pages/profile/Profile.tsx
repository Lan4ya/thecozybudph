import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/lib/ui/__shadcn__/button";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import isDev from "@/lib/utils/isDev";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Profile = () => {
  const loading = useAuthGuard();
  const [user, setUser] = useState<any>(null);
  const [signingOut, setSigningOut] = useState(false);
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      console.log(user);
    };

    isDev && console.log({ user });
    fetchUser();
  }, []);

  const navigate = useNavigate();

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;

      navigate("/auth/login", { replace: true });
      setUser(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unknown error occurred";
      isDev && console.error(message);
      setSigningOut(false);
    }
  };

  if (loading) return null;

  return (
    <div>
      <p>Profile Page</p>
      <Button
        variant="destructive"
        onClick={handleLogout}
        disabled={signingOut}
      >
        {signingOut ? <Spinner /> : null}
        {signingOut ? "Logging out" : "Logout"}
      </Button>
    </div>
  );
};

export default Profile;
