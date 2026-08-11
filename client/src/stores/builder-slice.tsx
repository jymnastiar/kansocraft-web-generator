import api from "@/api/api";
import type { Store } from "@/types/store";
import type { StateCreator } from "zustand";
import debounce from "lodash.debounce";
import { toast } from "@/components/ui/toast";

export type BuilderTab = "chat" | "files";

interface BuilderState {
  activeFile: string;
  chatLoading: boolean;
  savingFiles: boolean;
  showCode: boolean;
  activeTab: BuilderTab;
  sidebarWidth: number;
  editorSplitWidth: number;
  showErrorOverlay: boolean;
}

interface BuilderAction {
  updateProjectFiles: (files: any) => void;
  userChat: (prompt: string) => Promise<any>;
  setChatLoading: (logic: boolean) => void;
  setActiveFile: (file: string) => void;
  setShowCode: (show: boolean | ((prev: boolean) => boolean)) => void;
  setActiveTab: (tab: BuilderTab) => void;
  setSidebarWidth: (width: number) => void;
  setEditorSplitWidth: (width: number) => void;
  setShowErrorOverlay: (show: boolean | ((prev: boolean) => boolean)) => void;
  flushProjectFiles: () => Promise<void>;
}

export type BuilderSlice = BuilderAction & BuilderState;

export const debouncedSaveAPI = debounce(
  async (
    files: any,
    projectId: string,
    onComplete?: () => void,
  ) => {
    try {
      await api.put(`/api/projects/${projectId}/files`, { files });
    } catch (err: any) {
      toast.add({
        title: "Auto-save Failed",
        description: "Failed to auto-save files. Please check your connection.",
        type: "error",
      });
      console.error("Auto-save error:", err);
    } finally {
      onComplete?.();
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
  savingFiles: false,
  showCode: false,
  activeTab: "chat",
  sidebarWidth: 320,
  editorSplitWidth: 50,
  showErrorOverlay: true,

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

  setShowCode: (show) => {
    set((state) => {
      state.showCode = typeof show === "function" ? show(state.showCode) : show;
    });
  },

  setActiveTab: (tab) => {
    set((state) => {
      state.activeTab = tab;
    });
  },

  setSidebarWidth: (width) => {
    set((state) => {
      state.sidebarWidth = width;
    });
  },

  setEditorSplitWidth: (width) => {
    set((state) => {
      state.editorSplitWidth = width;
    });
  },

  setShowErrorOverlay: (show) => {
    set((state) => {
      state.showErrorOverlay =
        typeof show === "function" ? show(state.showErrorOverlay) : show;
    });
  },

  updateProjectFiles: (files) => {
    const { activeProject, user } = get();
    if (!activeProject || !user?.id) return;
    set((state) => {
      if (state.activeProject) {
        state.activeProject.files = {
          ...state.activeProject.files,
          ...files,
        };
      }
      state.savingFiles = true;
    });
    debouncedSaveAPI(files, activeProject._id, () => {
      set((state) => {
        state.savingFiles = false;
      });
    });
  },

  flushProjectFiles: async () => {
    await debouncedSaveAPI.flush();
    set((state) => {
      state.savingFiles = false;
    });
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
