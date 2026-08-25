import { AlertCircle, RotateCcw } from "lucide-react";

type Props = {
  message: string;
  onRetry: () => void;
};

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <AlertCircle className="h-8 w-8 text-danger" strokeWidth={2} />
      <p className="max-w-xs text-center text-sm text-ink">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:bg-primary-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
        Réessayer
      </button>
    </div>
  );
}
