import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router";
import { supabase } from "@/lib/supabase/client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/lib/ui/__shadcn__/card";
import { Button } from "@/lib/ui/__shadcn__/button";

export default function SessionGuard() {
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const protectedPrefixes = ["/profile"];
  const isProtectedRoute = protectedPrefixes.some((p) =>
    location.pathname.startsWith(p),
  );
  const showModal = expired && isProtectedRoute;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setExpired(!session);
    });

    // Subscribe to real-time auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setExpired(!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLoginRedirect = () => {
    navigate("/auth/signup");
  };

  if (!showModal) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center -mb-3">Session Expired</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          Please log in again to continue.
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLoginRedirect}>
            Login
          </Button>
        </CardFooter>
      </Card>
    </div>,
    document.body,
  );
}
