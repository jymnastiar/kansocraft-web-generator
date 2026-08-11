import { useState } from "react";
import { Check, Copy, ExternalLink, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

interface PublishModalProps {
  publishUrl: string;
  onClose: () => void;
}

export default function PublishModal({
  publishUrl,
  onClose,
}: PublishModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (!publishUrl) return;
    navigator.clipboard.writeText(publishUrl);
    setCopied(true);
    toast.add({
      title: "Public Link Copied",
      description: "Public link copied to clipboard",
      type: "success",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Your website is live!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Anyone with the link below can view your published site.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="publish-url"
              className="text-xs font-medium text-muted-foreground"
            >
              Published link
            </Label>
            <div className="flex gap-2">
              <Input
                id="publish-url"
                type="text"
                readOnly
                value={publishUrl}
                className="font-mono text-xs select-all flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 h-8 gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full sm:w-auto gap-1.5"
            onClick={() => window.open(publishUrl, "_blank")}
          >
            <span>Open Site</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
