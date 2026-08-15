import { detectDependencies, type SandpackFiles } from "@/utils/sandpackUtils";
import {
  SandpackLayout,
  SandpackPreview,
  SandpackProvider,
} from "@codesandbox/sandpack-react";
import { useMemo, useRef, useState } from "react";
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

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-hidden bg-background">
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
        <SandpackLayout
          style={{
            height: "100%",
            width: "100%",
            border: "none",
            borderRadius: 0,
            background: "transparent",
          }}
        >
          <SandpackPreview
            showNavigator={false}
            showRefreshButton={false}
            showOpenInCodeSandbox={false}
            showSandpackErrorOverlay={showErrorOverlay}
            style={{ height: "100%", width: "100%" }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
