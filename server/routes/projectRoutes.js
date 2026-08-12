import { Router } from "express";
import {
  createProject,
  deleteProjects,
  getProjects,
  getPublicProjects,
  listProjects,
  publishProjects,
  updateProjectsFiles,
} from "../controllers/projectController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const projectRouter = Router();

// Public Route
projectRouter.get(`/public/:id/`, getPublicProjects);

// Protect all following routes
projectRouter.use(authMiddleware);
projectRouter.post(`/`, createProject);
projectRouter.get(`/`, listProjects);
projectRouter.get(`/:id`, getProjects);
projectRouter.delete(`/:id`, deleteProjects);
projectRouter.put(`/:id/files`, updateProjectsFiles);
projectRouter.post(`/:id/publish`, publishProjects);

export default projectRouter;
