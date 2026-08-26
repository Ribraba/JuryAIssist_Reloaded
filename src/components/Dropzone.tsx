import { UploadCloud } from "lucide-react";

type Props = {
  isDragging: boolean;
  draggedCount?: number;
  onBrowse: () => void;
};

export default function Dropzone({ isDragging, draggedCount = 0, onBrowse }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onBrowse}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onBrowse();
      }}
      className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isDragging
          ? "border-primary bg-primary-soft"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="relative">
        <UploadCloud
          className={`h-10 w-10 ${isDragging ? "text-primary" : "text-ink-soft"}`}
          strokeWidth={1.5}
        />
        {isDragging && draggedCount > 0 && (
          <span className="absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white">
            {draggedCount}
          </span>
        )}
      </div>
      <p className="text-base font-medium text-ink">
        {isDragging ? "Déposez les fichiers" : "Glissez un ou plusieurs fichiers audio"}
      </p>
      {!isDragging && (
        <>
          <p className="text-sm text-ink-soft">ou cliquez pour parcourir</p>
          <p className="mt-2 text-xs text-ink-soft">
            MP3 · WAV · M4A · OGG · DSS — 25 Mo max chacun
          </p>
        </>
      )}
    </div>
  );
}
