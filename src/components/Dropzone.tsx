import { UploadCloud } from "lucide-react";

type Props = {
  isDragging: boolean;
  onBrowse: () => void;
};

export default function Dropzone({ isDragging, onBrowse }: Props) {
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
      <UploadCloud
        className={`h-10 w-10 ${isDragging ? "text-primary" : "text-ink-soft"}`}
        strokeWidth={1.5}
      />
      <p className="text-base font-medium text-ink">
        {isDragging ? "Déposez le fichier" : "Glissez un fichier audio"}
      </p>
      {!isDragging && (
        <>
          <p className="text-sm text-ink-soft">ou cliquez pour parcourir</p>
          <p className="mt-2 text-xs text-ink-soft">
            MP3 · WAV · M4A · OGG · DSS — 25 Mo max
          </p>
        </>
      )}
    </div>
  );
}
