import { useEffect, useState } from "react";
import Header from "./components/Header";
import Dropzone from "./components/Dropzone";
import JobList from "./components/JobList";
import JobDetail from "./components/JobDetail";
import SettingsModal from "./components/SettingsModal";
import UpdateBanner from "./components/UpdateBanner";
import { useStoredSetting } from "./hooks/useStoredSetting";
import { useTranscriptionQueue } from "./hooks/useTranscriptionQueue";
import { useAudioDrop } from "./hooks/useAudioDrop";
import { useAppUpdate } from "./hooks/useAppUpdate";
import { pickAudioFiles } from "./lib/filePicker";
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
    jobs,
    selectedId,
    selectJob,
    copiedId,
    enqueue,
    retry,
    removeMany,
    clearFinished,
    setResultText,
    copyResult,
  } = useTranscriptionQueue(apiKey, businessRules, () => setShowSettings(true));

  const { isDragging, draggedCount } = useAudioDrop(enqueue);

  async function handleBrowse() {
    const filePaths = await pickAudioFiles();
    if (filePaths.length > 0) enqueue(filePaths);
  }

  async function handleSaveSettings(key: string, rules: string) {
    await saveApiKey(key);
    await saveBusinessRules(rules);
    setShowSettings(false);
  }

  const selectedJob = jobs.find((job) => job.id === selectedId) ?? null;

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

      <main className="relative flex flex-1 overflow-hidden">
        {jobs.length > 0 ? (
          <>
            <JobList
              jobs={jobs}
              selectedId={selectedId}
              onSelect={selectJob}
              onAdd={handleBrowse}
              onRetry={retry}
              onRemoveMany={removeMany}
              onClearFinished={clearFinished}
            />
            <div className="flex flex-1 flex-col overflow-hidden p-6">
              {selectedJob && (
                <JobDetail
                  job={selectedJob}
                  copied={copiedId === selectedJob.id}
                  onRetry={() => retry(selectedJob.id)}
                  onTextChange={(text) => setResultText(selectedJob.id, text)}
                  onCopy={() => copyResult(selectedJob.id)}
                />
              )}
            </div>
            {isDragging && (
              <div className="absolute inset-6 z-10 flex">
                <Dropzone isDragging draggedCount={draggedCount} onBrowse={handleBrowse} />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 p-6">
            <Dropzone isDragging={isDragging} draggedCount={draggedCount} onBrowse={handleBrowse} />
          </div>
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
