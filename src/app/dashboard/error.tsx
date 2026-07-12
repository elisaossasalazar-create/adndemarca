"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard] client error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 max-w-lg w-full">
        <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-3">
          The Brand Camp · ADN de Marca
        </p>
        <h1 className="text-lg font-bold lowercase text-neutral-900 mb-3">
          algo salió mal
        </h1>
        {error?.message && (
          <pre className="text-xs font-mono bg-neutral-50 rounded-xl px-4 py-3 text-red-600 whitespace-pre-wrap break-all mb-4">
            {error.message}
          </pre>
        )}
        {error?.digest && (
          <p className="text-xs text-neutral-400 mb-4">Error ID: {error.digest}</p>
        )}
        <p className="text-xs text-neutral-500 mb-4">
          Captura este mensaje y compártelo para que podamos resolverlo.
        </p>
        <button
          onClick={() => unstable_retry()}
          className="rounded-full px-5 py-2 text-sm font-bold text-white"
          style={{ backgroundColor: "#FF63A6" }}
        >
          intentar de nuevo
        </button>
      </div>
    </div>
  );
}
