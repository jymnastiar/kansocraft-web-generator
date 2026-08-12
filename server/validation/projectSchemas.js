import { z } from "zod";

export const createProjectSchema = z.object({
  prompt: z
    .string({ required_error: "prompt is required" })
    .min(1, "prompt cannot be empty")
    .max(2000, "prompt is too long (max 2000 characters)"),
});

export const updateFilesSchema = z.object({
  files: z
    .record(z.string(), z.string(), {
      required_error: "files object is required",
    })
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "files object cannot be empty",
    }),
});
