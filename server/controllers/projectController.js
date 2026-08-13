import mongoose from "mongoose";
import { Project } from "../models/project.js";
import { generateProject } from "../services/ai.js";
import { hashContent } from "../services/diff.js";

// POST /api/projects
// Create a new project from an AI prompt.

export async function createProject(req, res, next) {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "prompt is required" });
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
  } catch (err) {
    next(err);
  }
}

// Background worker to progressive generate files and update database in real-time
async function runBackgroundGeneration(projectId, prompt) {
  try {
    console.log(`[Background AI] Starting generation for project ${projectId}`);

    const result = await generateProject(prompt, {
      onPlan: async (plan) => {
        console.log(
          `[Background AI Plan created for project ${projectId}. Planned ${plan.files.length} files.]`,
        );
        const filesList = plan.files
          .map((f) => `- \`${f.path}\`: ${f.description}`)
          .join("\n");

        await Project.findByIdAndUpdate(projectId, {
          name: plan.projectName || "Generated Project",
          status: "generating",
          filesPlanned: plan.files,
          $push: {
            messages: {
              role: "assistant",
              content: `Planned website structure:\n${filesList}`,
              timestamp: new Date(),
            },
          },
        });
      },
      onFileStart: async (path) => {
        console.log(
          `[Background AI] starting file ${path} for project ${projectId}`,
        );

        await Project.findByIdAndUpdate(projectId, {
          currentFile: path,
        });
      },
      onFileComplete: async (path, code) => {
        console.log(
          `[Background AI] Finished file ${path} for project ${projectId}`,
        );

        const project = await Project.findById(projectId);

        if (project) {
          project.files = project.files || {};
          project.files[path] = { content: code, hash: hashContent(code) };
          project.filesGenerated = [...(project.filesGenerated || []), path];
          project.messages.push({
            role: "assistant",
            content: `Create files "${path}"`,
            timestamp: new Date(),
          });
          project.currentFile = null;
          project.markModified("files");
          await project.save();
        }
      },
    });

    console.log(`[Background AI] Successfully generated project ${projectId}`);
    const project = await Project.findById(projectId);
    if (project) {
      project.status = "completed";
      project.version = 1;
      if (result.description) {
        project.description = result.description;
      }
      project.messages.push({
        role: "assistant",
        content: `Website generation complete! You can view and edit the files.`,
        timestamp: new Date(),
      });
      await project.save();
    }
  } catch (error) {
    console.error(
      `[Background AI] Fatal generation error for project ${projectId}:`,
      error,
    );
    await Project.findByIdAndUpdate(projectId, {
      status: "failed",
      error: error.message,
      $push: {
        messages: {
          role: "assistant",
          content: `❌ Generation failed: ${error.messages}`,
          timestamp: new Date(),
        },
      },
    });
  }
}

// GET /api/projects
// List all projects owned by the user (summary only, no file contents)
export async function listProjects(req, res, next) {
  try {
    const projects = await Project.find(
      { owner: req.user.userId },
      { name: 1, description: 1, version: 1, createdAt: 1, updatedAt: 1 },
    ).sort({ updatedAt: -1 });

    res.json(projects);
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/:id
// Get complete project detail
export async function getProjects(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ error: "Invalid project ID format" });
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
      updatedAt: project.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/projects/:id
// Delete a project
export async function deleteProjects(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ error: "Invalid project ID format" });
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
  } catch (err) {
    next(err);
  }
}

// PUT /api/projects/:id/files
// update project files (manual edits).
export async function updateProjectsFiles(req, res, next) {
  try {
    const { files } = req.body;
    if (!files || typeof files !== "object") {
      res.status(400).json({ error: "files object is required" });
      return;
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ error: "Invalid project ID format" });
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
      updatedAt: project.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/projects/:id/publish
// Mark a project as publicly published
export async function publishProjects(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ error: "Invalid project ID format" });
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
  } catch (err) {
    next(err);
  }
}

// GET /api/projects/public/:id/
// Get a publicly published project details (without auth)
// M-05 WARNING: Seluruh konten file project di-expose ke publik.
// Pastikan user tidak menyimpan credential/API key di dalam file project mereka.
export async function getPublicProjects(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ error: "Invalid project ID format" });
      return;
    }

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
  } catch (err) {
    next(err);
  }
}
