import type { Project } from "@/api/api";
import { detectDependencies, type SandpackFiles } from "@/utils/sandpackUtils";
import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/stores/store";
import SandpackErrorMonitor from "./SandpackErrorMonitor";
import { FileCode, Smartphone, Tablet } from "lucide-react";
import { cn } from "@/lib/utils";

interface PreviewPanelProps {
  project: Project;
  activeFile: string;
  showCode?: boolean;
  viewportMode?: "desktop" | "tablet" | "mobile";
}

interface SandpackFileWatcherProps {
  onLivesChanges: (newFiles: Record<string, string>) => void;
}

function SandpackFileWatcher({ onLivesChanges }: SandpackFileWatcherProps) {
  const { sandpack } = useSandpack();
  const { files } = sandpack;
  const updateProjectFiles = useStore((state) => state.updateProjectFiles);
  const activeProject = useStore((state) => state.activeProject);

  const activeProjectRef = useRef<Project | null>(activeProject);

  useEffect(() => {
    activeProjectRef.current = activeProject;
  }, [activeProject]);

  useEffect(() => {
    const project = activeProjectRef.current;
    if (!project) return;
    const updatedFiles: Record<string, string> = {};
    let hasChanges = false;

    for (const [path, fileObj] of Object.entries(files)) {
      const fileCode = fileObj.code;
      updatedFiles[path] = fileCode;
      const targetFile = project.files[path];
      const originalContent =
        typeof targetFile === "string" ? targetFile : targetFile?.content;
      if (originalContent !== undefined && originalContent !== fileCode) {
        hasChanges = true;
      }
    }

    onLivesChanges(updatedFiles);
    if (hasChanges) {
      updateProjectFiles(updatedFiles);
    }
  }, [files, updateProjectFiles, onLivesChanges]);

  return null;
}

export default function PreviewPanel({
  project,
  activeFile,
  showCode: showCodeProp,
  viewportMode = "desktop",
}: PreviewPanelProps) {
  const storeShowCode = useStore((state) => state.showCode);
  const showCode = showCodeProp !== undefined ? showCodeProp : storeShowCode;

  const showErrorOverlay = useStore((state) => state.showErrorOverlay);
  const setShowErrorOverlay = useStore((state) => state.setShowErrorOverlay);
  const leftWidth = useStore((state) => state.editorSplitWidth);
  const setLeftWidth = useStore((state) => state.setEditorSplitWidth);

  const [liveFiles, setLiveFiles] = useState<SandpackFiles>(project.files);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLiveFiles(project.files);
  }, [project._id, project.version, project.files]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offset = e.clientX - rect.left;
      const newPercent = (offset / rect.width) * 100;

      const clampedPercent = Math.min(Math.max(newPercent, 20), 80);
      setLeftWidth(clampedPercent);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const handleLiveFilesChanges = (newFiles: Record<string, string>) => {
    setLiveFiles((prev) => {
      let changed = false;
      for (const [p, code] of Object.entries(newFiles)) {
        const prevContent =
          typeof prev[p] === "string" ? prev[p] : prev[p]?.content;
        if (prevContent !== code) {
          changed = true;
          break;
        }
      }
      return changed ? newFiles : prev;
    });
  };

  const sandpackFiles = useMemo(() => {
    const spFiles: Record<string, { code: string; active: boolean }> = {};
    for (const [path, content] of Object.entries(liveFiles)) {
      const fileCode =
        typeof content === "string" ? content : content?.content || "";
      spFiles[path] = {
        code: fileCode,
        active: path === activeFile,
      };
    }
    return spFiles;
  }, [liveFiles, activeFile]);

  const dependencies = useMemo(() => {
    return detectDependencies(liveFiles);
  }, [liveFiles]);

  const getFileMeta = (path: string) => {
    const cleanPath = path?.startsWith("/") ? path.slice(1) : path || "file";
    const ext = cleanPath.split(".").pop()?.toLowerCase();

    let iconColor = "text-[#61afef]";
    let langLabel = "TypeScript";

    if (ext === "tsx" || ext === "jsx") {
      iconColor = "text-[#61afef]";
      langLabel = ext === "tsx" ? "TSX" : "JSX";
    } else if (ext === "ts" || ext === "js") {
      iconColor = "text-[#e5c07b]";
      langLabel = ext === "ts" ? "TypeScript" : "JavaScript";
    } else if (ext === "css") {
      iconColor = "text-[#56b6c2]";
      langLabel = "CSS";
    } else if (ext === "html") {
      iconColor = "text-[#e06c75]";
      langLabel = "HTML";
    } else if (ext === "json") {
      iconColor = "text-[#98c379]";
      langLabel = "JSON";
    }

    return { cleanPath, iconColor, langLabel };
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full relative select-none bg-background"
    >
      <style>{`
        .sp-cm .cm-lineNumbers {
          font-size: 13px !important;
          min-width: 38px !important;
          color: #5c6370 !important;
        }
        .sp-cm .cm-gutterElement {
          font-size: 13px !important;
          padding: 0 6px 0 4px !important;
        }
        .sp-cm .cm-content {
          font-size: 13.5px !important;
          line-height: 1.6 !important;
        }
      `}</style>
      <SandpackProvider
        key={project._id}
        template="react"
        files={sandpackFiles}
        customSetup={{ dependencies }}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
          ],
          classes: {
            "sp-wrapper": "sp-wrapper",
            "sp-layout": "sp-layout",
            "sp-preview": "sp-preview",
          },
          logLevel: 0,
        }}
        theme={{
          colors: {
            surface1: "#18181b",
            surface2: "#09090b",
            surface3: "#27272a",
            clickable: "#a1a1aa",
            base: "#e4e4e7",
            disabled: "#71717a",
            hover: "#27272a",
            accent: "#10b981",
            error: "#ef4444",
            errorSurface: "#2d1619",
          },
          syntax: {
            keyword: "#f43f5e",
            property: "#38bdf8",
            plain: "#e4e4e7",
            static: "#fb923c",
            definition: "#818cf8",
            string: "#4ade80",
            tag: "#38bdf8",
          },
          font: {
            body: '"Source Sans 3 Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
            size: "13.5px",
            lineHeight: "1.6",
          },
        }}
      >
        <SandpackFileWatcher onLivesChanges={handleLiveFilesChanges} />
        <SandpackErrorMonitor onErrorChange={setShowErrorOverlay} />
        <SandpackLayout
          style={{
            height: "100%",
            border: "none",
            borderRadius: 0,
            background: "transparent",
            display: "flex",
            width: "100%",
          }}
        >
          {/* CODE EDITOR PANEL */}
          <div
            style={{
              width: showCode ? `${leftWidth}%` : "0%",
            }}
            className={cn(
              "flex-col h-full border-r border-border bg-[#09090b]",
              showCode ? "flex w-full md:w-auto md:min-w-60 shrink-0" : "hidden",
            )}
          >
            {showCode &&
              (() => {
                const { cleanPath, iconColor, langLabel } =
                  getFileMeta(activeFile);
                return (
                  <div className="h-9 bg-[#121215] border-b border-[#27272a] flex items-center justify-between z-10 select-none px-3">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <FileCode size={14} className={iconColor} />
                      <span className="text-[#e4e4e7] font-semibold tracking-tight">
                        {cleanPath}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-[#71717a]">
                      <span>UTF-8</span>
                      <span className="h-3 w-px bg-[#27272a]" />
                      <span className="text-[#a1a1aa]">{langLabel}</span>
                    </div>
                  </div>
                );
              })()}

            <SandpackCodeEditor
              showTabs={false}
              showLineNumbers
              showInlineErrors
              wrapContent
              style={{
                height: "calc(100% - 36px)",
                flex: 1,
                minWidth: 0,
              }}
            />
          </div>

          {/* RESIZE DIVIDER */}
          {showCode && (
            <div
              onMouseDown={startResizing}
              className={`hidden md:flex w-1.5 h-full bg-border hover:bg-primary cursor-col-resize items-center justify-center transition-colors group z-20 shrink-0 select-none ${
                isResizing ? "bg-primary" : ""
              }`}
              title="Drag to resize code & preview panels"
            >
              <div
                className={`w-0.5 h-6 rounded-none bg-muted-foreground/50 group-hover:bg-primary-foreground transition-colors ${
                  isResizing ? "bg-primary-foreground" : ""
                }`}
              />
            </div>
          )}

          {/* PREVIEW CONTAINER WITH VIEWPORT SIMULATION */}
          <div
            style={{
              flex: 1,
              pointerEvents: isResizing ? "none" : "auto",
            }}
            className={cn(
              "h-full min-w-0 bg-muted/20 flex-col items-center justify-center overflow-hidden",
              showCode ? "hidden md:flex" : "flex",
            )}
          >
            <div
              className={`h-full transition-all duration-300 flex flex-col ${
                viewportMode === "mobile"
                  ? "w-93.75 max-w-full my-auto border-x border-border shadow-xl bg-background"
                  : viewportMode === "tablet"
                    ? "w-3xl max-w-full my-auto border-x border-border shadow-xl bg-background"
                    : "w-full"
              }`}
            >
              {viewportMode !== "desktop" && (
                <div className="h-6 bg-card border-b border-border flex items-center justify-between px-3 text-[10px] font-mono text-muted-foreground shrink-0 select-none">
                  <div className="flex items-center gap-1.5">
                    {viewportMode === "mobile" ? (
                      <>
                        <Smartphone size={11} className="text-primary" />
                        <span>Mobile View (375px)</span>
                      </>
                    ) : (
                      <>
                        <Tablet size={11} className="text-primary" />
                        <span>Tablet View (768px)</span>
                      </>
                    )}
                  </div>
                  <span>100% SCALE</span>
                </div>
              )}

              <div className="flex-1 h-full w-full overflow-hidden">
                <SandpackPreview
                  showNavigator={false}
                  showRefreshButton
                  showOpenInCodeSandbox={false}
                  showSandpackErrorOverlay={showErrorOverlay}
                  style={{ height: "100%", width: "100%" }}
                />
              </div>
            </div>
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
