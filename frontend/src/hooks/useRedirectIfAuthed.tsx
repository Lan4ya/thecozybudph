import { supabase } from "@/lib/supabase/client";
import isDev from "@/lib/utils/isDev";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export const useRedirectIfAuthed = () => {
  const [loading, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate(isDev ? "/" : "https://thecozybud.vercel.app/", {
          replace: true,
        });
      } else {
        setCheckingAuth(false);
      }
    });
  }, []);

  return loading;
};
