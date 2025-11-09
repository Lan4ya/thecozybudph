import { Outlet, redirect } from "react-router";
import AdminDashboardNavbar from "./DashboardNavBar";
import { supabase } from "@/lib/supabase/connect";
import { PageSpinner } from "@/lib/ui/__shadcn__/spinner";
import SessionGuard from "@/components/SessionGuard";
import { getCachedAdmin, setCachedAdmin } from "./utils/adminCache";
const admin_route_hash = import.meta.env.VITE_ADMIN_ROUTE_HASH!;

export const loader = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return redirect(`/admin-${admin_route_hash}/login`);

  // Check cache first
  const cachedAdmin = getCachedAdmin(session.user.id);
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
  setCachedAdmin(session.user.id, admin);

  if (!admin) return redirect("/", { status: 401 });
  return { session, admin };
};

export default function AdminDashboard() {
  return (
    <>
      <SessionGuard />

      <div className="pt-12 lg:pt-16 flex min-h-screen">
        <AdminDashboardNavbar />
        <main className="container flex-1">
          <Outlet />
        </main>
      </div>
    </>
  );
}

export const AdminDashboardFallbackSpinner = () => (
  <div className="h-screen flex-center">
    <PageSpinner />
  </div>
);
