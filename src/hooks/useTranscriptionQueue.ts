import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { baseName } from "../lib/path";
import { describeError } from "../lib/errors";
import { loadJobHistory, saveJobHistory } from "../lib/history";
import {
  COPY_FEEDBACK_DURATION_MS,
  MAX_CONCURRENT_TRANSCRIPTIONS,
  MISSING_API_KEY_MESSAGE,
  RESULT_SAVE_DEBOUNCE_MS,
} from "../constants";
import type { TranscriptionJob } from "../types";

export function useTranscriptionQueue(
  apiKey: string,
  businessRules: string,
  onMissingApiKey: () => void,
) {
  const [jobs, setJobs] = useState<TranscriptionJob[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const jobsRef = useRef<TranscriptionJob[]>([]);
  const apiKeyRef = useRef(apiKey);
  apiKeyRef.current = apiKey;
  const businessRulesRef = useRef(businessRules);
  businessRulesRef.current = businessRules;
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadJobHistory().then((restored) => {
      applyJobs(restored);
      setSelectedId(lastJobId(restored));
    });
  }, []);

  function applyJobs(next: TranscriptionJob[]) {
    jobsRef.current = next;
    setJobs(next);
  }

  function updateJob(id: string, changes: Partial<TranscriptionJob>) {
    applyJobs(jobsRef.current.map((job) => (job.id === id ? { ...job, ...changes } : job)));
  }

  function persistNow() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = null;
    saveJobHistory(jobsRef.current);
  }

  function persistDebounced() {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(persistNow, RESULT_SAVE_DEBOUNCE_MS);
  }

  function enqueue(filePaths: string[]) {
    if (filePaths.length === 0) return;
    if (!apiKeyRef.current) {
      onMissingApiKey();
      return;
    }

    const newJobs = filePaths.map(createQueuedJob);
    applyJobs([...jobsRef.current, ...newJobs]);
    setSelectedId(newJobs[newJobs.length - 1].id);
    persistNow();
    pump();
  }

  function pump() {
    const activeCount = jobsRef.current.filter((job) => job.status === "processing").length;
    const availableSlots = MAX_CONCURRENT_TRANSCRIPTIONS - activeCount;
    if (availableSlots <= 0) return;

    jobsRef.current
      .filter((job) => job.status === "queued")
      .slice(0, availableSlots)
      .forEach(runJob);
  }

  async function runJob(job: TranscriptionJob) {
    if (!apiKeyRef.current) {
      updateJob(job.id, { status: "error", errorMessage: MISSING_API_KEY_MESSAGE });
      persistNow();
      onMissingApiKey();
      return;
    }

    updateJob(job.id, { status: "processing" });
    persistNow();

    try {
      const text = await invoke<string>("transcribe", {
        filePath: job.filePath,
        apiKey: apiKeyRef.current,
        businessRules: businessRulesRef.current,
      });
      updateJob(job.id, { status: "done", resultText: text, completedAt: Date.now() });
    } catch (error) {
      updateJob(job.id, { status: "error", errorMessage: describeError(error) });
    }

    persistNow();
    pump();
  }

  function retry(id: string) {
    updateJob(id, { status: "queued", errorMessage: "" });
    persistNow();
    pump();
  }

  function removeMany(ids: string[]) {
    if (ids.length === 0) return;
    const idsToRemove = new Set(ids);

    applyJobs(jobsRef.current.filter((job) => !idsToRemove.has(job.id)));
    persistNow();
    if (selectedId && idsToRemove.has(selectedId)) {
      setSelectedId(lastJobId(jobsRef.current));
    }
  }

  function clearFinished() {
    const finishedIds = jobsRef.current
      .filter((job) => job.status === "done" || job.status === "error")
      .map((job) => job.id);
    removeMany(finishedIds);
  }

  function setResultText(id: string, text: string) {
    updateJob(id, { resultText: text });
    persistDebounced();
  }

  async function copyResult(id: string) {
    const job = jobsRef.current.find((j) => j.id === id);
    if (!job) return;

    await navigator.clipboard.writeText(job.resultText);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId((current) => (current === id ? null : current));
    }, COPY_FEEDBACK_DURATION_MS);
  }

  return {
    jobs,
    selectedId,
    selectJob: setSelectedId,
    copiedId,
    enqueue,
    retry,
    removeMany,
    clearFinished,
    setResultText,
    copyResult,
  };
}

function createQueuedJob(filePath: string): TranscriptionJob {
  return {
    id: crypto.randomUUID(),
    filePath,
    fileName: baseName(filePath),
    status: "queued",
    resultText: "",
    errorMessage: "",
    createdAt: Date.now(),
  };
}

function lastJobId(jobs: TranscriptionJob[]): string | null {
  return jobs.length > 0 ? jobs[jobs.length - 1].id : null;
}
