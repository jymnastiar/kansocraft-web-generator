import { supabase } from "@/lib/supabaseClient";
import type { Store } from "@/types/store";
import { type User } from "@supabase/supabase-js";
import { type StateCreator } from "zustand";

interface AuthState {
  user: User | null;
  authLoading: boolean;
  isCheckingSession: boolean;
}

interface AuthAction {
  checkSession: () => Promise<void>;
  registerWithEmail: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logoutSession: () => Promise<void>;
}

export type AuthSlice = AuthState & AuthAction;

export const createAuthSlice: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  authLoading: false,
  isCheckingSession: true,
  checkSession: async () => {
    set((state) => {
      state.isCheckingSession = true;
    });
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) throw error;

      set((state) => {
        state.user = user;
      });
    } catch (err: any) {
      set((state) => {
        state.user = null;
      });
    } finally {
      set((state) => {
        state.isCheckingSession = false;
      });
    }
  },

  registerWithEmail: async (fullName, email, password) => {
    set((state) => {
      state.authLoading = true;
    });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
          },
        },
      });
      if (error) {
        throw error;
      }
      set((state) => {
        state.user = data.user;
      });
    } catch (err: any) {
      set((state) => {
        state.user = null;
      });
      throw err;
    } finally {
      set((state) => {
        state.authLoading = false;
      });
    }
  },

  loginWithEmail: async (email, password) => {
    set((state) => {
      state.authLoading = true;
    });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set((state) => {
        state.user = data.user;
      });
    } catch (err: any) {
      set((state) => {
        state.user = null;
      });
      throw err;
    } finally {
      set((state) => {
        state.authLoading = false;
      });
    }
  },

  logoutSession: async () => {
    set((state) => {
      state.authLoading = true;
    });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set((state) => {
        state.user = null;
        state.projects = [];
      });
    } catch (err: any) {
      throw err;
    } finally {
      set((state) => {
        state.authLoading = false;
      });
    }
  },
});
