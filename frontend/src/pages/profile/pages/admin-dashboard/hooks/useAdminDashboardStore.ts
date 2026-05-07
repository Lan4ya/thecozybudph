import { create } from "zustand";

type AdminDashboardState = {
  isSidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;

  reset: () => void;
};

export const useAdminDashboardStore = create<AdminDashboardState>(
  (set, get) => ({
    isSidebarOpen: false,

    reset: () => null,

    setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  }),
);
