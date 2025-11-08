import { Outlet, redirect } from "react-router";
import AdminDashboardNavbar from "./DashboardNavBar";
import { supabase } from "@/lib/supabase/connect";
import { PageSpinner } from "@/lib/ui/__shadcn__/spinner";
import SessionGuard from "@/components/SessionGuard";

export const loader = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // No session -> redirect or throw 401
    // return redirect(`/admin-${admin_route_hash}/login`, { status: 401 });
    // throw new Response(`Unauthorized`, { status: 401 });

    <SessionGuard />;
    return;
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
  // const isAdmin = useLoaderData();
  // const navigate = useNavigate();
  // if (!isAdmin) navigate("/", { replace: true });
  // console.log("isAdmin:", isAdmin);

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
