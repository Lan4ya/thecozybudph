import { Outlet } from "react-router";
import { AdminSidebar } from "./components/AdminSidebar";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen lg:flex">
      <AdminSidebar />
      <main className="flex-1 custom-container py-6 lg:py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
