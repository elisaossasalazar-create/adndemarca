"use client";

import { useState, useRef } from "react";

export default function RestoreResourcesForm() {
  const [status, setStatus] = useState<"idle" | "uploading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) return;
    if (!confirm(`¿Restaurar recursos desde "${file.name}"? Los recursos existentes no se tocarán; solo se importarán los que falten.`)) return;

    setStatus("uploading");
    setMessage("");
    try {
      const body = new FormData();
      body.append("db", file);
      const res = await fetch("/api/admin/restore-resources", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error ?? "Error desconocido");
        return;
      }
      setStatus("ok");
      setMessage(`${data.imported} recurso(s) importado(s) de ${data.total} en el backup.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setStatus("error");
      setMessage("Error de conexión.");
    }
  }

  return (
    <section className="mb-12">
      <h2 className="text-base font-semibold text-neutral-900 mb-4">Restaurar recursos</h2>
      <div className="border border-neutral-200 rounded-2xl p-6">
        <p className="text-xs text-neutral-500 mb-4">
          Sube un backup <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">.db</code> para restaurar los recursos que falten. Los recursos ya existentes no se duplicarán.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <input
            ref={inputRef}
            type="file"
            accept=".db"
            required
            className="text-xs text-neutral-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-neutral-200 file:text-xs file:font-medium file:text-neutral-700 file:bg-neutral-50 file:cursor-pointer hover:file:bg-neutral-100 transition-colors"
          />
          <button
            type="submit"
            disabled={status === "uploading"}
            className="text-xs font-semibold bg-neutral-900 text-white px-4 py-2 rounded-full hover:bg-neutral-700 transition-colors disabled:opacity-40"
          >
            {status === "uploading" ? "restaurando…" : "restaurar"}
          </button>
          {status === "ok" && <span className="text-xs text-green-600 font-medium">✓ {message}</span>}
          {status === "error" && <span className="text-xs text-red-500">{message}</span>}
        </form>
      </div>
    </section>
  );
}
