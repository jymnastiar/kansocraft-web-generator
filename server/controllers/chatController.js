import mongoose from "mongoose";
import { Project } from "../models/project.js";
import { reviseProject } from "../services/ai.js";
import { applyOperations } from "../services/diff.js";

export function buildManifest(files) {
  const manifest = [];
  for (const [path, entry] of Object.entries(files)) {
    manifest.push({ path, hash: entry.hash, size: entry.content.length });
  }
  return manifest;
}

// POST /api/projects/:id/chat
// Send a revision prompt and return updated project.
export async function chat(req, res, next) {
  try {
    // Validate ObjectId before hitting the database
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }

    const { prompt } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    project.status = "revising";
    project.messages.push({
      role: "user",
      content: prompt,
      timestamp: new Date(),
    });
    await project.save();

    try {
      // Build compact manifest (path + hash + size) instead of sending all code
      const manifest = buildManifest(project.files);

      // Include all file contents so the AI can do accurate search/replace
      const relevantFiles = {};
      for (const [path, entry] of Object.entries(project.files)) {
        relevantFiles[path] = entry.content;
      }

      const recentMessages = project.messages.slice(-4).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      console.log(
        `[AI] Revising project ${project._id}: "${prompt.slice(0, 80)}..."` +
          `(${manifest.length} files, manifest ~${JSON.stringify(manifest).length} chars)`,
      );

      // Call AI with manifest + relevant files
      const result = await reviseProject(
        prompt,
        manifest,
        relevantFiles,
        recentMessages,
      );

      const operations = Array.isArray(result?.operations)
        ? result.operations
        : [];
      console.log(
        `[AI] Got ${operations.length} operations: ${result?.description}`,
      );

      const {
        files: updateFiles,
        applied,
        errors,
      } = applyOperations(project.files, operations);

      if (errors.length > 0) {
        console.warn(`[Diff] Errors applying operations:`, errors);
      }

      project.files = updateFiles;
      project.markModified("files");
      project.version += 1;
      project.status = "completed";
      project.messages.push({
        role: "assistant",
        content:
          result.description +
          (errors.length > 0
            ? `\n\n Some operations failed: ${errors.join(", ")}`
            : ""),
      });
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
        status: project.status,
        applied,
        errors,
        aiDescription: result.description,
      });
    } catch (error) {
      console.error(`[AI Revision error] ${error.message}`);
      project.status = "failed";
      await project.save();
      next(error);
    }
  } catch (err) {
    next(err);
  }
}
