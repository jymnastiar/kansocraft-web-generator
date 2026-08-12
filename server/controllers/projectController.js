import { Project } from "../models/project.js";
import crypto from "crypto";

function hashContent(content) {
  return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
}

// POST /api/projects
// Create a new project from an AI prompt.

export async function createProject(req, res) {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const project = await Project.create({
    name: "Planning project...",
    description: prompt,
    files: {},
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: "Planning project structure" },
    ],
    version: 0,
    owner: req.user.userId,
    status: "pending",
    filesPlanned: [],
    filesGenerated: [],
    currentFile: null,
    error: null,
  });

  runBackgroundGeneration(project._id.toString(), prompt).catch((err) => {
    console.error(
      `[Background AI] Fatal generation error for project ${project._id}:`,
      err,
    );
  });

  res.status(201).json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: {},
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
  });
}

// Background worker to progressive generate files and update database in real-time
export async function runBackgroundGeneration(projectId, prompt) {}

// GET /api/projects
// List all projects owned by the user (summary only, no file contents)
export async function listProjects(req, res) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const projects = await Project.find(
    { owner: req.user.userId },
    { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
  ).sort({ updatedAt: -1 });

  res.json(projects);
}

// GET /api/projects/:id
// Get complete project detail
export async function getProjects(req, res) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  // result of filesObj
  // {
  //   "index.html": "<h1>Halo</h1>",
  //   "src/main.js": "console.log('ok')"
  // }
  const filesObj = {};
  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }
  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    messages: project.messages,
    version: project.version,
    status: project.status,
    filesPlanned: project.filesPlanned,
    filesGenerated: project.filesGenerated,
    currentFile: project.currentFile,
    error: project.error,
    createdAt: project.createdAt,
    updateAt: project.updatedAt,
  });
}

// DELETE /api/projects/:id
// Delete a project
export async function deleteProjects(req, res) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const result = await Project.findOneAndDelete({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!result) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ success: true });
}

// PUT /api/projects/:id/files
// update project files (manual edits).
export async function updateProjectsFiles(req, res) {
  const { files } = req.body;
  if (!files || typeof files !== "object") {
    res.status(400).json({ error: "files object is required" });
  }

  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const project = await Project.findOne({
    _id: req.params.id,
    owner: req.user.userId,
  });

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  // Rebuild project files map with content & hashes
  const newFiles = {};
  for (const [path, content] of Object.entries(files)) {
    if (typeof content === "string") {
      newFiles[path] = { content, hash: hashContent(content) };
    }
  }

  project.files = newFiles;
  await project.save();

  const filesObj = {};
  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }

  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    messages: project.messages,
    version: project.version,
    createdAt: project.createdAt,
    updateAt: project.updatedAt,
  });
}

// POST /api/projects/:id/publish
// Mark a project as pubicly published
export async function publishProjects(req, res) {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const project = await Project.findOneAndUpdate(
    {
      _id: req.params.id,
      owner: req.user.userId,
    },
    { published: true },
    { returnDocument: "after" },
  );

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({ success: true, published: project.published });
}

// GET /api/projects/public/:id/
// Get a publicly published project details (without auth)
export async function getPublicProjects(req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  if (!project.published) {
    res.status(403).json({ error: "Project is not published yet" });
    return;
  }

  const filesObj = {};
  for (const [path, entry] of Object.entries(project.files)) {
    filesObj[path] = entry.content;
  }

  res.json({
    _id: project._id,
    name: project.name,
    description: project.description,
    files: filesObj,
    version: project.version,
  });
}
