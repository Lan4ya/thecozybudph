import { Outlet } from "react-router";
import { AdminSidebar } from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      <div className="flex-1 lg:flex">
        <AdminSidebar />
        <main className="flex-1 custom-container pt-6 lg:pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
