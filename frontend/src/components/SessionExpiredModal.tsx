import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/lib/ui/__shadcn__/card";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { supabase } from "@/lib/supabase/client";
import { handleError } from "@/lib/utils/format";
import isDev from "@/lib/utils/isDev";
import { useQueryClient } from "@tanstack/react-query";
import { useCartStore } from "@/store/useCartStore";
import { useProductSelectionStore } from "@/store/useProductSelectionStore";

export default function SessionExpiredModal() {
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === "expired") {
      setShowModal(true);
      useLockBodyScroll(true);
    }
  }, [status]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLoginRedirect = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;

      // Clear tanstack query cache and stores
      queryClient.clear();
      useAuthStore.setState({
        session: null,
        status: "unauthenticated",
      });
      useProductSelectionStore.getState().reset([]);
      useCartStore.getState().reset();

      setShowModal(false);
      navigate("/auth/login", { replace: true });
    } catch (err) {
      setError("Something went wrong. Please try again.");
      const message = handleError(err);
      isDev && console.error(message);
    }
  };

  if (!showModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center -mb-3">Session Expired</CardTitle>
        </CardHeader>

        <CardContent className="text-center">
          <p className="mb-6">Please log in again to continue.</p>

          <Button className="w-full" onClick={handleLoginRedirect}>
            Login
          </Button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </CardContent>
      </Card>
    </div>,
    document.body,
  );
}
