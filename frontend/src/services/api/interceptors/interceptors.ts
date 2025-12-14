import axios from "axios";
import { supabase } from "../../../lib/supabase/client";
import isDev from "@/lib/utils/isDev";

const { VITE_SUPABASE_URL, DEV_VITE_SUPABASE_URL } = import.meta.env;
const SUPABASE_URL = isDev ? DEV_VITE_SUPABASE_URL : VITE_SUPABASE_URL;

// Create reusable instance
export const apiClient = axios.create({
  baseURL: `${SUPABASE_URL}/functions/v1`,
});

// Add auth header to all requests if token exists
apiClient.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token)
    config.headers.Authorization = `Bearer ${session.access_token}`;

  return config;
});
