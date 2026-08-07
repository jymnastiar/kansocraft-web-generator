import type { Store } from "@/types/store";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createAuthSlice } from "./auth-slice";

export const useStore = create<Store>()(
  immer((...a) => ({
    ...createAuthSlice(...a),
  })),
);
