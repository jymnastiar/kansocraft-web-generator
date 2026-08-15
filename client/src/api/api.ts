import axios from "axios";
import { supabase } from "@/lib/supabaseClient";

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system" | string;
  content: string;
  timestamp: string;
}

export interface PlannedFile {
  path: string;
  description?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  version: number;
  status: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  files: Record<string, string | { content?: string }>;
  filesPlanned?: PlannedFile[];
  filesGenerated?: string[];
  currentFile?: string;
  error?: string;
}

export interface ProjectSummary {
  _id: string;
  name: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
