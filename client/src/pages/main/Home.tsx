import {
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
  LogOut,
  FolderKanban,
  Heart,
  ExternalLink,
  Cpu,
  Layers,
  Zap,
  Globe,
  Share2,
  Terminal,
  Laptop,
  FileCode2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { useStore } from "@/stores/store";
import { Link, useNavigate } from "react-router-dom";
import AI_Prompt from "@/components/ui/ai-prompt";
import { useEffect, useState } from "react";

const PROMPT_TEMPLATES = [
  {
    category: "SaaS",
    title: "AI Analytics Platform",
    prompt:
      "A modern SaaS landing page for an AI analytics platform with dark theme, pricing calculator, interactive chart dashboard mockup, and feature matrix.",
  },
  {
    category: "Portfolio",
    title: "Minimalist Dev Portfolio",
    prompt:
      "A minimalist developer portfolio with dark brutalist aesthetics, interactive project showcase filter, terminal timeline, and contact form.",
  },
  {
    category: "E-Commerce",
    title: "Mechanical Keyboard Shop",
    prompt:
      "A boutique mechanical keyboard storefront with product visualizer, switch sound selector UI, shopping cart drawer, and currency switcher.",
  },
  {
    category: "Dashboard",
    title: "Fintech Crypto Tracker",
    prompt:
      "A sleek cryptocurrency portfolio tracker with realtime market ticker, transaction history table, asset allocation chart, and quick swap widget.",
  },
  {
    category: "Landing",
    title: "Design Studio Showcase",
    prompt:
      "An avant-garde digital design agency website with high-contrast typography, interactive service accordion, case study carousel, and client testimonials.",
  },
];

const MARQUEE_TAGS = [
  "SaaS Landing Page",
  "Developer Portfolio",
  "E-Commerce Storefront",
  "Fintech Dashboard",
  "Design Agency Site",
  "Documentation Hub",
  "Mobile Web App",
  "Interactive Resume",
  "Podcast Studio",
  "Real Estate Platform",
  "Restaurant Menu & Order",
  "Cyberpunk Blog",
];

export default function HomePage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const user = useStore((state) => state.user);
  const authLoading = useStore((state) => state.authLoading);
  const logoutSession = useStore((state) => state.logoutSession);

  const projects = useStore((state) => state.projects);
  const loadingProjects = useStore((state) => state.loadingProjects);
  const generatingProject = useStore((state) => state.generatingProject);
  const loadProjects = useStore((state) => state.loadProjects);
  const generateProject = useStore((state) => state.generateProject);
  const deleteProject = useStore((state) => state.deleteProject);

  async function handleLogout() {
    try {
      await logoutSession();
      toast.add({
        title: "Signed out",
        description: "You have been successfully signed out.",
        type: "success",
      });
      navigate("/login");
    } catch (err: any) {
      toast.add({
        title: "Sign out failed",
        description: err.message,
        type: "error",
      });
    }
  }

  async function handleGenerate(prompt: string) {
    if (!prompt || !prompt.trim()) return;
    if (!user) {
      toast.add({
        title: "Authentication required",
        description: "Please sign in to generate and save your AI project.",
        type: "error",
      });
      navigate("/login");
      return;
    }
    try {
      const data = await generateProject(prompt);
      if (!data || !data._id) {
        throw new Error("Could not retrieve project details.");
      }
      toast.add({
        title: "Project created!",
        description: "Your architecture is ready. Launching Studio...",
        type: "success",
      });
      navigate(`/builder/${data._id}`);
    } catch (error: any) {
      toast.add({
        title: "Generation failed",
        description: error.message || "Something went wrong. Please try again.",
        type: "error",
      });
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id);
      toast.add({
        title: "Project deleted",
        description: "The project has been permanently removed.",
        type: "success",
      });
    } catch (error: any) {
      toast.add({
        title: "Failed to delete project",
        description: error.message || "Something went wrong. Please try again.",
        type: "error",
      });
    }
  }

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const filteredTemplates =
    activeCategory === "All"
      ? PROMPT_TEMPLATES
      : PROMPT_TEMPLATES.filter((t) => t.category === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
      {/* BACKGROUND TECH GRID PATTERN */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-size-[32px_32px] z-0" />

      {/* TOP NAVIGATION */}
      <nav className="w-full border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Version */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="size-8 border border-border bg-card flex items-center justify-center group-hover:border-primary transition-colors">
              <img src="/logo.svg" alt="KansoCraft Logo" className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold font-heading tracking-tight flex items-center gap-1.5">
                Kanso<span className="text-primary">Craft</span>
                <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 border border-border bg-muted/40 text-muted-foreground">
                  STUDIO
                </span>
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-mono text-muted-foreground">
            <a
              href="#templates"
              className="hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Templates
            </a>
            <a
              href="#features"
              className="hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Architecture
            </a>
            <a
              href="#workflow"
              className="hover:text-foreground transition-colors uppercase tracking-wider"
            >
              Workflow
            </a>
            {user && (
              <a
                href="#projects"
                className="hover:text-primary transition-colors uppercase tracking-wider font-semibold"
              >
                My Projects
              </a>
            )}
          </div>

          {/* Right Controls */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-foreground font-mono truncate max-w-36">
                  {user?.user_metadata?.fullName || user?.email?.split("@")[0]}
                </span>
              </div>

              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/40 text-xs px-2.5 sm:px-3"
                    >
                      <LogOut size={13} />
                      <span className="hidden sm:inline ml-1">Sign Out</span>
                    </Button>
                  }
                />
                <AlertDialogContent className="rounded-none">
                  <AlertDialogHeader>
                    <AlertDialogMedia className="rounded-none bg-destructive/10 text-destructive">
                      <LogOut size={20} />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-heading">
                      Sign Out of KansoCraft?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You will need to sign back in to access your projects and
                      AI workspace.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-none">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      className="rounded-none"
                      disabled={authLoading}
                      onClick={handleLogout}
                    >
                      Sign Out
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none font-mono text-xs px-2.5 sm:px-3"
                onClick={() => navigate("/login")}
              >
                Sign In
              </Button>
              <Button
                size="sm"
                className="rounded-none font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4"
                onClick={() => navigate("/register")}
              >
                Launch Studio
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 sm:pb-12 flex flex-col items-center text-center z-10">
        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-card text-xs font-mono text-muted-foreground mb-6 shadow-2xs">
          <span className="size-1.5 bg-primary animate-ping" />
          <span className="text-foreground font-semibold">Kanso Engine</span>
          <span className="text-border">|</span>
          <span>Multi-File React & Tailwind Synthesizer</span>
        </div>

        {/* Dramatic Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-heading text-foreground tracking-tight max-w-3xl leading-[1.15] mb-5 sm:mb-6">
          Code Less.{" "}
          <span className="text-primary underline decoration-primary/30 underline-offset-8">
            Craft More.
          </span>
          <br />
          Instant AI Web Studio.
        </h1>

        <p className="text-muted-foreground text-xs sm:text-sm md:text-base max-w-2xl mb-6 sm:mb-8 leading-relaxed font-sans px-2">
          Turn simple natural language ideas into production-grade, multi-file
          React codebases. Includes real-time browser sandbox, code validator,
          interactive visual preview, and 1-click cloud publishing.
        </p>

        {/* AI PROMPT INPUT COMPONENT */}
        <AI_Prompt onSubmit={handleGenerate} />

        {/* TEMPLATE CATEGORY FILTER CHIPS */}
        <div id="templates" className="w-full max-w-3xl mt-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" />
              Quick Inspiration Blueprints
            </span>
            <div className="flex flex-wrap items-center gap-1 text-[11px] font-mono text-muted-foreground">
              {[
                "All",
                "SaaS",
                "Portfolio",
                "E-Commerce",
                "Dashboard",
                "Landing",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 border text-[11px] transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? "bg-foreground text-background border-foreground font-semibold"
                      : "bg-card border-border hover:border-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {filteredTemplates.map((template, idx) => (
              <button
                key={idx}
                disabled={generatingProject}
                onClick={() => handleGenerate(template.prompt)}
                className="group p-3 border border-border bg-card/60 hover:bg-card hover:border-primary transition-all text-left flex flex-col justify-between cursor-pointer disabled:opacity-50"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground mb-1">
                    <span className="px-1.5 py-0.2 border border-border bg-muted/40 uppercase">
                      {template.category}
                    </span>
                    <span className="group-hover:text-primary flex items-center gap-1 transition-colors">
                      Run Prompt <ArrowRight size={10} />
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-foreground font-heading">
                    {template.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                    {template.prompt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MARQUEE IDEAS STRIP */}
      <section className="w-full border-y border-border bg-muted/20 py-3 overflow-hidden select-none">
        <div className="masked-marquee w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-3">
            {[...MARQUEE_TAGS, ...MARQUEE_TAGS].map((tag, index) => (
              <button
                key={`tag-${index}`}
                disabled={generatingProject}
                onClick={() =>
                  handleGenerate(`A complete ${tag} with modern UI`)
                }
                className="text-xs px-3 py-1 border border-border bg-card hover:border-primary hover:text-primary text-muted-foreground font-mono transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                # {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT PROJECTS STUDIO (LOGGED IN) */}
      {user && (
        <section id="projects" className="w-full max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
            <div className="flex items-center gap-2.5">
              <div className="size-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <FolderKanban size={16} />
              </div>
              <div>
                <h2 className="text-lg font-bold font-heading text-foreground">
                  Workspace Projects
                </h2>
                <p className="text-xs text-muted-foreground">
                  Your crafted applications and active iterations
                </p>
              </div>
            </div>

            <span className="text-xs font-mono font-medium px-2.5 py-1 border border-border bg-muted/50 text-foreground">
              {Array.isArray(projects) ? projects.length : 0} TOTAL SITES
            </span>
          </div>

          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-32 border border-border bg-card/30 animate-pulse"
                />
              ))}
            </div>
          ) : Array.isArray(projects) && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className="group relative border border-border bg-card hover:border-primary/60 transition-all p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-primary/20 bg-primary/10 text-primary">
                        v{p.version || 1}.0
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock size={11} />
                        {moment(p.updatedAt || p.createdAt).fromNow()}
                      </span>
                    </div>

                    <h3 className="font-semibold text-foreground text-sm font-heading group-hover:text-primary transition-colors truncate">
                      {p.name || "Untitled Project"}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {p.description ||
                        "Complete React application with custom components."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/50">
                    <div className="text-[11px] font-mono text-muted-foreground">
                      {p.files ? Object.keys(p.files).length : 0} files
                    </div>

                    <div className="flex items-center gap-1.5">
                      <AlertDialog>
                        <AlertDialogTrigger
                          className="p-1.5 border border-transparent hover:border-destructive/40 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-none">
                          <AlertDialogHeader>
                            <AlertDialogMedia className="rounded-none bg-destructive/10 text-destructive">
                              <Trash2 size={20} />
                            </AlertDialogMedia>
                            <AlertDialogTitle className="font-heading">
                              Delete Project?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete{" "}
                              <strong>"{p.name}"</strong> and all generated
                              files. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="rounded-none">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              className="rounded-none"
                              onClick={() => handleDelete(p._id)}
                            >
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <Link
                        to={`/builder/${p._id}`}
                        className="px-3 py-1 bg-foreground text-background font-mono text-xs font-semibold flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <span>Open Studio</span>
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-border p-12 text-center flex flex-col items-center justify-center bg-card/20">
              <FileCode2
                size={32}
                className="text-muted-foreground mb-3 opacity-60"
              />
              <h3 className="font-heading font-semibold text-sm text-foreground">
                No projects created yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
                Use the prompt studio above to describe your first application
                and KansoCraft will build it.
              </p>
            </div>
          )}
        </section>
      )}

      {/* CORE ARCHITECTURE GRID */}
      <section
        id="features"
        className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-border"
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
            ENGINE ARCHITECTURE
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground mt-1">
            Built for Developer-Grade Precision
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2">
            Every layer of KansoCraft is crafted to generate clean,
            maintainable, and deployable codebases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="size-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Layers size={18} />
              </div>
              <h3 className="font-bold text-sm font-heading text-foreground mb-1.5">
                Multi-File React Tree
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Generates complete modular codebases: component hierarchies,
                global styles, state stores, and utility modules in parallel.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary font-semibold">
              01 / SYNTHESIZER
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="size-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Laptop size={18} />
              </div>
              <h3 className="font-bold text-sm font-heading text-foreground mb-1.5">
                Sandpack Live Sandbox
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                In-browser bundler and runtime environment. Test live
                interactions, edit code on the fly, and view responsive
                breakpoints.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary font-semibold">
              02 / SANDBOX RUNTIME
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="size-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Cpu size={18} />
              </div>
              <h3 className="font-bold text-sm font-heading text-foreground mb-1.5">
                Self-Healing Validator
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatic post-generation AST validation. Fixes missing imports,
                reconciles React 19 hooks, and ensures zero runtime breaks.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary font-semibold">
              03 / CODE VALIDATOR
            </div>
          </div>

          {/* Card 4 */}
          <div className="border border-border bg-card p-5 flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div>
              <div className="size-9 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                <Globe size={18} />
              </div>
              <h3 className="font-bold text-sm font-heading text-foreground mb-1.5">
                1-Click Edge Publish & ZIP
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Instantly deploy to a public URL to share with stakeholders, or
                export clean ZIP packages ready for Vercel and Netlify.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary font-semibold">
              04 / DISTRIBUTION
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP INTERACTIVE WORKFLOW */}
      <section
        id="workflow"
        className="w-full bg-muted/20 border-y border-border py-16"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-primary">
              HOW IT WORKS
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-foreground mt-1">
              From Prompt to Production in Seconds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-border bg-card p-6 relative">
              <span className="text-3xl font-bold font-mono text-primary/30 absolute top-4 right-4">
                01
              </span>
              <div className="size-8 bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold mb-4">
                <Terminal size={16} />
              </div>
              <h3 className="font-bold text-sm font-heading text-foreground mb-2">
                Describe Your Vision
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Type what you need in plain text. Mention specific features,
                colors, themes, or data models.
              </p>
            </div>

            <div className="border border-border bg-card p-6 relative">
              <span className="text-3xl font-bold font-mono text-primary/30 absolute top-4 right-4">
                02
              </span>
              <div className="size-8 bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold mb-4">
                <Zap size={16} />
              </div>
              <h3 className="font-bold text-sm font-heading text-foreground mb-2">
                AI Architect Plans & Codes
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                KansoCraft outlines the file system, writes modular React
                components, and links CSS styles seamlessly.
              </p>
            </div>

            <div className="border border-border bg-card p-6 relative">
              <span className="text-3xl font-bold font-mono text-primary/30 absolute top-4 right-4">
                03
              </span>
              <div className="size-8 bg-primary/10 text-primary flex items-center justify-center font-mono text-xs font-bold mb-4">
                <Share2 size={16} />
              </div>
              <h3 className="font-bold text-sm font-heading text-foreground mb-2">
                Iterate, Export & Publish
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Chat with the Kanso AI to refine components, test across desktop
                and mobile, and deploy live.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-border bg-card py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-xs">
          {/* Col 1 */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="KansoCraft Logo" className="size-5" />
              <span className="font-bold font-heading text-base tracking-tight">
                Kanso<span className="text-primary">Craft</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm text-xs leading-relaxed">
              Minimalist AI Web Generation Studio. Focused on simplicity{" "}
              <strong>(Kanso) </strong>
              and developer precision.
            </p>
            <div className="text-[11px] font-mono text-muted-foreground">
              Engineered with React 19, Tailwind CSS & OpenRouter.
            </div>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-2">
            <span className="font-bold font-heading text-foreground uppercase tracking-wider text-[11px]">
              Platform
            </span>
            <a
              href="#templates"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Prompt Blueprints
            </a>
            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Architecture
            </a>
            <a
              href="#workflow"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Workflow
            </a>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-2">
            <span className="font-bold font-heading text-foreground uppercase tracking-wider text-[11px]">
              Creator & Support
            </span>
            <AlertDialog>
              <AlertDialogTrigger className="text-left text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                <span>Support Developer</span>
                <Heart size={12} className="text-destructive" />
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-none">
                <AlertDialogHeader>
                  <AlertDialogMedia className="rounded-none bg-primary/10 text-primary">
                    <Heart size={20} className="text-primary" />
                  </AlertDialogMedia>
                  <AlertDialogTitle className="font-heading">
                    Support KansoCraft Development
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    KansoCraft is created and maintained by{" "}
                    <strong>Jymnastiar</strong>. If you love building with this
                    tool, consider supporting on Kreate!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-none">
                    Close
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-none gap-1.5"
                    onClick={() =>
                      window.open(
                        "https://kreate.gg/jymnastiar",
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <span>Visit kreate.gg/jymnastiar</span>
                    <ExternalLink size={14} />
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-mono">
          <div>© {new Date().getFullYear()} KansoCraft Studio.</div>
        </div>
      </footer>
    </div>
  );
}
