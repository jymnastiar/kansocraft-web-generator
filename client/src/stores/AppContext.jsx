import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import debounce from "lodash-debounce";
import API from "../API/API"; // Pastikan path import API sesuai dengan folder Anda

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  // Auth States
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Projects States
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeProject, setActiveProject] = useState(null);
  const [loadingActiveProject, setLoadingActiveProject] = useState(true);
  const [generatingProject, setGeneratingProject] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Editor States
  const [activeFile, setActiveFile] = useState("/app.js");
  const [showCode, setShowCode] = useState(false);

  // --- AUTH ACTIONS ---
  const checkSession = async () => {
    try {
      const { data } = await API.get("/api/auth/me");
      setUser(data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await API.post("/api/auth/login", { email, password });
      setUser(data.user);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      console.error("Login failed", error);
      const errorMessage =
        error.response?.data?.error || "Invalid email or password";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await API.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setUser(data.user);
      toast.success("Account created successfully");
      navigate("/");
    } catch (error) {
      console.error("Registration failed", error);
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await API.post("/api/auth/logout");
      setUser(null);
      setProjects([]);
      setActiveProject(null);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  // --- PROJECT ACTIONS ---
  const loadProjects = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await API.get("/api/projects");
      setProjects(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load project list");
    } finally {
      setLoadingProjects(false);
    }
  }, [user]);

  const loadProject = useCallback(
    async (id, silent = false) => {
      if (!user) return;
      if (!silent) setLoadingActiveProject(true);
      try {
        const { data } = await API.get(`/api/projects/${id}`);
        setActiveProject(data);
        const files = Object.keys(data.files || {});
        if (files.length > 0) {
          setActiveFile((prev) => {
            if (files.includes(prev)) return prev;
            if (files.includes("/app.js")) return "/app.js";
            return files[0];
          });
        }
      } catch (error) {
        console.error(error);
        if (!silent) {
          toast.error("Failed to load project");
          navigate("/");
        }
      } finally {
        if (!silent) setLoadingActiveProject(false);
      }
    },
    [navigate, user],
  );

  const handleGenerate = useCallback(
    async (prompt) => {
      if (!user) return;
      setGeneratingProject(true);
      try {
        const { data } = await API.post("/api/projects", { prompt });
        toast.success("AI agent is planning a structure");
        navigate(`/builder/${data._id}`);
      } catch (error) {
        console.error(error);
        toast.error("Failed to generate project");
      } finally {
        setGeneratingProject(false);
      }
    },
    [navigate, user],
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await API.delete(`/api/projects/${id}`);
        setProjects((prev) => prev.filter((p) => p._id !== id));
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete project");
      }
    },
    [user],
  );

  const handleChat = useCallback(
    async (prompt) => {
      if (!activeProject || !user) return;
      setChatLoading(true);
      try {
        const { data } = await API.post(
          `/api/projects/${activeProject._id}/chat`,
          { prompt },
        );
        setActiveProject(data);
        if (data.errors && data.errors.length > 0) {
          toast.error(data.errors[0]);
        } else {
          toast.success("Updated to version " + data.version);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to process chat request");
      } finally {
        setChatLoading(false);
      }
    },
    [activeProject, user],
  );

  // --- AUTO-SAVE DEBOUNCE ACTIONS ---
  const debounceSave = useMemo(() => {
    return debounce(async (files, id) => {
      try {
        await API.put(`/api/projects/${id}/files`, { files });
      } catch (error) {
        console.error(error);
        toast.error("Failed to auto-save files");
      }
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      // Membersihkan debounce jika komponen di-unmount
      // (Berdasarkan revisi CodeRabbit, .flush() direkomendasikan daripada .cancel() agar data terakhir tersimpan)
      debounceSave.flush();
    };
  }, [debounceSave]);

  const updateProjectFiles = useCallback(
    (files) => {
      if (!activeProject || !user) return;
      debounceSave(files, activeProject._id);
    },
    [activeProject, user, debounceSave],
  );

  // --- AUTOMATICALLY POLL ONGOING PROJECT STATUS ---
  useEffect(() => {
    if (!activeProject?._id || !user) return;
    const isOngoing =
      activeProject.status === "generating" ||
      activeProject.status === "pending" ||
      activeProject.status === "revising";

    if (isOngoing) {
      setChatLoading(true);
      const interval = setInterval(() => {
        loadProject(activeProject._id, true);
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setChatLoading(false);
    }
  }, [activeProject?._id, activeProject?.status, loadProject, user]);

  return (
    <AppContext.Provider
      value={{
        // Auth
        user,
        loadingUser,
        login,
        register,
        logout,

        // Projects Data
        projects,
        loadingProjects,
        activeProject,
        loadingActiveProject,
        generatingProject,
        chatLoading,

        // Editor Data
        activeFile,
        showCode,
        setActiveFile,
        setShowCode,

        // Project Methods
        loadProjects,
        loadProject,
        handleGenerate,
        handleDelete,
        handleChat,
        updateProjectFiles,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Custom Hook untuk memanggil Context dengan mudah
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}
