"use client";

import { useRef, useState, useTransition } from "react";
import { markExtraComplete } from "@/app/actions";
import { POINTS, type Challenge } from "@/lib/challenges";
import { Star } from "@/components/star";

interface Props {
  challenge: Challenge;
  done: boolean;
  evidenceFilename?: string;
}

export default function ExtraChallengeCard({ challenge, done, evidenceFilename }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [fileSelected, setFileSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) { setError("Adjunta una foto de evidencia para continuar."); return; }

    const formData = new FormData();
    formData.set("challengeId", challenge.id);
    formData.set("evidence", file);

    startTransition(async () => {
      try {
        await markExtraComplete(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al subir la evidencia.");
      }
    });
  }

  return (
    <div
      className="rounded-2xl border"
      style={done
        ? { borderColor: "var(--brand-yellow)", backgroundColor: "#fffdf0" }
        : { borderColor: "#e5e5e5", backgroundColor: "white" }
      }
    >
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          {done ? (
            <span
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "var(--brand-yellow)" }}
            >
              <Star size={13} />
            </span>
          ) : (
            <span
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2"
              style={{ borderColor: "var(--brand-pink)" }}
            />
          )}
          <span className={`text-sm font-medium lowercase ${done ? "text-neutral-400" : "text-neutral-900"}`}>
            {challenge.title}
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-xs font-normal text-neutral-400">+{POINTS.EXTRA_CHALLENGE} pts</span>
          <span className="text-neutral-400 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded panel */}
      {expanded && (
        <div className="border-t border-neutral-100 px-5 pb-5 pt-4">
          <p className="text-sm font-normal text-neutral-700 leading-relaxed">{challenge.description}</p>

          {done ? (
            <div className="mt-4">
              <p className="text-xs text-neutral-500 mb-2">Evidencia entregada:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/files/${evidenceFilename}`}
                alt="Evidencia del reto"
                className="max-h-48 rounded-xl object-cover"
              />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-xs">
                <span className="font-medium text-neutral-600 uppercase tracking-wide">
                  Foto de evidencia <span className="text-red-500">*</span>
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  name="evidence"
                  accept="image/*"
                  required
                  onChange={(e) => setFileSelected(!!e.target.files?.[0])}
                  className="text-xs text-neutral-600 file:mr-3 file:rounded-full file:border-0 file:px-3 file:py-1 file:text-xs file:font-bold file:text-white"
                  style={{ ["--file-bg" as string]: "var(--brand-pink)" }}
                />
              </label>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={pending || !fileSelected}
                className="self-start rounded-full px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-40"
                style={{ backgroundColor: "var(--brand-pink)" }}
              >
                {pending ? "subiendo…" : "marcar como completado"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
