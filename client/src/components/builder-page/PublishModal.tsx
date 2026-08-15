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
    navigator.clipboard
      .writeText(publishUrl)
      .then(() => {
        setCopied(true);
        toast.add({
          title: "Link Copied",
          description: "Public URL copied to clipboard",
          type: "success",
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err: any) => {
        toast.add({
          title: "Error copying",
          description: err.message || "Failed to copy",
          type: "error",
        });
      });
  };

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md rounded-none border border-border bg-card font-sans">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-none border border-primary/30 bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Globe className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold font-heading uppercase tracking-wider text-foreground">
                Website Live & Published
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                Anyone with the link below can access your live site.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="publish-url"
              className="text-xs font-mono font-medium text-muted-foreground uppercase"
            >
              Public Production URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="publish-url"
                type="text"
                readOnly
                value={publishUrl}
                className="font-mono text-xs select-all flex-1 rounded-none border-border"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 h-8 gap-1.5 rounded-none font-mono text-xs"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-primary" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-end gap-2 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-none font-mono text-xs"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="rounded-none font-mono text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => window.open(publishUrl, "_blank")}
          >
            <span>Open Website</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
