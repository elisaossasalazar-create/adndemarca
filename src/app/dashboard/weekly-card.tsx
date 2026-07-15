"use client";

import { useTransition } from "react";
import { markWeeklyComplete } from "@/app/actions";
import { POINTS } from "@/lib/challenges";
import { Star } from "@/components/star";

export default function WeeklyCard({ done, week }: { done: boolean; week: number }) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className="rounded-2xl border p-5"
      style={done
        ? { borderColor: "var(--brand-yellow)", backgroundColor: "#fffdf0" }
        : { borderColor: "#e5e5e5", backgroundColor: "white" }
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
            Reto semanal · Semana {week}
          </p>
          <h3 className="mt-1 text-base font-bold lowercase text-neutral-900">
            reto de comunidad
          </h3>
          <p className="mt-1 text-sm font-normal text-neutral-600">
            Sube tu entregable de esta semana a la sección de comunidad.
          </p>
          <p className="mt-2 text-xs font-normal text-neutral-400">
            +{POINTS.WEEKLY_HOTMART} puntos
          </p>
        </div>

        {done ? (
          <span
            className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
            style={{ backgroundColor: "var(--brand-yellow)" }}
          >
            <Star size={16} />
          </span>
        ) : (
          <button
            disabled={pending}
            onClick={() => startTransition(() => markWeeklyComplete())}
            className="mt-1 flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--brand-pink)" }}
          >
            {pending ? "…" : "hecho"}
          </button>
        )}
      </div>

      {done && (
        <p className="mt-3 text-xs font-normal text-neutral-500 flex items-center gap-1">
          <Star size={12} />
          completado esta semana · +{POINTS.WEEKLY_HOTMART} pts sumados
        </p>
      )}
    </div>
  );
}
