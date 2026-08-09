import type { Store } from "@/types/store";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { createAuthSlice } from "./auth-slice";
import { createProjectSlice } from "./project-slice";

export const useStore = create<Store>()(
  immer((...a) => ({
    ...createAuthSlice(...a),
    ...createProjectSlice(...a),
  })),
);
