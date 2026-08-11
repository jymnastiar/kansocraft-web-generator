import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  Folder,
  MessageSquare,
  EyeIcon,
  Code2Icon,
  ExternalLinkIcon,
  GlobeIcon,
  DownloadIcon,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useStore } from "@/stores/store";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProjectFileTree from "@/components/ui/file-tree";
import PreviewPanel from "@/components/builder-page/PreviewPanel";
import AgentProgressDashboard from "@/components/builder-page/AgentProgressDashboard";
import PublishModal from "@/components/builder-page/PublishModal";
import api from "@/api/api";
import { exportProjectZip } from "@/utils/exportProject";

export default function BuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  const [chatPrompt, setChatPrompt] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [showCode, setShowCode] = useState(false);

  const user = useStore((state) => state.user);
  const activeProject = useStore((state) => state.activeProject);
  const loadingActiveProject = useStore((state) => state.loadingActiveProject);
  const activeFile = useStore((state) => state.activeFile);
  const setActiveFile = useStore((state) => state.setActiveFile);
  const loadProject = useStore((state) => state.loadProject);
  const userChat = useStore((state) => state.userChat);
  const chatLoading = useStore((state) => state.chatLoading);

  const [sidebarWidth, setSidebarWidth] = useState<number>(320);
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
      const clampedWidth = Math.min(Math.max(newWidth, 220), maxWidth);
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
      activeProject.status === "pending" ||
      activeProject.status === "failed";

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
          title: "Success",
          description: `Updated to version ${data?.version || "latest"}`,
          type: "success",
        });
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to process chat request";

      toast.add({
        title: "Chat Failed",
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
      await api.post(`/api/projects/${id}/publish`);
      const url = `${window.location.origin}/publish/${id}`;
      setPublishUrl(url);
      toast.add({
        title: "Website Published",
        description: "Website published successfully!",
        type: "success",
      });
    } catch (err: any) {
      toast.add({
        title: "Publish Failed",
        description: err?.response?.data?.error || "Published has been failed",
        type: "error",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDownload = () => {
    if (!activeProject) return;
    exportProjectZip(activeProject);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const files = activeProject.files || {};
  const fileList = Object.keys(files);

  return (
    <section className="h-screen w-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* TOP HEADER */}
      <header className="h-14 border-b border-border bg-card/50 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-sm font-semibold font-heading text-foreground flex items-center gap-2">
              <img src="/logo.svg" alt="KansoCraft Logo" className="size-5" />
              {activeProject.name || "Untitled Website"}
              <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-mono">
                v{activeProject.version || 1}
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button size="sm" onClick={() => setShowCode(!showCode)}>
            {showCode ? (
              <>
                <EyeIcon size={13} /> Preview
              </>
            ) : (
              <>
                <Code2Icon size={13} /> Code
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleOpenPreview}>
            <ExternalLinkIcon size={13} /> Preview
          </Button>
          <Button disabled={publishing} size="sm" onClick={handlePublish}>
            <GlobeIcon size={13} /> Publish
          </Button>
          <Button size="sm" onClick={handleDownload}>
            <DownloadIcon size={13} /> Export
          </Button>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div
        ref={workspaceRef}
        className={`flex-1 flex overflow-hidden ${
          isResizingSidebar ? "select-none" : ""
        }`}
      >
        <aside
          style={{ width: `${sidebarWidth}px` }}
          className="shrink-0 border-r border-border bg-card/30 flex flex-col z-10"
        >
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "chat"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare size={14} />
              <span>AI Assistant</span>
            </button>
            <button
              onClick={() => setActiveTab("files")}
              className={`flex-1 py-2.5 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-all ${
                activeTab === "files"
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Folder size={14} />
              <span>Files ({fileList.length})</span>
            </button>
          </div>

          {activeTab === "chat" && (
            <div className="flex-1 flex flex-col overflow-hidden p-3">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                {activeProject.messages &&
                  activeProject.messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        msg.role === "user"
                          ? "bg-primary/10 border-primary/20 ml-6"
                          : "bg-card border-border mr-6"
                      }`}
                    >
                      <span
                        className={`font-semibold flex items-center gap-1.5 ${
                          msg.role === "user"
                            ? "text-primary"
                            : "text-foreground"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <>
                            <Sparkles size={13} className="text-primary" />
                            AI Assistant
                          </>
                        ) : (
                          "You"
                        )}
                      </span>
                      <p className="text-foreground whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={onSendChat} className="mt-3 relative">
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder="Ask AI to edit code..."
                  disabled={chatLoading}
                  className="w-full pl-3 pr-10 py-2 bg-input/50 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!chatPrompt.trim() || chatLoading}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
                >
                  {chatLoading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === "files" && (
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
              <ProjectFileTree
                fileList={fileList}
                selectedFile={activeFile}
                onFileSelect={(filePath) => {
                  setActiveFile(filePath);
                  setShowCode(true);
                }}
              />
            </div>
          )}
        </aside>

        {/* RESIZE DIVIDER */}
        <div
          onMouseDown={startResizingSidebar}
          className={`w-1.5 h-full bg-border hover:bg-primary/50 cursor-col-resize flex items-center justify-center transition-colors group z-20 shrink-0 select-none ${
            isResizingSidebar ? "bg-primary" : ""
          }`}
          title="Drag to resize sidebar"
        >
          <div
            className={`w-0.5 h-6 rounded bg-muted-foreground/40 group-hover:bg-primary-foreground transition-colors ${
              isResizingSidebar ? "bg-primary-foreground" : ""
            }`}
          />
        </div>

        <main
          style={{ pointerEvents: isResizingSidebar ? "none" : "auto" }}
          className="flex-1 overflow-hidden"
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
            />
          )}
        </main>
      </div>

      {publishUrl && (
        <PublishModal
          publishUrl={publishUrl}
          onClose={() => setPublishUrl(null)}
        />
      )}
    </section>
  );
}
