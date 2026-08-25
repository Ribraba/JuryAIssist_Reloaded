import { Loader2 } from "lucide-react";

type Props = {
  fileName: string;
};

export default function ProcessingView({ fileName }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={2} />
      <p className="text-sm font-medium text-ink">Transcription en cours…</p>
      <p className="max-w-xs truncate text-xs text-ink-soft">{fileName}</p>
    </div>
  );
}
