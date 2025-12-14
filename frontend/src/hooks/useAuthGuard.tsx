import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useNavigate } from "react-router";

export function useAuthGuard(redirectTo = "/auth/login") {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!ignore) navigate(redirectTo, { replace: true });
        return;
      }

      if (!ignore) setLoading(false);
    }

    check();

    return () => {
      ignore = true;
    };
  }, [navigate, redirectTo]);

  return loading;
}
