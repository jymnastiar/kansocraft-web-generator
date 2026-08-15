import { Sparkles, Layers, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  message?: string;
  subtext?: string;
  fullScreen?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function Loading({
  message = "Loading Workspace Studio",
  subtext = "Preparing Sandbox runtime, styling tokens, and components...",
  fullScreen = true,
  className,
  size = "md",
}: LoadingProps) {
  const isSm = size === "sm";
  const isLg = size === "lg";

  const content = (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center text-center select-none font-sans z-10",
        isSm ? "p-4 max-w-xs" : isLg ? "p-12 max-w-lg" : "p-8 max-w-md",
        className,
      )}
    >
      {/* Center Animated Logo / Spinner Cluster */}
      <div className="relative mb-6 flex items-center justify-center">
        {/* Outer Pulsing Glow */}
        <div className="absolute -inset-4 rounded-full bg-primary/10 blur-xl animate-pulse" />

        {/* Ambient Ring */}
        <div className="size-16 sm:size-20 rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-md shadow-2xl flex items-center justify-center relative overflow-hidden group">
          {/* Animated Scanning Light Beam */}
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-primary/10 to-transparent -translate-y-full animate-[scan_2s_ease-in-out_infinite]" />

          {/* Center Brand Icon */}
          <div className="relative z-10 flex items-center justify-center text-primary">
            <Layers className="size-7 sm:size-8 animate-pulse text-primary" />
            <Sparkles className="size-3.5 text-primary absolute -top-1 -right-1 animate-bounce" />
          </div>
        </div>

        {/* Orbiting Spinner Ring */}
        <div className="absolute -inset-2">
          <Loader2 className="w-full h-full text-primary/40 animate-spin" />
        </div>
      </div>

      {/* Title & Status Message */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-muted/40 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          <h3 className="text-xs font-mono font-semibold uppercase tracking-widest text-foreground">
            {message}
          </h3>
        </div>

        {subtext && (
          <p className="text-xs text-muted-foreground max-w-xs sm:max-w-sm leading-relaxed">
            {subtext}
          </p>
        )}
      </div>

      {/* Minimal Tech Progress Bar Indicator */}
      <div className="mt-6 w-48 h-1 bg-muted rounded-full overflow-hidden relative border border-border/40">
        <div className="absolute inset-y-0 bg-primary rounded-full animate-loading-bar" />
      </div>
    </div>
  );

  if (!fullScreen) {
    return content;
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex items-center justify-center relative overflow-hidden">
      {/* Background Subtle Tech Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

      {/* Subtle Radial Gradient Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-120 h-120 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {content}
    </div>
  );
}
