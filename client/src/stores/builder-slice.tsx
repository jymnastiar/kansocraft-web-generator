import api from "@/api/api";
import type { Store } from "@/types/store";
import type { StateCreator } from "zustand";
import debounce from "lodash.debounce";
import { toast } from "@/components/ui/toast";

interface BuilderState {
  activeFile: string;
  chatLoading: boolean;
}

interface BuilderAction {
  updateProjectFiles: (files: any) => void;
  userChat: (prompt: string) => Promise<any>;
  setChatLoading: (logic: boolean) => void;
  setActiveFile: (file: string) => void;
  flushProjectFiles: () => void;
}

export type BuilderSlice = BuilderAction & BuilderState;

export const debouncedSaveAPI = debounce(
  async (files: any, projectId: string) => {
    try {
      await api.put(`/api/projects/${projectId}/files`, { files });
    } catch (err: any) {
      toast.add({
        title: "Auto-save Failed",
        description: "Failed to auto-save files. Please check your connection.",
        type: "error",
      });
      console.error("Auto-save error:", err);
    }
  },
  1000,
);

export const createBuilderSlice: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  BuilderSlice
> = (set, get) => ({
  activeFile: "/app.js",
  chatLoading: false,
  setChatLoading: (logic) => {
    set((state) => {
      state.chatLoading = logic;
    });
  },

  setActiveFile: (file) => {
    set((state) => {
      state.activeFile = file;
    });
  },

  updateProjectFiles: (files) => {
    const { activeProject, user } = get();
    if (!activeProject || !user?.id) return;
    debouncedSaveAPI(files, activeProject._id);
  },

  flushProjectFiles: () => {
    debouncedSaveAPI.flush();
  },

  userChat: async (prompt) => {
    const { activeProject, user } = get();
    if (!activeProject || !user?.id) return;
    set((state) => {
      state.chatLoading = true;
    });
    try {
      const { data } = await api.post<any>(
        `/api/projects/${activeProject._id}/chat`,
        {
          prompt,
        },
      );
      set((state) => {
        state.activeProject = data;
      });
      return data;
    } catch (err: any) {
      throw err;
    } finally {
      set((state) => {
        state.chatLoading = false;
      });
    }
  },
});
