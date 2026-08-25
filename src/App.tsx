import { useEffect, useState } from "react";
import Header from "./components/Header";
import Dropzone from "./components/Dropzone";
import ProcessingView from "./components/ProcessingView";
import ErrorView from "./components/ErrorView";
import ResultView from "./components/ResultView";
import SettingsModal from "./components/SettingsModal";
import { useApiKey } from "./hooks/useApiKey";
import { useTranscription } from "./hooks/useTranscription";
import { useAudioDrop } from "./hooks/useAudioDrop";
import { pickAudioFile } from "./lib/filePicker";
import "./App.css";

function App() {
  const { apiKey, isLoaded, saveApiKey } = useApiKey();
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isLoaded && !apiKey) setShowSettings(true);
  }, [isLoaded, apiKey]);

  const {
    status,
    fileName,
    resultText,
    setResultText,
    errorMessage,
    copied,
    transcribe,
    reset,
    copyResult,
  } = useTranscription(apiKey, () => setShowSettings(true));

  const { isDragging } = useAudioDrop(transcribe, status === "processing");

  async function handleBrowse() {
    const filePath = await pickAudioFile();
    if (filePath) transcribe(filePath);
  }

  async function handleSaveApiKey(key: string) {
    await saveApiKey(key);
    setShowSettings(false);
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onOpenSettings={() => setShowSettings(true)} />

      <main className="flex flex-1 flex-col overflow-hidden p-6">
        {(status === "idle" || isDragging) && (
          <Dropzone isDragging={isDragging} onBrowse={handleBrowse} />
        )}
        {status === "processing" && <ProcessingView fileName={fileName} />}
        {status === "error" && <ErrorView message={errorMessage} onRetry={reset} />}
        {status === "done" && (
          <ResultView
            fileName={fileName}
            text={resultText}
            onTextChange={setResultText}
            copied={copied}
            onCopy={copyResult}
            onReset={reset}
          />
        )}
      </main>

      {isLoaded && showSettings && (
        <SettingsModal
          initialKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
