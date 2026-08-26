import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, addMonths, getMonthGrid, isSameDay } from "../lib/calendar";

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

const WEEKDAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];
const MONTH_LABEL = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" });
const TRIGGER_LABEL = new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
const DAY_LABEL = (day: Date) =>
  day.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

export default function DatePicker({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(value);
  const [focusedDay, setFocusedDay] = useState(value);
  const [popoverPosition, setPopoverPosition] = useState({ top: 0, left: 0 });

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const dayRefs = useRef(new Map<string, HTMLButtonElement>());

  function open() {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setPopoverPosition({ top: rect.bottom + 4, left: rect.left });
    setVisibleMonth(value);
    setFocusedDay(value);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (isOpen) dayRefs.current.get(focusedDay.toDateString())?.focus();
  }, [isOpen, focusedDay]);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close();
    }

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  function selectDay(day: Date) {
    onChange(day);
    close();
    triggerRef.current?.focus();
  }

  function handleGridKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const stepByKey: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (e.key in stepByKey) {
      e.preventDefault();
      const next = addDays(focusedDay, stepByKey[e.key]);
      setFocusedDay(next);
      if (next.getMonth() !== visibleMonth.getMonth()) setVisibleMonth(next);
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectDay(focusedDay);
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      triggerRef.current?.focus();
    }
  }

  const grid = getMonthGrid(visibleMonth);

  return (
    <div className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? close() : open())}
        title="Choisir une date"
        aria-label="Choisir une date"
        className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-ink outline-none transition-colors duration-150 hover:border-primary/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
      >
        <Calendar className="h-3.5 w-3.5 shrink-0 text-ink-soft" strokeWidth={2} />
        {TRIGGER_LABEL.format(value)}
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Calendrier"
            style={{ position: "fixed", top: popoverPosition.top, left: popoverPosition.left }}
            className="z-50 w-60 rounded-xl border border-border bg-card p-3 shadow-xl"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Mois précédent"
                title="Mois précédent"
                onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
                className="cursor-pointer rounded-md p-1 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
              <span className="text-xs font-medium capitalize text-ink">
                {MONTH_LABEL.format(visibleMonth)}
              </span>
              <button
                type="button"
                aria-label="Mois suivant"
                title="Mois suivant"
                onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
                className="cursor-pointer rounded-md p-1 text-ink-soft transition-colors duration-150 hover:bg-primary-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {WEEKDAY_LABELS.map((label, i) => (
                <span
                  key={i}
                  className="flex h-6 items-center justify-center text-[11px] font-medium text-ink-soft"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5" onKeyDown={handleGridKeyDown}>
              {grid.map((day) => {
                const inMonth = day.getMonth() === visibleMonth.getMonth();
                const isSelected = isSameDay(day, value);
                const isToday = isSameDay(day, new Date());
                return (
                  <button
                    key={day.toDateString()}
                    ref={(el) => {
                      if (el) dayRefs.current.set(day.toDateString(), el);
                      else dayRefs.current.delete(day.toDateString());
                    }}
                    type="button"
                    tabIndex={isSameDay(day, focusedDay) ? 0 : -1}
                    onClick={() => selectDay(day)}
                    onFocus={() => setFocusedDay(day)}
                    aria-label={DAY_LABEL(day)}
                    aria-pressed={isSelected}
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isSelected
                        ? "bg-primary font-medium text-white"
                        : `hover:bg-primary-soft ${inMonth ? "text-ink" : "text-ink-soft/50"}`
                    } ${isToday && !isSelected ? "font-semibold text-primary" : ""}`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
