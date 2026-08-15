import type { Project, PlannedFile } from "@/api/api";
import {
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  AlertCircleIcon,
  SparklesIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AgentProgressDashboardProps {
  project: Project;
}

export default function AgentProgressDashboard({
  project,
}: AgentProgressDashboardProps) {
  const planned = project.filesPlanned || [];
  const completed = project.filesGenerated || [];
  const current = project.currentFile;
  const isFailed = project.status === "failed";
  const progressPercent =
    planned.length > 0
      ? Math.round((completed.length / planned.length) * 100)
      : 0;

  return (
    <div className="h-full w-full bg-background flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto font-sans">
      <Card className="max-w-2xl w-full border border-border shadow-sm rounded-none overflow-hidden bg-card">
        {/* Status Header */}
        <CardHeader className="border-b border-border pb-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "size-8 rounded-none border flex items-center justify-center shrink-0",
                  isFailed
                    ? "bg-destructive/10 border-destructive/30 text-destructive"
                    : "bg-primary/10 border-primary/30 text-primary",
                )}
              >
                {isFailed ? (
                  <AlertCircleIcon className="size-4" />
                ) : (
                  <SparklesIcon className="size-4 animate-pulse" />
                )}
              </div>
              <div>
                <CardTitle className="text-sm font-bold font-heading text-foreground uppercase tracking-wider flex items-center gap-2">
                  {isFailed
                    ? "Synthesis Error"
                    : project.status === "pending"
                      ? "Phase 1: Architecture Planning"
                      : "Phase 2: Code Synthesis & Validation"}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                  {isFailed
                    ? "An error occurred during build execution"
                    : "Writing modular React components & Tailwind CSS"}
                </CardDescription>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2 py-0.5 border border-border bg-card text-foreground">
              {progressPercent}% COMPLETE
            </span>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Error alert */}
          {isFailed && project.error && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-none text-xs text-destructive font-mono">
              Error: {project.error}
            </div>
          )}

          {/* Progress bar */}
          {planned.length > 0 && !isFailed && (
            <div>
              <div className="flex justify-between text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                <span>Compilation Status</span>
                <span>
                  {completed.length} of {planned.length} files generated
                </span>
              </div>
              <div className="w-full h-1.5 bg-muted rounded-none overflow-hidden border border-border">
                <div
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Files checklist */}
          {planned.length > 0 ? (
            <div>
              <span className="block text-[11px] font-mono font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                File Manifest Checklist
              </span>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {planned.map((file: PlannedFile) => {
                  const isCompleted = completed.includes(file.path);
                  const isGenerating = current === file.path;

                  return (
                    <div
                      key={file.path}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-none border text-xs transition-all font-mono",
                        isGenerating
                          ? "bg-primary/5 border-primary text-foreground"
                          : isCompleted
                            ? "bg-card border-border/80 text-muted-foreground"
                            : "bg-card/40 border-border/30 opacity-50",
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2Icon
                          size={14}
                          className="text-primary shrink-0"
                        />
                      ) : isGenerating ? (
                        <Loader2Icon
                          size={14}
                          className="animate-spin text-primary shrink-0"
                        />
                      ) : (
                        <CircleIcon
                          size={14}
                          className="text-muted-foreground/40 shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-xs font-semibold truncate",
                              isGenerating ? "text-primary" : "text-foreground",
                            )}
                          >
                            {file.path}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-sans truncate mt-0.5">
                          {file.description}
                        </p>
                      </div>
                      {isGenerating && (
                        <span className="text-[9px] px-2 py-0.5 rounded-none border border-primary/30 bg-primary/10 text-primary font-semibold animate-pulse uppercase tracking-wider shrink-0">
                          Compiling
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            !isFailed && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-3 font-mono text-xs">
                <Loader2Icon size={24} className="animate-spin text-primary" />
                <p>Analyzing requirements and structuring component tree...</p>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
