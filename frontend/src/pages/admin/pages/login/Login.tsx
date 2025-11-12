import { useState } from "react";
import { supabase } from "@/lib/supabase/connect";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/lib/ui/__shadcn__/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/ui/__shadcn__/card";
import { Input } from "@/lib/ui/__shadcn__/input";
import { useNavigate } from "react-router";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";
import {
  getCachedIsAdminCheck,
  setCachedIsAdminCheck,
} from "../../utils/isAdminCheckCache";
const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

const AdminLogin = () => {
  const [email, setEmail] = useState("thecozybud@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { data: sessionData, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error || !sessionData?.user)
        throw error || new Error("Invalid credentials");

      const user = sessionData.user;

      // Check if admin (with cache)
      const cachedAdmin = getCachedIsAdminCheck(user.id);
      let isAdmin = false;

      if (cachedAdmin !== null) {
        isAdmin = cachedAdmin;
      } else {
        // Fresh check
        const { data: admin, error: adminErr } = await supabase
          .from("admins")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (adminErr) throw adminErr;
        isAdmin = !!admin;
        setCachedIsAdminCheck(user.id, isAdmin);
      }

      // Navigate if admin, show error if not
      if (isAdmin) {
        navigate(`/admin-${admin_route_hash}/dashboard`, { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setErrorMsg(err.message || "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-lg border-border/50 backdrop-blur-sm bg-card/70">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-semibold text-foreground">
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-popover border-border/60"
                />
              </div>
              <div>
                <label className="block text-sm mb-1 text-muted-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-popover border-border/60"
                />
              </div>

              {errorMsg && (
                <p className="text-sm text-destructive">{errorMsg}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-2 bg-primary text-primary-foreground hover:opacity-90"
                disabled={loading}
              >
                {loading ? <Spinner className="mr-2" /> : null}
                {loading ? "Signing in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
