import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { supabase } from "@/lib/supabase/connect";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/lib/ui/__shadcn__/card";
import { Button } from "@/lib/ui/__shadcn__/button";

const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

export default function SessionGuard() {
  const [expired, setExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session on mount
    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   if (!session) setExpired(true);
    // });

    // Subscribe to real-time auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setExpired(true);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const handleLoginRedirect = () => {
    navigate(`/admin-${admin_route_hash}/login`);
  };

  if (!expired) return null;

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
