import DatePicker from "./DatePicker";
import { toTimeInputValue } from "../lib/time";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function DateTimeField({ value, onChange }: Props) {
  const date = new Date(value);

  function handleDateChange(day: Date) {
    const next = new Date(value);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next.getTime());
  }

  function handleTimeChange(timeStr: string) {
    if (!timeStr) return;
    const [hours, minutes] = timeStr.split(":").map(Number);
    const next = new Date(value);
    next.setHours(hours, minutes, 0, 0);
    onChange(next.getTime());
  }

  return (
    <div className="flex items-center gap-1.5">
      <DatePicker value={date} onChange={handleDateChange} />
      <input
        type="time"
        value={toTimeInputValue(date)}
        onChange={(e) => handleTimeChange(e.target.value)}
        className="rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}
