import { Clock, Loader2 } from "lucide-react";

type Props = {
  fileName: string;
  queued?: boolean;
};

export default function ProcessingView({ fileName, queued = false }: Props) {
  const Icon = queued ? Clock : Loader2;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <Icon
        className={`h-8 w-8 text-primary ${queued ? "" : "animate-spin"}`}
        strokeWidth={2}
      />
      <p className="text-sm font-medium text-ink">
        {queued ? "En file d'attente…" : "Transcription en cours…"}
      </p>
      <p className="max-w-xs truncate text-xs text-ink-soft">{fileName}</p>
    </div>
  );
}
