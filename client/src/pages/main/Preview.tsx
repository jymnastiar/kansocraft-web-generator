import Loading from "@/components/ui/loading";
import { useStore } from "@/stores/store";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import FullPagePreview from "@/components/preview-page/FullPagePreview";

export default function PreviewPage() {
  const { id } = useParams();

  const activeProject = useStore((state) => state.activeProject);
  const loadingActiveProject = useStore((state) => state.loadingActiveProject);
  const loadProject = useStore((state) => state.loadProject);

  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);

  if (loadingActiveProject || !activeProject) {
    return <Loading />;
  }

  return <FullPagePreview files={activeProject.files} />;
}
