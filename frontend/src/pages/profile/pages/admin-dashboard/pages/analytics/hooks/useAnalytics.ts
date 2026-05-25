import { useQuery } from "@tanstack/react-query";
import { AdminAPI } from "@/api/admin";

export const useAnalytics = () => {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => AdminAPI.getAnalytics(),
  });
};
