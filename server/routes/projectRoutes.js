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
import { createProjectLimiter } from "../middleware/rateLimiter.js";
import { validateBody } from "../middleware/validateBody.js";
import {
  createProjectSchema,
  updateFilesSchema,
  chatSchema,
} from "../validation/projectSchemas.js";
import { chat } from "../controllers/chatController.js";

const projectRouter = Router();

// Public Route
projectRouter.get(`/public/:id/`, getPublicProjects);

// Protect all following routes
projectRouter.use(authMiddleware);
projectRouter.post(
  `/`,
  createProjectLimiter,
  validateBody(createProjectSchema),
  createProject,
);
projectRouter.get(`/`, listProjects);
projectRouter.get(`/:id`, getProjects);
projectRouter.delete(`/:id`, deleteProjects);
projectRouter.put(
  `/:id/files`,
  validateBody(updateFilesSchema),
  updateProjectsFiles,
);
projectRouter.post(`/:id/publish`, publishProjects);

// Chat router
projectRouter.post(`/:id/chat`, validateBody(chatSchema), chat);

export default projectRouter;
