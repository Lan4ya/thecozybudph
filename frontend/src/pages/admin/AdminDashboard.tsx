import { Outlet, redirect, useLoaderData, useNavigate } from "react-router";
import AdminDashboardSidebar from "./components/AdminDashboardSidebar";
import { supabase } from "@/lib/supabase/connectDB";
import { Spinner } from "@/lib/ui/__shadcn__/spinner";

export const loader = async () => {
  console.log("🔥 Admin loader running");

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // No session -> redirect or throw 401
    // return redirect(`/admin-${admin_route_hash}/login`, { status: 401 });
    throw new Response(`Unauthorized`, { status: 401 });
  }

  // Check if user is admin
  const { data: admin, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (error) {
    throw new Response(`${error.message}`, { status: 500 });
  }

  if (!admin) {
    return redirect("/", { status: 401 });
  }

  console.log("✅ Admin verified:", admin);
  return !!admin;
};

export default function AdminDashboard() {
  const isAdmin = useLoaderData();
  const navigate = useNavigate();
  if (!isAdmin) navigate("/", { replace: true });
  console.log("isAdmin:", isAdmin);

  return (
    <div className="flex min-h-screen">
      <AdminDashboardSidebar />

      <main className="flex-1 bg-background p-6">
        <Outlet />
      </main>
    </div>
  );
}

export const AdminDashboardFallback = () => (
  <div className="h-screen flex-center">
    <Spinner className="size-15 text-primary" />
  </div>
);
