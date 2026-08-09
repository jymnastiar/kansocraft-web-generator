import type { Project } from "@/api/api";
import api, { initialProjects } from "../api/api";
import { type StateCreator } from "zustand";
import type { Store } from "@/types/store";

interface ProjectState {
  projects: Project[];
  loadingProjects: boolean;
  generatingProject: boolean;
}

interface ProjectAction {
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

  loadProjects: async () => {
    if (!get().user) {
      set((state) => {
        state.loadingProjects = false;
      });
      return;
    }
    try {
      const { data } = await api.get("/api/projects");
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
    set((state) => {
      state.generatingProject = true;
    });
    try {
      const { data } = await api.post("/api/projects", { prompt });
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
