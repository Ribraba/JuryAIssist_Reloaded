import { useState } from "react";
import { KeyRound, X, Eye, EyeOff } from "lucide-react";

type Props = {
  initialKey: string;
  onSave: (key: string) => void;
  onClose: () => void;
};

export default function SettingsModal({ initialKey, onSave, onClose }: Props) {
  const [value, setValue] = useState(initialKey);
  const [show, setShow] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
              <KeyRound className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
            </span>
            <h2 className="text-base font-semibold text-ink">Clé API Groq</h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed) onSave(trimmed);
          }}
        >
          <label
            htmlFor="api-key"
            className="mb-1.5 block text-sm font-medium text-ink"
          >
            Clé API
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={show ? "text" : "password"}
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="gsk_..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-11 text-sm text-ink outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              aria-label={show ? "Masquer la clé" : "Afficher la clé"}
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {show ? (
                <EyeOff className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Disponible sur console.groq.com, section API Keys.
          </p>

          <button
            type="submit"
            disabled={!value.trim()}
            className="mt-5 w-full cursor-pointer rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
