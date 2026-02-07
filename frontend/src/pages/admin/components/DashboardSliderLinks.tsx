import { cn } from "@/lib/utils/cn";
import { NavLink } from "react-router";

export const DashboardSliderLinks = () => {
  return (
    <div className="custom-container">
      <div className="flex justify-evenly items-center max-w-[600px] gap-3 rounded-lg border px-2 py-2 mb-3">
        <NavLink
          className={({ isActive }) =>
            cn(isActive && "text-primary font-semibold")
          }
          to="/profile/admin/products"
        >
          products
        </NavLink>
        <div className="h-4 w-[2px] bg-black/15"></div>
        <NavLink
          className={({ isActive }) =>
            cn(isActive && "text-primary font-semibold")
          }
          to="/profile/admin/orders"
        >
          orders
        </NavLink>
        <div className="h-4 w-[2px] bg-black/15"></div>
        <NavLink
          className={({ isActive }) =>
            cn(isActive && "text-primary font-semibold")
          }
          to="/profile/admin/analytics"
        >
          analytics
        </NavLink>
        <div className="h-4 w-[2px] bg-black/15"></div>
        <NavLink
          className={({ isActive }) =>
            cn(isActive && "text-primary font-semibold")
          }
          to="/profile/admin/events"
        >
          events
        </NavLink>
        <div className="h-4 w-[2px] bg-black/15"></div>
        <NavLink
          className={({ isActive }) =>
            cn(isActive && "text-primary font-semibold")
          }
          to="/profile/admin/users"
        >
          users
        </NavLink>
      </div>
    </div>
  );
};
