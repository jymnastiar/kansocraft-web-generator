import { detectDependencies, type SandpackFiles } from "@/utils/sandpackUtils";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useMemo, useRef, useState } from "react";
// import { useStore } from "@/stores/store";
// import { FileCode } from "lucide-react";
import SandpackErrorMonitor from "../builder-page/SandpackErrorMonitor";

interface FullPagePreviewProps {
  files: SandpackFiles;
}

export default function FullPagePreview({ files }: FullPagePreviewProps) {
  const [showErrorOverlay, setShowErrorOverlay] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const sandpackFiles = useMemo(() => {
    if (!files) return {};
    const spFiles: Record<string, { code: string }> = {};
    for (const [path, content] of Object.entries(files)) {
      const fileCode =
        typeof content === "string" ? content : content?.content || "";
      spFiles[path] = { code: fileCode };
    }
    return spFiles;
  }, [files]);

  const dependencies = useMemo(() => {
    if (!files) return {};
    return detectDependencies(files);
  }, [files]);

  // const getFileMeta = (path: string) => {
  //   const cleanPath = path?.startsWith("/") ? path.slice(1) : path || "file";
  //   const ext = cleanPath.split(".").pop()?.toLowerCase();

  //   let iconColor = "text-[#61afef]";
  //   let langLabel = "TypeScript";

  //   if (ext === "tsx" || ext === "jsx") {
  //     iconColor = "text-[#61afef]";
  //     langLabel = ext === "tsx" ? "TSX" : "JSX";
  //   } else if (ext === "ts" || ext === "js") {
  //     iconColor = "text-[#e5c07b]";
  //     langLabel = ext === "ts" ? "TypeScript" : "JavaScript";
  //   } else if (ext === "css") {
  //     iconColor = "text-[#56b6c2]";
  //     langLabel = "CSS";
  //   } else if (ext === "html") {
  //     iconColor = "text-[#e06c75]";
  //     langLabel = "HTML";
  //   } else if (ext === "json") {
  //     iconColor = "text-[#98c379]";
  //     langLabel = "JSON";
  //   }

  //   return { cleanPath, iconColor, langLabel };
  // };

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden">
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
        template="react"
        files={sandpackFiles}
        customSetup={{ dependencies }}
        options={{
          externalResources: [
            "https://cdn.tailwindcss.com",
            "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
          ],
          logLevel: 0,
        }}
        className="h-full w-full"
      >
        <SandpackErrorMonitor onErrorChange={setShowErrorOverlay} />
        <SandpackLayout className="w-full h-full border-none!">
          {/* <div
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
          > */}
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            className="h-full w-full"
          />
          {/* </div> */}
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
