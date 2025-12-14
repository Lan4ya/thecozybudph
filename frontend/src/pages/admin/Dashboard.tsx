import { Outlet, redirect } from "react-router";
import AdminDashboardNavbar from "./components/DashboardNavBar";
import { supabase } from "@/lib/supabase/client";
import SessionGuard from "@/components/SessionGuard";
import {
  getCachedIsAdminCheck,
  setCachedIsAdminCheck,
} from "./utils/isAdminCheckCache";
const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

export const loader = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return redirect(`/admin-${admin_route_hash}/login`);

  // Check cache first
  const cachedAdmin = getCachedIsAdminCheck(session.user.id);
  if (cachedAdmin !== null) {
    if (!cachedAdmin) return redirect("/", { status: 401 });
    return { session, admin: cachedAdmin };
  }

  // Fresh check
  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) throw new Response(`${error.message}`, { status: 500 });

  // Update cache
  setCachedIsAdminCheck(session.user.id, admin);

  if (!admin) return redirect("/", { status: 401 });
  return { session, admin };
};

export default function AdminDashboard() {
  return (
    <>
      <SessionGuard />

      <div className="pt-12 lg:pt-16 flex min-h-screen">
        <AdminDashboardNavbar />
        <main className="flex-1 custom-container">
          <Outlet />
        </main>
      </div>
    </>
  );
}
