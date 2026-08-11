import { useSandpack } from "@codesandbox/sandpack-react";
import { useEffect, useRef } from "react";

interface SandpackErrorMonitorProps {
  onErrorChange: (hasError: boolean) => void;
}

export default function SandpackErrorMonitor({
  onErrorChange,
}: SandpackErrorMonitorProps) {
  const { sandpack } = useSandpack();
  const { error } = sandpack;
  const prevHasErrorRef = useRef<boolean | null>(null);

  useEffect(() => {
    let hasError = false;

    if (error) {
      const msg = error.message || "";
      const isNetworkError =
        msg.includes("Failed to fetch") ||
        msg.includes("col.csbops.io") ||
        msg.includes("ERR_CONNECTION_TIMED_OUT") ||
        msg.includes("net::ERR");

      if (!isNetworkError) {
        hasError = true;
      }
    }

    if (prevHasErrorRef.current !== hasError) {
      prevHasErrorRef.current = hasError;
      onErrorChange(hasError);
    }
  }, [error, onErrorChange]);

  return null;
}
