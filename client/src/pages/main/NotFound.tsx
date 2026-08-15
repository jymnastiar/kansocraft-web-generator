import { ArrowLeft, Home, Terminal } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden select-none font-sans">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[3rem_3rem] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <main className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card shadow-xs">
          <Terminal size={13} className="text-primary" />
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-muted-foreground">
            Error 404 // Route_Not_Found
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl sm:text-8xl font-black font-heading tracking-tighter text-foreground">
            404
          </h1>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            The workspace or route you are attempting to access does not exist,
            has been relocated, or is unavailable.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto text-xs font-mono uppercase tracking-wider gap-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            Go Back
          </Button>

          <Link
            to="/"
            className={`w-full sm:w-auto text-xs font-mono uppercase tracking-wider gap-2 cursor-pointer ${buttonVariants({ variant: "default" })}`}
          >
            <Home size={14} />
            Return Home
          </Link>
        </div>

        <div className="pt-8 text-[11px] font-mono text-muted-foreground/60">
          KansoCraft Virtual Engine // System Ready
        </div>
      </main>
    </div>
  );
}
