import { Copy, Check } from "lucide-react";

type Props = {
  text: string;
  onTextChange: (text: string) => void;
  copied: boolean;
  onCopy: () => void;
};

export default function ResultView({ text, onTextChange, copied, onCopy }: Props) {
  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCopy}
          className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
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
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        className="flex-1 resize-none rounded-xl border border-border bg-card p-4 text-[15px] leading-relaxed text-ink outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
