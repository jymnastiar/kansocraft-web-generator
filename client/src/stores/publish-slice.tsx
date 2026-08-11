import type { Project } from "@/api/api";
import api from "@/api/api";
import type { Store } from "@/types/store";
import type { StateCreator } from "zustand";

interface PublishState {
  publishedProject: Project | null;
  publishLoading: boolean;
  publishError: string;
}

interface PublishAction {
  fetchPublishedProject: (id: string) => Promise<void>;
}

export type PublishSlice = PublishAction & PublishState;

export const createPublishSlice: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  PublishSlice
> = (set) => ({
  publishedProject: null,
  publishLoading: true,
  publishError: "",
  fetchPublishedProject: async (id: string) => {
    set((state) => {
      state.publishLoading = true;
      state.publishError = "";
      state.publishedProject = null;
    });
    try {
      const { data } = await api.get<Project>(`/api/projects/public/${id}`);
      set((state) => {
        state.publishedProject = data;
      });
    } catch (err: any) {
      set((state) => {
        state.publishError =
          err?.response?.data?.error ||
          "This website is not available or is not published yet";
      });
    } finally {
      set((state) => {
        state.publishLoading = false;
      });
    }
  },
});
