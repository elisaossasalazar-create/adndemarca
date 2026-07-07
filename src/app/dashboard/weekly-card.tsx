"use client";

import { useTransition } from "react";
import { markWeeklyComplete } from "@/app/actions";
import { POINTS } from "@/lib/challenges";

export default function WeeklyCard({ done, week }: { done: boolean; week: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`rounded-2xl border p-5 ${done ? "border-neutral-200 bg-neutral-50" : "border-neutral-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Reto semanal · Semana {week}
          </p>
          <h3 className="mt-1 text-base font-semibold text-neutral-900">
            Comunidad de Hotmart
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Sube tu entregable de esta semana a la comunidad de Hotmart.
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            +{POINTS.WEEKLY_HOTMART} puntos
          </p>
        </div>

        {done ? (
          <span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
            ✓
          </span>
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(() => markWeeklyComplete())}
            className="mt-1 flex-shrink-0 rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "…" : "Hecho"}
          </button>
        )}
      </div>

      {done && (
        <p className="mt-3 text-xs text-neutral-500">
          ✓ Completado esta semana · +{POINTS.WEEKLY_HOTMART} pts sumados
        </p>
      )}
    </div>
  );
}
