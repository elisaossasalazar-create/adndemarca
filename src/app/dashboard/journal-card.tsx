"use client";

import { useTransition } from "react";
import { markJournalComplete } from "@/app/actions";
import { POINTS } from "@/lib/challenges";

export default function JournalCard({ done }: { done: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={`rounded-2xl border p-5 ${done ? "border-neutral-200 bg-neutral-50" : "border-neutral-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            Reto diario
          </p>
          <h3 className="mt-1 text-base font-semibold text-neutral-900">
            Journaling
          </h3>
          <p className="mt-1 text-sm text-neutral-600">
            Escribe 3 páginas de journal — reflexión libre, autoconocimiento.
          </p>
          <p className="mt-2 text-xs text-neutral-400">
            +{POINTS.JOURNAL_DAILY} puntos
          </p>
        </div>

        {done ? (
          <span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white">
            ✓
          </span>
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(() => markJournalComplete())}
            className="mt-1 flex-shrink-0 rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
          >
            {pending ? "…" : "Hecho"}
          </button>
        )}
      </div>

      {done && (
        <p className="mt-3 text-xs text-neutral-500">
          ✓ Completado hoy · +{POINTS.JOURNAL_DAILY} pts sumados
        </p>
      )}
    </div>
  );
}
