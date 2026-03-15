import { Outlet, useLocation } from "react-router";
import { DashboardSliderLinks } from "./components/SliderLinks";

const AdminDashboard = () => {
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
};

export default AdminDashboard;
