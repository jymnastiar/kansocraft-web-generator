import FullPagePreview from "@/components/preview-page/FullPagePreview";
import Loading from "@/components/ui/loading";
import { useStore } from "@/stores/store";
import { AlertCircleIcon, ArrowLeft } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export default function PublishPage() {
  const { id } = useParams();

  const publishedProject = useStore((state) => state.publishedProject);
  const publishLoading = useStore((state) => state.publishLoading);
  const publishError = useStore((state) => state.publishError);
  const fetchPublishedProject = useStore(
    (state) => state.fetchPublishedProject,
  );

  useEffect(() => {
    if (id) {
      fetchPublishedProject(id);
    }
  }, [id, fetchPublishedProject]);

  if (publishLoading) {
    return <Loading />;
  }

  if (publishError || !publishedProject) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center px-4 text-center bg-background text-foreground font-sans">
        <div className="size-12 border border-destructive/30 bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertCircleIcon size={24} />
        </div>
        <h1 className="text-base font-bold font-heading uppercase tracking-wider mb-2">
          Website Unavailable
        </h1>
        <p className="text-xs text-muted-foreground max-w-sm leading-relaxed mb-6 font-mono">
          {publishError ||
            "This project is not published or the link has expired."}
        </p>
        <Link
          to="/"
          className="px-4 py-2 border border-border bg-card text-xs font-mono font-semibold hover:border-primary transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={13} />
          <span>Return to KansoCraft</span>
        </Link>
      </div>
    );
  }

  return <FullPagePreview files={publishedProject.files} />;
}
