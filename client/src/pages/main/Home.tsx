import {
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
  LogOut,
  FolderKanban,
  Heart,
  ExternalLink,
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
import { homeTags } from "@/assets/assets";
import AI_Prompt from "@/components/kokonutui/ai-prompt";
import { useEffect } from "react";

export default function HomePage() {
  const navigate = useNavigate();

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
        description: "ou must be logged in to generate a project.",
        type: "error",
      });
    }
    try {
      const data = await generateProject(prompt);
      if (!data || !data._id) {
        throw new Error("Could not retrieve project details.");
      }
      toast.add({
        title: "Project created!",
        description: "Your project is ready. Redirecting to the builder...",
        type: "success",
      });
      navigate(`/builder/${data._id}`);
    } catch (error: any) {
      toast.add({
        title: "Failed to generate project",
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
    loadProjects();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden bg-[url('/bg-image.png')] bg-cover bg-center bg-no-repeat">
      {/* 1. NAVBAR */}
      <nav className="w-full flex items-center justify-between px-6 py-4 border-b border-border/40 backdrop-blur-md bg-background/60 sticky top-0 z-50">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img src="/logo.svg" alt="KansoCraft Logo" className="size-7" />
          <span className="text-xl font-bold font-heading tracking-tight">
            Kanso<span className="text-primary">Craft</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
            {user?.user_metadata?.fullName || user?.email || "User"}
          </span>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="destructive">Sign Out</Button>}
            />
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
                  <LogOut />
                </AlertDialogMedia>
                <AlertDialogTitle>Sign Out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out? You will need to log back
                  in to access your projects.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel variant="outline">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={authLoading}
                  onClick={handleLogout}
                >
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 pt-12 pb-16 flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-6 animate-fade-in">
          <Sparkles size={14} />
          <span>Craft your first website with AI for free</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold font-heading text-foreground tracking-tight mb-4 max-w-2xl leading-tight">
          Let's build your next web app together.
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base max-w-xl mb-8 leading-relaxed">
          Describe your dream website in simple text, and KansoCraft AI will
          craft clean, responsive React & Tailwind CSS code instantly.
        </p>

        <AI_Prompt onSubmit={handleGenerate} />

        {/* Scrolling Prompt Recommendation Tags */}
        <div className="masked-marquee w-full max-w-2xl overflow-hidden py-2 mb-12">
          <div className="animate-marquee flex items-center justify-center gap-2">
            {homeTags &&
              [...homeTags, ...homeTags].map((tag, index) => (
                <button
                  key={index}
                  disabled={generatingProject}
                  onClick={() => handleGenerate(tag)}
                  className="text-xs px-3 py-1.5 rounded-full bg-card/80 hover:bg-primary/10 hover:text-primary border border-border text-muted-foreground transition-all disabled:opacity-50 whitespace-nowrap shrink-0"
                >
                  {tag}
                </button>
              ))}
          </div>
        </div>

        {/* 3. ALL PROJECTS SECTION */}
        {!loadingProjects && projects.length > 0 && (
          <div className="w-full text-left mt-4 border-t border-border/50 pt-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban size={18} className="text-primary" />
                <h2 className="text-lg font-bold font-heading text-foreground">
                  All Projects
                </h2>
              </div>
              <span className="text-xs font-semibold text-muted-foreground px-2.5 py-0.5 rounded-full bg-muted">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-90 overflow-y-auto pr-1 custom-scrollbar">
              {projects.map((p) => (
                <div
                  key={p._id}
                  onClick={() => navigate(`/builder/${p._id}`)}
                  className="group flex items-center justify-between p-4 bg-card/60 hover:bg-card hover:border-primary/50 border border-border/80 rounded-xl cursor-pointer transition-all duration-200 shadow-sm hover:shadow"
                >
                  <div className="flex flex-col text-left min-w-0 pr-4">
                    <h3 className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                      {p.name || "Untitled Project"}
                    </h3>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {moment(p.updatedAt || p.createdAt).fromNow()}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono font-medium text-foreground/80">
                        v{p.version || 1}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                          <AlertDialogMedia>
                            <Trash2 size={20} className="text-destructive" />
                          </AlertDialogMedia>
                          <AlertDialogTitle>Delete project?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete{" "}
                            <strong>"{p.name}"</strong>. This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => handleDelete(p._id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <div className="p-2 rounded-lg text-muted-foreground group-hover:text-primary transition-colors">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="w-full border-t border-border/40 bg-background/80 backdrop-blur-md py-6 px-6 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          {/* Copyright */}
          <div>
            © {new Date().getFullYear()}{" "}
            <span className="font-semibold text-foreground">KansoCraft</span>.
            All rights reserved.
          </div>

          {/* Footer Links & Dialogs */}
          <div className="flex items-center gap-6">
            {/* Support Dialog */}
            <AlertDialog>
              <AlertDialogTrigger className="hover:text-foreground transition-colors flex items-center gap-1.5 cursor-pointer">
                <span>Support</span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogMedia className="bg-primary/10 text-primary">
                    <Heart size={20} className="text-primary" />
                  </AlertDialogMedia>
                  <AlertDialogTitle>Support & Developer</AlertDialogTitle>
                  <AlertDialogDescription>
                    KansoCraft is developed by <strong>jymnastiar</strong>. If
                    you'd like to support the development or get in touch, visit
                    Kreate.gg.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      window.open("https://kreate.gg/jymnastiar", "_blank")
                    }
                    className="gap-1.5"
                  >
                    <span>Support on Kreate</span>
                    <ExternalLink size={14} />
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Privacy Link */}
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Privacy Policy
            </Link>

            {/* Terms Link */}
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors cursor-pointer"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
