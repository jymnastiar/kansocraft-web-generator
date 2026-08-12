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
import { createProjectLimiter } from "../server.js";
import { validateBody } from "../middleware/validateBody.js";
import { createProjectSchema, updateFilesSchema } from "../validation/projectSchemas.js";

const projectRouter = Router();

// Public Route
projectRouter.get(`/public/:id/`, getPublicProjects);

// Protect all following routes
projectRouter.use(authMiddleware);
projectRouter.post(`/`, createProjectLimiter, validateBody(createProjectSchema), createProject);
projectRouter.get(`/`, listProjects);
projectRouter.get(`/:id`, getProjects);
projectRouter.delete(`/:id`, deleteProjects);
projectRouter.put(`/:id/files`, validateBody(updateFilesSchema), updateProjectsFiles);
projectRouter.post(`/:id/publish`, publishProjects);

export default projectRouter;
