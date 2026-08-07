import api, { type User } from "@/api/api";
import { type StateCreator } from "zustand";

interface AuthState {
  user: User | null;
  authLoading: boolean;
}

interface AuthAction {
  checkSession: () => Promise<void>;
}

export type AuthSlice = AuthState & AuthAction;

export const createAuthSlice: StateCreator<
  AuthSlice,
  [["zustand/immer", never]],
  [],
  AuthSlice
> = (set) => ({
  user: null,
  authLoading: true,
  checkSession: async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      set((state) => {
        state.user = data.user;
      });
    } catch (err: any) {
      set((state) => {
        state.user = null;
      });
      throw new Error(err);
    } finally {
      set((state) => {
        state.authLoading = false;
      });
    }
  },
});
