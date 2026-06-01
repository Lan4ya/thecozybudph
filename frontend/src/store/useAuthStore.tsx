import { create } from "zustand";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated"
  | "expired";

export type AuthState = {
  status: AuthStatus;
  session: Session | null;
  event: AuthChangeEvent | null;
  userName: string | null;
  setSession: (
    session: Session | null,
    status: AuthStatus,
    event?: AuthChangeEvent | null,
  ) => void;
};

// useInitAuthStore hook will populate the states in this store accordingly once initialized in Root.tsx.
// This store can be used then throughout the app as the single source of truth for auth session and user role

// See: ../hooks/useInitAuthStore.ts
export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  session: null,
  event: null,
  userName: null,

  setSession: (session, status, event = null) => {
    const userName =
      session?.user?.user_metadata?.display_name ??
      session?.user?.email?.split("@")[0] ??
      null;

    set({
      session,
      event,
      userName,
      status,
    });
  },
}));
