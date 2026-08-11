import type { Project } from "@/api/api";
import api, { initialProjects } from "../api/api";
import axios from "axios";
import { type StateCreator } from "zustand";
import type { Store } from "@/types/store";

interface ProjectState {
  projects: Project[];
  loadingProjects: boolean;
  generatingProject: boolean;
  activeProject: Project | null;
  loadingActiveProject: boolean;
}

interface ProjectAction {
  loadProject: (
    id: string,
    silent?: boolean,
    signal?: AbortSignal,
  ) => Promise<void>;
  loadProjects: () => Promise<void>;
  generateProject: (prompt: string) => Promise<Project | undefined>;
  deleteProject: (id: string) => Promise<void>;
}

export type ProjectSlice = ProjectAction & ProjectState;

export const createProjectSlice: StateCreator<
  Store,
  [["zustand/immer", never]],
  [],
  ProjectSlice
> = (set, get) => ({
  projects: initialProjects,
  loadingProjects: true,
  generatingProject: false,
  activeProject: null,
  loadingActiveProject: true,

  loadProject: async (id, silent = false, signal) => {
    const userId = get().user?.id;
    if (!userId) return;
    if (!silent) {
      set((state) => {
        state.loadingActiveProject = true;
        state.activeProject = null;
      });
    }
    try {
      const { data } = await api.get<Project>(`/api/projects/${id}`, {
        signal,
      });
      if (signal?.aborted) return;
      set((state) => {
        state.activeProject = data;
      });
      const files = Object.keys(data.files || {});
      if (files.length > 0) {
        set((state) => {
          if (files.includes(state.activeFile)) {
            return;
          }
          if (files.includes("/app.js")) {
            state.activeFile = "/app.js";
            return;
          }
          state.activeFile = files[0];
        });
      }
    } catch (err: any) {
      if (
        axios.isCancel(err) ||
        err?.name === "CanceledError" ||
        err?.name === "AbortError"
      ) {
        return;
      }
      set((state) => {
        state.activeProject = null;
      });
      if (!silent) {
        throw err;
      }
    } finally {
      if (!silent) {
        set((state) => {
          state.loadingActiveProject = false;
        });
      }
    }
  },

  loadProjects: async () => {
    const userId = get().user?.id;
    if (!userId) {
      set((state) => {
        state.loadingProjects = false;
      });
      return;
    }
    try {
      const { data } = await api.get<Project[]>("/api/projects");
      set((state) => {
        state.projects = data;
      });
    } catch (err: any) {
      throw err;
    } finally {
      set((state) => {
        state.loadingProjects = false;
      });
    }
  },

  generateProject: async (prompt) => {
    const userId = get().user?.id;
    if (!userId) return;
    set((state) => {
      state.generatingProject = true;
    });
    try {
      const { data } = await api.post<Project>("/api/projects", { prompt });
      return data;
    } catch (err: any) {
      throw err;
    } finally {
      set((state) => {
        state.generatingProject = false;
      });
    }
  },

  deleteProject: async (id) => {
    if (!get().user) return;
    try {
      await api.delete(`/api/projects/${id}`);
      set((state) => {
        state.projects = state.projects.filter((project) => project._id !== id);
      });
    } catch (err: any) {
      throw err;
    }
  },
});
