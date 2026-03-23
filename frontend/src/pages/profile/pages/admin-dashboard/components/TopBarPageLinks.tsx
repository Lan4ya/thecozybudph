import { cn } from "@/lib/utils/cn";
import { NavLink } from "react-router";

export const TopBarPageLinks = () => {
  return (
    <div className="m-auto text-sm lg:text-base flex justify-evenly items-center gap-3 border px-2 py-2 mb-8  lg:justify-start lg:gap-6 lg:pl-8">
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
    </div>
  );
};
