import { Outlet } from "react-router";
import { TopBarPageLinks } from "./components/TopBarPageLinks";

const AdminDashboard = () => {
  return (
    <div className="pb-6">
      <TopBarPageLinks />

      <main className="flex-1 custom-container">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
