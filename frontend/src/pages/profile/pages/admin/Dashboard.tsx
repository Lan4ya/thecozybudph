import { Link, Outlet, redirect, useLocation } from "react-router";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import { DashboardSliderLinks } from "./components/DashboardSliderLinks";

export const AdminLoader = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw redirect("/auth/login");

  const isAdmin = user.app_metadata?.role === "admin";

  if (!isAdmin) throw redirect("/", { status: 403 });

  return null;
};

export default function AdminDashboard() {
  const location = useLocation();

  const routeTitles: Record<string, string> = {
    "/profile/admin/products": "Products",
    "/profile/admin/orders": "Orders",
    "/profile/admin/analytics": "Analytics",
    "/profile/admin/events": "Events",
    "/profile/admin/users": "Users",
  };

  const title = routeTitles[location.pathname] ?? "";

  return (
    <div className="pb-6">
      {/* <AdminDashboardNavbar /> */}

      {/* <h1 className="custom-container flex items-center gap-3 pb-12 text-lg md:text-xl lg:text-2xl font-medium"> */}
      {/*   <Link to="/profile"> */}
      {/*     <ArrowLeft /> */}
      {/*   </Link> */}
      {/*   {title} */}
      {/* </h1> */}

      <DashboardSliderLinks />

      <main className="flex-1 custom-container">
        <Outlet />
      </main>
    </div>
  );
}
