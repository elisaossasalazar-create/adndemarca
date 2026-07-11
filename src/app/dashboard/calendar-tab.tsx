"use client";

import { useState } from "react";
import { Star } from "@/components/star";

const DAY_LABELS = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

interface Props {
  completedDates: string[];
  courseStartDate: string;
}

function toUTCDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarTab({ completedDates, courseStartDate }: Props) {
  const completedSet = new Set(completedDates);
  const courseStart = new Date(courseStartDate + "T00:00:00Z");
  const todayStr = new Date().toISOString().slice(0, 10);

  const [viewYear, setViewYear] = useState(() => new Date().getUTCFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getUTCMonth());

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const firstDay = new Date(Date.UTC(viewYear, viewMonth, 1));
  const lastDay = new Date(Date.UTC(viewYear, viewMonth + 1, 0));
  const startOffset = firstDay.getUTCDay();
  const daysInMonth = lastDay.getUTCDate();

  const cells: Array<{ day: number | null; dateStr: string | null }> = [];
  for (let i = 0; i < startOffset; i++) cells.push({ day: null, dateStr: null });
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: toUTCDateString(viewYear, viewMonth, d) });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null, dateStr: null });

  const completedThisMonth = completedDates.filter(
    (d) => d.startsWith(`${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`)
  ).length;

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <div className="text-center">
          <p className="text-sm font-bold lowercase text-neutral-900">
            {MONTH_NAMES[viewMonth].toLowerCase()} {viewYear}
          </p>
          {completedThisMonth > 0 && (
            <p className="text-xs font-normal text-neutral-500 flex items-center justify-center gap-1 mt-0.5">
              <Star size={11} />
              {completedThisMonth} día{completedThisMonth !== 1 ? "s" : ""} de journaling
            </p>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 transition-colors"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 text-center">
        {DAY_LABELS.map((label) => (
          <div key={label} className="py-1 text-[10px] font-medium uppercase tracking-wide text-neutral-400">
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((cell, i) => {
          if (!cell.day || !cell.dateStr) {
            return <div key={`empty-${i}`} className="h-9" />;
          }

          const dateStr = cell.dateStr;
          const isToday = dateStr === todayStr;
          const isCompleted = completedSet.has(dateStr);
          const isBeforeStart = new Date(dateStr + "T00:00:00Z") < courseStart;
          const isAfterToday = dateStr > todayStr;

          return (
            <div key={dateStr} className="flex h-9 flex-col items-center justify-center">
              <div
                className={`relative flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs transition-all
                  ${isBeforeStart || isAfterToday ? "text-neutral-300" : "text-neutral-700"}
                `}
                style={{
                  backgroundColor: isCompleted ? "var(--brand-yellow)" : undefined,
                  ...(isToday ? { outline: `2px solid var(--brand-pink)`, outlineOffset: "2px" } : {}),
                }}
              >
                {isCompleted ? (
                  <Star size={18} />
                ) : (
                  <span className="text-xs leading-none font-medium">
                    {cell.day}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center gap-5 text-xs text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--brand-yellow)" }}
          >
            <Star size={10} />
          </div>
          <span>Journaling hecho</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-5 w-5 rounded-full"
            style={{ outline: "2px solid var(--brand-pink)", outlineOffset: "2px" }}
          />
          <span>Hoy</span>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-neutral-400">
        Curso: 19 jul → 22 ago 2026
      </p>
    </div>
  );
}
