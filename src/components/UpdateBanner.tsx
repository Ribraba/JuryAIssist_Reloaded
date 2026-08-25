import { SparkleIcon, Loader2, X, AlertCircle } from "lucide-react";
import type { UpdateStage } from "../hooks/useAppUpdate";

type Props = {
  stage: UpdateStage;
  version?: string;
  errorMessage: string;
  onInstall: () => void;
  onDismiss: () => void;
};

export default function UpdateBanner({
  stage,
  version,
  errorMessage,
  onInstall,
  onDismiss,
}: Props) {
  if (stage === "idle") return null;

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-primary-soft px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        {stage === "error" ? (
          <AlertCircle className="h-4 w-4 shrink-0 text-danger" strokeWidth={2} />
        ) : stage === "installing" ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" strokeWidth={2} />
        ) : (
          <SparkleIcon className="h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
        )}
        <span className="truncate text-xs font-medium text-ink">
          {stage === "error"
            ? errorMessage
            : stage === "installing"
              ? "Installation de la mise à jour…"
              : `Nouvelle version disponible${version ? ` (${version})` : ""}`}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {stage === "available" && (
          <button
            type="button"
            onClick={onInstall}
            className="cursor-pointer rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Mettre à jour
          </button>
        )}
        {stage !== "installing" && (
          <button
            type="button"
            aria-label="Ignorer"
            onClick={onDismiss}
            className="cursor-pointer rounded-md p-1 text-ink-soft transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
