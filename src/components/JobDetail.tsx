import ProcessingView from "./ProcessingView";
import ErrorView from "./ErrorView";
import ResultView from "./ResultView";
import type { TranscriptionJob } from "../types";

type Props = {
  job: TranscriptionJob;
  copied: boolean;
  onRetry: () => void;
  onTextChange: (text: string) => void;
  onCopy: () => void;
};

export default function JobDetail({ job, copied, onRetry, onTextChange, onCopy }: Props) {
  if (job.status === "queued") return <ProcessingView fileName={job.fileName} queued />;
  if (job.status === "processing") return <ProcessingView fileName={job.fileName} />;
  if (job.status === "error") return <ErrorView message={job.errorMessage} onRetry={onRetry} />;

  return (
    <ResultView
      text={job.resultText}
      onTextChange={onTextChange}
      copied={copied}
      onCopy={onCopy}
    />
  );
}
