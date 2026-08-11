import FullPagePreview from "@/components/preview-page/FullPagePreview";
import Loading from "@/components/ui/loading";
import { useStore } from "@/stores/store";
import { AlertCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

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
      <div className="h-screen w-screen flex flex-col items-center justify-center px-4 text-center">
        <div className="w-12 h-12 flex items-center justify-center mb-4 text-destructive">
          <AlertCircleIcon size={24} />
        </div>
        <h1 className="text-lg font-semibold mb-1.5">Website Unavailable</h1>
        <p className="text-sm max-w-sm leading-relaxed mb-6">
          {publishError ||
            "This website is not available or is not published yet"}
        </p>
        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          KansoCraft
        </div>
      </div>
    );
  }
  return <FullPagePreview files={publishedProject.files} />;
}
