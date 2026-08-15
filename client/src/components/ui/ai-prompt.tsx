import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";
import { useStore } from "@/stores/store";

interface AIPromptProps {
  placeholder?: string;
  headerAction?: string;
  onSubmit?: (value: string) => void;
  className?: string;
}

export default function AI_Prompt({
  placeholder = "e.g. A sleek cyber-minimalist portfolio with dark mode, interactive timeline, and project grid...",
  headerAction = "AI Craft Studio Prompt",
  onSubmit,
  className,
}: AIPromptProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 80,
    maxHeight: 300,
  });
  const generatingProject = useStore((state) => state.generatingProject);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!value.trim() || generatingProject) return;
      onSubmit?.(value);
      setValue("");
      adjustHeight(true);
    }
  };

  const handleSubmit = () => {
    if (!value.trim() || generatingProject) return;
    onSubmit?.(value);
    setValue("");
    adjustHeight(true);
  };

  return (
    <div className={cn("w-full max-w-3xl my-4", className)}>
      <div className="rounded-none border border-border bg-card shadow-sm transition-all focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/20 text-xs font-mono">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Sparkles size={13} className="text-primary animate-pulse" />
            <span className="font-semibold uppercase tracking-wider text-foreground text-[11px]">
              {headerAction}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Ready
            </span>
          </div>
        </div>

        {/* Textarea */}
        <div
          className="overflow-y-auto bg-background/50"
          style={{ maxHeight: "300px" }}
        >
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
              "px-4 py-3.5 min-h-20 font-sans",
              "text-foreground text-sm placeholder:text-muted-foreground/50",
              "focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none leading-relaxed",
            )}
          />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-t border-border bg-muted/30">
          <div className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 sm:gap-1.5 font-mono">
            <span className="hidden sm:inline">Press</span>
            <kbd className="hidden sm:inline-block rounded-none border border-border bg-card px-1.5 py-0.5 text-[10px] font-mono text-foreground">
              Enter ↵
            </kbd>
            <span className="hidden sm:inline">to generate</span>
            <span className="sm:hidden">Natural language AI</span>
          </div>

          {/* Right: Submit Button */}
          <button
            type="button"
            aria-label="Generate project"
            disabled={!value.trim() || generatingProject}
            onClick={handleSubmit}
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 rounded-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold uppercase tracking-wider transition-all",
              "bg-primary text-primary-foreground font-heading",
              "hover:bg-primary/90 active:translate-y-px",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer",
            )}
          >
            {generatingProject ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Crafting...</span>
              </>
            ) : (
              <>
                <span>Generate Code</span>
                <ArrowRight className="size-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
