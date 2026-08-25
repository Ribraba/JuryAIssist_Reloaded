import { Copy, Check, RotateCcw, FileAudio } from "lucide-react";

type Props = {
  fileName: string;
  text: string;
  onTextChange: (text: string) => void;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
};

export default function ResultView({
  fileName,
  text,
  onTextChange,
  copied,
  onCopy,
  onReset,
}: Props) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2 text-ink-soft">
          <FileAudio className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span className="truncate text-xs">{fileName}</span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
            Nouveau fichier
          </button>
          <button
            type="button"
            onClick={onCopy}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              copied ? "bg-success" : "bg-primary hover:bg-primary-hover"
            }`}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            {copied ? "Copié" : "Copier"}
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="flex-1 resize-none rounded-xl border border-border bg-card p-4 text-[15px] leading-relaxed text-ink outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
