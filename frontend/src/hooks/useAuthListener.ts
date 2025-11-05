import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useToast } from "@/providers/ToastProvider";
import { supabase } from "@/lib/supabase/connect";

export function useAuthListener() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          addToast("Session expired", "error");
          navigate("/login");
        }
      },
    );

    return () => {
      (subscription as any).unsubscribe();
    };
  }, [addToast, navigate]);
}
