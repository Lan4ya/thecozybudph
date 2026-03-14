import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/lib/ui/__shadcn__/card";
import { Button } from "@/lib/ui/__shadcn__/button";
import { useAuthStore } from "@/store/useAuthStore";

export default function SessionGuard() {
  const session = useAuthStore((s) => s.session);
  const navigate = useNavigate();
  const location = useLocation();

  const protectedRoutes = ["/profile"];
  const isProtectedRoute = protectedRoutes.some((p) =>
    location.pathname.startsWith(p),
  );
  const showModal = !session && isProtectedRoute;

  const handleLoginRedirect = () => navigate("/auth/signup");

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
