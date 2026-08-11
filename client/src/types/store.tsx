import type { AuthSlice } from "@/stores/auth-slice";
import type { BuilderSlice } from "@/stores/builder-slice";
import type { PublishSlice } from "@/stores/publish-slice";
import type { ProjectSlice } from "@/stores/project-slice";

export type Store = AuthSlice & ProjectSlice & BuilderSlice & PublishSlice;
