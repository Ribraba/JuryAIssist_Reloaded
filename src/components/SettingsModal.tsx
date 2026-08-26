import { useState } from "react";
import { Settings, X, Eye, EyeOff } from "lucide-react";

type Props = {
  initialKey: string;
  initialRules: string;
  onSave: (key: string, rules: string) => void;
  onClose: () => void;
};

export default function SettingsModal({
  initialKey,
  initialRules,
  onSave,
  onClose,
}: Props) {
  const [key, setKey] = useState(initialKey);
  const [rules, setRules] = useState(initialRules);
  const [showKey, setShowKey] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft">
              <Settings className="h-4.5 w-4.5 text-primary" strokeWidth={2} />
            </span>
            <h2 className="text-base font-semibold text-ink">Paramètres</h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            title="Fermer"
            onClick={onClose}
            className="cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmedKey = key.trim();
            if (trimmedKey) onSave(trimmedKey, rules.trim());
          }}
        >
          <label htmlFor="api-key" className="mb-1.5 block text-sm font-medium text-ink">
            Clé API Groq
          </label>
          <div className="relative">
            <input
              id="api-key"
              type={showKey ? "text" : "password"}
              autoFocus
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-11 text-sm text-ink outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="button"
              aria-label={showKey ? "Masquer la clé" : "Afficher la clé"}
              title={showKey ? "Masquer la clé" : "Afficher la clé"}
              onClick={() => setShowKey((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-md p-1.5 text-ink-soft transition-colors duration-150 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {showKey ? (
                <EyeOff className="h-4 w-4" strokeWidth={2} />
              ) : (
                <Eye className="h-4 w-4" strokeWidth={2} />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            Disponible sur console.groq.com, section API Keys.
          </p>

          <label
            htmlFor="business-rules"
            className="mb-1.5 mt-5 block text-sm font-medium text-ink"
          >
            Règles métier (optionnel)
          </label>
          <textarea
            id="business-rules"
            rows={4}
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            placeholder="Ex : mettre les noms des parties en majuscules, structurer le texte par paragraphes, dater chaque intervention…"
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
          <p className="mt-2 text-xs text-ink-soft">
            Si renseignées, ces règles sont appliquées automatiquement pour réorganiser
            le texte après chaque transcription.
          </p>

          <button
            type="submit"
            disabled={!key.trim()}
            className="mt-5 w-full cursor-pointer rounded-lg bg-primary py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
}
