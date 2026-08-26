import { historyStore } from "./store";
import type { TranscriptionJob } from "../types";

const JOBS_KEY = "jobs";
const INTERRUPTED_MESSAGE = "Traitement interrompu (redémarrage de l'application).";

export async function loadJobHistory(): Promise<TranscriptionJob[]> {
  const jobs = (await historyStore.get<TranscriptionJob[]>(JOBS_KEY)) ?? [];
  return jobs.map(markInterruptedAsError);
}

export async function saveJobHistory(jobs: TranscriptionJob[]): Promise<void> {
  await historyStore.set(JOBS_KEY, jobs);
  await historyStore.save();
}

function markInterruptedAsError(job: TranscriptionJob): TranscriptionJob {
  if (job.status !== "queued" && job.status !== "processing") return job;
  return { ...job, status: "error", errorMessage: INTERRUPTED_MESSAGE };
}
