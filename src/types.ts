export type JobStatus = "queued" | "processing" | "done" | "error";

export type TranscriptionJob = {
  id: string;
  filePath: string;
  fileName: string;
  status: JobStatus;
  resultText: string;
  errorMessage: string;
  createdAt: number;
  completedAt?: number;
};
