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
import { FileCode } from "lucide-react";

interface PreviewPanelProps {
  project: Project;
  activeFile: string;
  showCode?: boolean;
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
    <div ref={containerRef} className="h-full w-full relative select-none">
      <style>{`
        .sp-cm .cm-lineNumbers {
          font-size: 13.5px !important;
          min-width: 42px !important;
          color: #5c6370 !important;
        }
        .sp-cm .cm-gutterElement {
          font-size: 13.5px !important;
          padding: 0 8px 0 4px !important;
        }
        .sp-cm .cm-content {
          font-size: 14px !important;
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
            surface1: "#21232d",
            surface2: "#18181f",
            surface3: "#2b2c3a",
            clickable: "#abb2bf",
            base: "#abb2bf",
            disabled: "#5c6370",
            hover: "#2f3242",
            accent: "#c678dd",
            error: "#e06c75",
            errorSurface: "#382025",
          },
          syntax: {
            keyword: "#c678dd",
            property: "#e06c75",
            plain: "#abb2bf",
            static: "#d19a66",
            definition: "#61afef",
            string: "#98c379",
            tag: "#e5c07b",
          },
          font: {
            body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            mono: '"Fira Code", "JetBrains Mono", "Fira Mono", "Consolas", monospace',
            size: "14px",
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
          <div
            style={{
              width: showCode ? `${leftWidth}%` : "0%",
              display: showCode ? "flex" : "none",
              minWidth: showCode ? "250px" : "0px",
              flexShrink: 0,
            }}
            className="flex flex-col h-full"
          >
            {showCode &&
              (() => {
                const { cleanPath, iconColor, langLabel } =
                  getFileMeta(activeFile);
                return (
                  <div className="h-9 bg-[#18181f] border-b border-[#2b2c3a] flex items-center justify-between z-10 select-none">
                    <div className="flex items-center h-full">
                      <div className="h-full px-3.5 flex items-center gap-2 bg-[#21232d] text-xs font-mono">
                        <FileCode size={14} className={iconColor} />
                        <span className="text-[#abb2bf] font-medium tracking-tight">
                          {cleanPath}
                        </span>
                      </div>
                    </div>

                    <div className="px-3 flex items-center gap-2.5 text-[11px] font-mono text-[#5c6370]">
                      <span>UTF-8</span>
                      <span className="h-3 w-px bg-[#2b2c3a]" />
                      <span>{langLabel}</span>
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

          {showCode && (
            <div
              onMouseDown={startResizing}
              className={`w-1.5 h-full bg-[#18181f] hover:bg-accent cursor-col-resize flex items-center justify-center transition-colors group z-20 shrink-0 border-x border-[#2b2c3a] ${
                isResizing ? "bg-accent" : ""
              }`}
              title="Drag to resize panels"
            >
              <div
                className={`w-0.5 h-6 rounded bg-[#3e4451] group-hover:bg-white transition-colors ${
                  isResizing ? "bg-white" : ""
                }`}
              />
            </div>
          )}

          <div
            style={{
              flex: 1,
              minWidth: showCode ? "150px" : "0px",
              pointerEvents: isResizing ? "none" : "auto",
            }}
            className="h-full min-w-0"
          >
            <SandpackPreview
              showNavigator={false}
              showRefreshButton
              showOpenInCodeSandbox={false}
              showSandpackErrorOverlay={showErrorOverlay}
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
