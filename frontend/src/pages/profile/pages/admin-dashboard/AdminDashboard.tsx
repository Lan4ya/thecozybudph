import { Outlet } from "react-router";
import { AdminSidebar } from "./components/AdminSidebar";
import AdminMobileHeader from "./components/AdminMobileHeader";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminMobileHeader />
      <div className="flex-1 lg:flex">
        <AdminSidebar />
        <main className="flex-1 pt-6 lg:pt-0">
          <div className="max-w-[1600px] mx-auto w-full custom-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
