import type { AuthSlice } from "@/stores/auth-slice";
import type { BuilderSlice } from "@/stores/builder-slice";
import type { ProjectSlice } from "@/stores/project-slice";

export type Store = AuthSlice & ProjectSlice & BuilderSlice;
