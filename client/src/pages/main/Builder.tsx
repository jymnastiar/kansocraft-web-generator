import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  Folder,
  MessageSquare,
  Eye,
  Code2,
  ExternalLink,
  Globe,
  Download,
  Smartphone,
  Tablet,
  Monitor,
  Info,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useStore } from "@/stores/store";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProjectFileTree from "@/components/ui/file-tree";
import PreviewPanel from "@/components/builder-page/PreviewPanel";
import AgentProgressDashboard from "@/components/builder-page/AgentProgressDashboard";
import PublishModal from "@/components/builder-page/PublishModal";
import Loading from "@/components/ui/loading";
import api from "@/api/api";
import { exportProjectZip } from "@/utils/exportProject";

const QUICK_COPILOT_PROMPTS = [
  "Add dark mode toggle support",
  "Make layout responsive for mobile",
  "Add smooth entrance animations",
  "Improve typography and spacing",
  "Add interactive contact form with toast",
];

export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  const [chatPrompt, setChatPrompt] = useState("");
  const [viewportMode, setViewportMode] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");
  const [mobileTab, setMobileTab] = useState<
    "preview" | "copilot" | "files" | "code"
  >("preview");

  const user = useStore((state) => state.user);
  const activeProject = useStore((state) => state.activeProject);
  const loadingActiveProject = useStore((state) => state.loadingActiveProject);
  const activeFile = useStore((state) => state.activeFile);
  const setActiveFile = useStore((state) => state.setActiveFile);
  const loadProject = useStore((state) => state.loadProject);
  const userChat = useStore((state) => state.userChat);
  const chatLoading = useStore((state) => state.chatLoading);
  const savingFiles = useStore((state) => state.savingFiles);
  const flushProjectFiles = useStore((state) => state.flushProjectFiles);
  const showCode = useStore((state) => state.showCode);
  const setShowCode = useStore((state) => state.setShowCode);
  const activeTab = useStore((state) => state.activeTab);
  const setActiveTab = useStore((state) => state.setActiveTab);
  const sidebarWidth = useStore((state) => state.sidebarWidth);
  const setSidebarWidth = useStore((state) => state.setSidebarWidth);

  const [isResizingSidebar, setIsResizingSidebar] = useState<boolean>(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  const startResizingSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingSidebar(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const maxWidth = Math.min(600, rect.width * 0.5);
      const clampedWidth = Math.min(Math.max(newWidth, 240), maxWidth);
      setSidebarWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
    };

    if (isResizingSidebar) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingSidebar]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeProject?.messages, chatLoading]);

  useEffect(() => {
    if (!activeProject?._id || !user) return;

    const isOngoing =
      activeProject.status === "generating" ||
      activeProject.status === "pending";

    if (isOngoing) {
      useStore.getState().setChatLoading(true);
      let controller: AbortController | null = null;

      const interval = setInterval(() => {
        if (controller) {
          controller.abort();
        }
        controller = new AbortController();
        loadProject(activeProject._id, true, controller.signal).catch(() => {});
      }, 2000);

      return () => {
        if (controller) {
          controller.abort();
        }
        clearInterval(interval);
      };
    } else {
      useStore.getState().setChatLoading(false);
    }
  }, [activeProject?._id, activeProject?.status, loadProject, user]);

  useEffect(() => {
    async function fetchProject() {
      if (id) {
        try {
          await loadProject(id);
        } catch (err) {
          toast.add({
            title: "Project Not Found",
            description: "Failed to load project data.",
            type: "error",
          });
          navigate("/");
        }
      }
    }

    fetchProject();
  }, [id, loadProject, navigate]);

  useEffect(() => {
    return () => {
      useStore.getState().flushProjectFiles();
    };
  }, []);

  async function handleChat(prompt: string) {
    try {
      const data = await userChat(prompt);
      if (data?.errors && data.errors.length > 0) {
        toast.add({
          title: "Validation Error",
          description: data.errors[0],
          type: "error",
        });
      } else {
        toast.add({
          title: "Revision applied!",
          description: `Updated project to version ${data?.version || "latest"}`,
          type: "success",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to process chat revision request";

      toast.add({
        title: "Revision Failed",
        description: errorMessage,
        type: "error",
      });
    }
  }

  const handleOpenPreview = () => {
    if (!id) return;
    window.open(`/preview/${id}`, "_blank");
  };

  const handlePublish = async () => {
    if (!id) return;
    setPublishing(true);
    try {
      await flushProjectFiles();
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`;
      setPublishUrl(url);
      toast.add({
        title: "Website Published",
        description: "Website deployed and ready for public access!",
        type: "success",
      });
    } catch (err: any) {
      toast.add({
        title: "Publish Failed",
        description: err?.response?.data?.error || "Publishing request failed",
        type: "error",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = async () => {
    if (!activeProject) return;
    setExporting(true);
    try {
      await flushProjectFiles();
      const currentProject = useStore.getState().activeProject || activeProject;
      await exportProjectZip(currentProject);
      toast.add({
        title: "Export Complete",
        description: "Project ZIP package downloaded successfully.",
        type: "success",
      });
    } catch (err: any) {
      toast.add({
        title: "Export Failed",
        description: err.message || "Failed to package project ZIP",
        type: "error",
      });
    } finally {
      setExporting(false);
    }
  };

  const onSendChat = async (e: React.FormEvent) => {
    e?.preventDefault();
    if (!chatPrompt.trim() || chatLoading) return;
    const prompt = chatPrompt;
    setChatPrompt("");
    await handleChat(prompt);
  };

  if (loadingActiveProject || !activeProject) {
    return (
      <Loading
        message="Loading Workspace Studio"
        subtext="Synchronizing project files, dependencies, and sandbox runtime..."
      />
    );
  }

  const files = activeProject.files || {};
  const fileList = Object.keys(files);

  return (
    <section className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden font-sans select-none">
      {/* TOP STUDIO COMMAND BAR */}
      <header className="h-13 border-b border-border bg-card px-3 sm:px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Brand, Back & Project Meta */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 border border-border bg-card hover:border-primary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="size-6 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <img src="/logo.svg" alt="Logo" className="size-3.5" />
            </div>
            <span className="text-xs font-bold font-heading text-foreground tracking-tight max-w-28 sm:max-w-48 truncate">
              {activeProject.name || "Untitled Application"}
            </span>
            <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-1.5 py-0.5 shrink-0">
              v{activeProject.version || 1}.0
            </span>
          </div>
        </div>

        {/* Center: Viewport Switcher & View Mode (Desktop only) */}
        <div className="hidden md:flex items-center gap-2">
          {/* Viewport Frame Switcher */}
          <div className="flex items-center border border-border bg-background p-0.5 text-xs font-mono">
            <button
              onClick={() => setViewportMode("desktop")}
              className={`px-2 py-1 flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewportMode === "desktop"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Desktop 100% Scale"
            >
              <Monitor size={12} />
              <span className="text-[11px]">Desktop</span>
            </button>
            <button
              onClick={() => setViewportMode("tablet")}
              className={`px-2 py-1 flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewportMode === "tablet"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Tablet 768px Frame"
            >
              <Tablet size={12} />
              <span className="text-[11px]">Tablet</span>
            </button>
            <button
              onClick={() => setViewportMode("mobile")}
              className={`px-2 py-1 flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewportMode === "mobile"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Mobile 375px Frame"
            >
              <Smartphone size={12} />
              <span className="text-[11px]">Mobile</span>
            </button>
          </div>

          {/* Code vs Preview Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
            className="rounded-none border-border font-mono text-xs h-7"
          >
            {showCode ? (
              <>
                <Eye size={12} className="text-primary" />
                <span>Hide Code</span>
              </>
            ) : (
              <>
                <Code2 size={12} />
                <span>Split Code</span>
              </>
            )}
          </Button>
        </div>

        {/* Right: Actions (External Preview, Export, Publish) */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPreview}
            className="rounded-none border-border font-mono text-xs h-7 hidden sm:flex items-center gap-1"
          >
            <ExternalLink size={12} />
            <span>Full View</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            disabled={exporting || savingFiles}
            onClick={handleDownload}
            className="rounded-none border-border font-mono text-xs h-7 items-center gap-1 px-2.5 sm:px-3"
          >
            {exporting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Download size={12} />
            )}
            <span className="hidden sm:inline">Export ZIP</span>
            <span className="sm:hidden">ZIP</span>
          </Button>

          <Button
            disabled={publishing || savingFiles}
            size="sm"
            onClick={handlePublish}
            className="rounded-none bg-primary text-primary-foreground font-mono text-xs h-7 items-center gap-1.5 hover:bg-primary/90 px-2.5 sm:px-3"
          >
            {publishing ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Globe size={12} />
            )}
            <span className="hidden sm:inline">Publish Live</span>
            <span className="sm:hidden">Publish</span>
          </Button>
        </div>
      </header>

      {/* MOBILE STUDIO MODE SWITCHER (< md) */}
      <div className="flex md:hidden border-b border-border bg-card text-xs font-mono shrink-0 select-none z-20">
        <button
          onClick={() => {
            setMobileTab("preview");
            setShowCode(false);
          }}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileTab === "preview" && !showCode
              ? "border-primary text-primary bg-primary/5 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye size={12} />
          <span>Preview</span>
        </button>

        <button
          onClick={() => {
            setMobileTab("code");
            setShowCode(true);
          }}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileTab === "code" || showCode
              ? "border-primary text-primary bg-primary/5 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code2 size={12} />
          <span>Code</span>
        </button>

        <button
          onClick={() => {
            setMobileTab("copilot");
            setActiveTab("chat");
          }}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileTab === "copilot"
              ? "border-primary text-primary bg-primary/5 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <MessageSquare size={12} />
          <span>Copilot</span>
        </button>

        <button
          onClick={() => {
            setMobileTab("files");
            setActiveTab("files");
          }}
          className={`flex-1 py-2 flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            mobileTab === "files"
              ? "border-primary text-primary bg-primary/5 font-semibold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Folder size={12} />
          <span>Files</span>
        </button>
      </div>

      {/* WORKSPACE PANELS */}
      <div
        ref={workspaceRef}
        className={`flex-1 flex overflow-hidden ${
          isResizingSidebar ? "select-none" : ""
        }`}
      >
        {/* LEFT STUDIO SIDEBAR */}
        <aside
          // style={{
          //   width:
          //     typeof window !== "undefined" && window.innerWidth < 768
          //       ? "100%"
          //       : `${sidebarWidth}px`,
          // }}
          style={{ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
          className={`shrink-0 border-r border-border bg-card flex-col z-20 w-full md:w-(--sidebar-w) ${
            mobileTab === "copilot" || mobileTab === "files"
              ? "flex"
              : "hidden md:flex"
          }`}
        >
          {/* TAB SELECTOR HEADER */}
          <div className="flex border-b border-border bg-muted/20">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2 text-xs font-mono font-medium flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "border-primary text-primary bg-primary/5 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare size={13} />
              <span>Kanso AI</span>
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`flex-1 py-2 text-xs font-mono font-medium flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
                activeTab === "files"
                  ? "border-primary text-primary bg-primary/5 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Folder size={13} />
              <span>Files ({fileList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("info")}
              className={`px-3 py-2 text-xs font-mono font-medium flex items-center justify-center border-b-2 transition-all cursor-pointer ${
                activeTab === "info"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              title="Project Information"
            >
              <Info size={13} />
            </button>
          </div>

          {/* TAB 1: KANSO AI CHAT */}
          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden p-3 bg-background/50">
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {/* Initial Plan Message */}
                <div className="p-3 border border-border bg-card text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <span className="flex items-center gap-1 text-primary font-semibold">
                      <Sparkles size={12} />
                      Kanso Engine
                    </span>
                    <span>Ready</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    Architecture compiled with {fileList.length} files. Ask me
                    to add features, modify components, or adjust styles.
                  </p>
                </div>

                {/* Message Log */}
                {activeProject.messages &&
                  activeProject.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 border text-xs space-y-1.5 font-sans ${
                        msg.role === "user"
                          ? "bg-primary/5 border-primary/30 ml-4"
                          : "bg-card border-border mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span
                          className={`font-semibold uppercase tracking-wider flex items-center gap-1 ${
                            msg.role === "user"
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <>
                              <Sparkles size={11} className="text-primary" />
                              Kanso AI
                            </>
                          ) : (
                            "Developer"
                          )}
                        </span>
                      </div>
                      <p className="text-foreground whitespace-pre-wrap text-xs leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="pt-2 pb-1 border-t border-border mt-2">
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">
                  Quick Actions:
                </div>
                <div className="flex flex-wrap gap-1">
                  {QUICK_COPILOT_PROMPTS.map((qp, idx) => (
                    <button
                      key={idx}
                      disabled={chatLoading}
                      onClick={() => handleChat(qp)}
                      className="text-[10px] px-2 py-0.5 border border-border bg-card hover:border-primary hover:text-primary text-muted-foreground transition-colors truncate max-w-full text-left font-mono cursor-pointer disabled:opacity-50"
                    >
                      + {qp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Form */}
              <form onSubmit={onSendChat} className="mt-2 relative">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Describe your edits (e.g. Add dark mode)..."
                  disabled={chatLoading}
                  className="w-full pl-3 pr-9 py-2 bg-input/40 border border-border rounded-none text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-sans"
                />
                <button
                  type="submit"
                  disabled={!chatPrompt.trim() || chatLoading}
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-primary-foreground rounded-none disabled:opacity-40 cursor-pointer"
                  title="Send revision request"
                >
                  {chatLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: FILE EXPLORER */}
          {activeTab === "files" && (
            <div className="flex-1 flex flex-col overflow-hidden bg-background/40">
              <div className="p-2.5 border-b border-border text-[11px] font-mono text-muted-foreground flex items-center justify-between">
                <span>PROJECT TREE</span>
                <span>{fileList.length} ITEMS</span>
              </div>
              <div className="flex-1 overflow-y-auto p-1.5 custom-scrollbar">
                <ProjectFileTree
                  fileList={fileList}
                  selectedFile={activeFile}
                  onFileSelect={(filePath) => {
                    setActiveFile(filePath);
                    setShowCode(true);
                    setMobileTab("code");
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 3: PROJECT INFO */}
          {activeTab === "info" && (
            <div className="flex-1 p-4 space-y-4 overflow-y-auto text-xs font-mono bg-background/40">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">
                  Project Title
                </span>
                <p className="font-semibold text-foreground">
                  {activeProject.name || "Untitled Application"}
                </p>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">
                  Synthesis Prompt
                </span>
                <p className="p-2 border border-border bg-card text-muted-foreground text-[11px] font-sans leading-relaxed">
                  {activeProject.description || "No description provided."}
                </p>
              </div>

              <div className="space-y-1.5 border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="text-foreground">
                    v{activeProject.version || 1}.0
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Files:</span>
                  <span className="text-foreground">
                    {fileList.length} files
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Framework:</span>
                  <span className="text-foreground">React 19 + Tailwind</span>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* RESIZE DIVIDER */}
        <div
          onMouseDown={startResizingSidebar}
          className={`hidden md:flex w-1.5 h-full bg-border hover:bg-primary cursor-col-resize items-center justify-center transition-colors group z-30 shrink-0 select-none ${
            isResizingSidebar ? "bg-primary" : ""
          }`}
          title="Drag to resize studio sidebar"
        >
          <div
            className={`w-0.5 h-6 rounded-none bg-muted-foreground/40 group-hover:bg-primary-foreground transition-colors ${
              isResizingSidebar ? "bg-primary-foreground" : ""
            }`}
          />
        </div>

        {/* CENTER WORKSPACE (DASHBOARD OR PREVIEW PANEL) */}
        <main
          style={{ pointerEvents: isResizingSidebar ? "none" : "auto" }}
          className={`overflow-hidden bg-background ${
            mobileTab === "preview" || mobileTab === "code"
              ? "flex flex-1 w-full h-full"
              : "hidden md:flex md:flex-1"
          }`}
        >
          {activeProject.status === "pending" ||
          activeProject.status === "generating" ||
          activeProject.status === "failed" ? (
            <AgentProgressDashboard project={activeProject} />
          ) : (
            <PreviewPanel
              activeFile={activeFile}
              showCode={showCode}
              project={activeProject}
              viewportMode={viewportMode}
            />
          )}
        </main>
      </div>

      {/* PUBLISH MODAL */}
      {publishUrl && (
        <PublishModal
          publishUrl={publishUrl}
          onClose={() => setPublishUrl(null)}
        />
      )}
    </section>
  );
}
