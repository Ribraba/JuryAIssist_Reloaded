import { useEffect, useState } from "react";
import Header from "./components/Header";
import Dropzone from "./components/Dropzone";
import ProcessingView from "./components/ProcessingView";
import ErrorView from "./components/ErrorView";
import ResultView from "./components/ResultView";
import SettingsModal from "./components/SettingsModal";
import UpdateBanner from "./components/UpdateBanner";
import { useStoredSetting } from "./hooks/useStoredSetting";
import { useTranscription } from "./hooks/useTranscription";
import { useAudioDrop } from "./hooks/useAudioDrop";
import { useAppUpdate } from "./hooks/useAppUpdate";
import { pickAudioFile } from "./lib/filePicker";
import "./App.css";

function App() {
  const { value: apiKey, isLoaded: apiKeyLoaded, save: saveApiKey } = useStoredSetting("apiKey");
  const {
    value: businessRules,
    isLoaded: businessRulesLoaded,
    save: saveBusinessRules,
  } = useStoredSetting("businessRules");
  const settingsLoaded = apiKeyLoaded && businessRulesLoaded;

  const [showSettings, setShowSettings] = useState(false);
  const updateState = useAppUpdate();

  useEffect(() => {
    if (settingsLoaded && !apiKey) setShowSettings(true);
  }, [settingsLoaded, apiKey]);

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
  } = useTranscription(apiKey, businessRules, () => setShowSettings(true));

  const { isDragging } = useAudioDrop(transcribe, status === "processing");

  async function handleBrowse() {
    const filePath = await pickAudioFile();
    if (filePath) transcribe(filePath);
  }

  async function handleSaveSettings(key: string, rules: string) {
    await saveApiKey(key);
    await saveBusinessRules(rules);
    setShowSettings(false);
  }

  return (
    <div className="flex h-screen flex-col">
      <Header onOpenSettings={() => setShowSettings(true)} />
      <UpdateBanner
        stage={updateState.stage}
        version={updateState.version}
        errorMessage={updateState.errorMessage}
        onInstall={updateState.installUpdate}
        onDismiss={updateState.dismiss}
      />

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

      {settingsLoaded && showSettings && (
        <SettingsModal
          initialKey={apiKey}
          initialRules={businessRules}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

export default App;
