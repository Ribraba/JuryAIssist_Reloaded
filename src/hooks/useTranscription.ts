import { useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { baseName } from "../lib/path";
import { COPY_FEEDBACK_DURATION_MS } from "../constants";

export type TranscriptionStatus = "idle" | "processing" | "done" | "error";

const DEFAULT_ERROR_MESSAGE = "Une erreur est survenue.";

export function useTranscription(apiKey: string, onMissingApiKey: () => void) {
  const [status, setStatus] = useState<TranscriptionStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [resultText, setResultText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;

  async function transcribe(filePath: string) {
    if (!apiKeyRef.current) {
      onMissingApiKey();
      return;
    }

    beginTranscription(filePath);
    try {
      const text = await invoke<string>("transcribe", {
        filePath,
        apiKey: apiKeyRef.current,
      });
      completeWithResult(text);
    } catch (error) {
      completeWithError(error);
    }
  }

  function beginTranscription(filePath: string) {
    setFileName(baseName(filePath));
    setErrorMessage("");
    setStatus("processing");
  }

  function completeWithResult(text: string) {
    setResultText(text);
    setStatus("done");
  }

  function completeWithError(error: unknown) {
    setErrorMessage(typeof error === "string" ? error : DEFAULT_ERROR_MESSAGE);
    setStatus("error");
  }

  function reset() {
    setStatus("idle");
    setResultText("");
    setFileName("");
    setErrorMessage("");
  }

  async function copyResult() {
    await navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
  }

  return {
    status,
    fileName,
    resultText,
    setResultText,
    errorMessage,
    copied,
    transcribe,
    reset,
    copyResult,
  };
}
