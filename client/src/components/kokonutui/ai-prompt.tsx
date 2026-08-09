import { ArrowRight, Paperclip } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

interface AIPromptProps {
  placeholder?: string;
  headerAction?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

export default function AI_Prompt({
  placeholder = "Describe what you want to build...",
  headerAction = "Let's craft a beautiful website",
  onSubmit,
  className,
}: AIPromptProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim()) return;
      onSubmit?.(value);
      setValue("");
      adjustHeight(true);
    }
  };

  const handleSubmit = () => {
    if (!value.trim()) return;
    onSubmit?.(value);
    setValue("");
    adjustHeight(true);
  };

  return (
    <div className={cn("w-full max-w-2xl my-5", className)}>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-border/50">
          <img src="/logo.svg" alt="KansoCraft Logo" className="size-3.5" />
          <p className="text-xs font-medium text-muted-foreground tracking-tight">
            {headerAction}
          </p>
        </div>

        {/* Textarea */}
        <div className="overflow-y-auto" style={{ maxHeight: "300px" }}>
          <Textarea
            id="ai-prompt-input"
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none border-none bg-transparent",
              "px-4 py-3 min-h-18",
              "text-foreground placeholder:text-muted-foreground/60",
              "focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none",
            )}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/50 bg-muted/30">
          {/* Left: Attach */}
          <label
            aria-label="Attach file"
            className={cn(
              "cursor-pointer rounded-md p-1.5 transition-colors",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-accent",
            )}
          >
            <input className="hidden" type="file" />
            <Paperclip className="h-4 w-4" />
          </label>

          {/* Right: Submit */}
          <button
            type="button"
            aria-label="Send message"
            disabled={!value.trim()}
            onClick={handleSubmit}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              "bg-primary text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            <span>Generate</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Hint */}
      <p className="mt-2 text-center text-xs text-muted-foreground/60">
        Press{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">
          Enter
        </kbd>{" "}
        to generate,{" "}
        <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">
          Shift+Enter
        </kbd>{" "}
        for new line
      </p>
    </div>
  );
}
