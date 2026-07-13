"use client";

import { useState, useEffect } from "react";

type ResourceCategory = "libro" | "video" | "podcast" | "substack";
type FilterCategory = "todos" | ResourceCategory;

interface Resource {
  id: string;
  category: ResourceCategory;
  title: string;
  description: string;
  url: string;
  created_at: string;
}

const CATEGORIES: { value: ResourceCategory; label: string; emoji: string; color: string }[] = [
  { value: "libro",    label: "Libros",    emoji: "📚", color: "var(--brand-yellow)" },
  { value: "video",    label: "Videos",    emoji: "▶️",  color: "var(--brand-pink)"   },
  { value: "podcast",  label: "Podcasts",  emoji: "🎙️", color: "var(--brand-blue)"   },
  { value: "substack", label: "Substack",  emoji: "✉️",  color: "#e8e0ff"             },
];

function catMeta(cat: ResourceCategory) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0];
}

interface Props {
  isAdmin: boolean;
}

export default function ResourcesTab({ isAdmin }: Props) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>("todos");

  useEffect(() => {
    fetch("/api/resources")
      .then((r) => r.json())
      .then((data) => setResources(data.resources ?? []))
      .catch(() => {/* ignore, show empty */})
      .finally(() => setLoading(false));
  }, []);

  // Admin form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: "libro" as ResourceCategory, title: "", description: "", url: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = filter === "todos" ? resources : resources.filter((r) => r.category === filter);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo publicar.");
        return;
      }
      setResources([data.resource, ...resources]);
      setForm({ category: "libro", title: "", description: "", url: "" });
      setShowForm(false);
    } catch {
      setError("Error al publicar. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleted(id: string) {
    setResources((rs) => rs.filter((r) => r.id !== id));
  }

  if (loading) {
    return (
      <div className="py-16 text-center text-sm text-neutral-400">Cargando recursos…</div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg flex flex-col gap-5">

      {/* Admin: add resource button / form */}
      {isAdmin && (
        <div className="rounded-2xl border border-neutral-100 p-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full text-sm font-medium text-neutral-400 hover:text-neutral-700 transition-colors text-left"
            >
              + agregar recurso
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Nuevo recurso</p>

              {/* Category selector */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, category: cat.value }))}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors border"
                    style={
                      form.category === cat.value
                        ? { backgroundColor: cat.color, borderColor: "transparent", color: "#1a1a1a" }
                        : { backgroundColor: "white", borderColor: "#e5e5e5", color: "#737373" }
                    }
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              <input
                type="text"
                required
                placeholder="Título"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                maxLength={120}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#FF63A6] transition-colors"
              />

              <textarea
                placeholder="Descripción corta (opcional)"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                maxLength={300}
                rows={2}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#FF63A6] transition-colors resize-none"
              />

              <input
                type="url"
                required
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-[#FF63A6] transition-colors"
              />

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null); }}
                  className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-500 hover:border-neutral-400 transition-colors"
                >
                  cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full px-5 py-1.5 text-xs font-bold text-white disabled:opacity-40 transition hover:opacity-90"
                  style={{ backgroundColor: "var(--brand-pink)" }}
                >
                  {submitting ? "publicando…" : "publicar"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        <FilterPill label="Todos" active={filter === "todos"} onClick={() => setFilter("todos")} />
        {CATEGORIES.map((cat) => (
          <FilterPill
            key={cat.value}
            label={`${cat.emoji} ${cat.label}`}
            active={filter === cat.value}
            onClick={() => setFilter(cat.value)}
            activeColor={cat.color}
          />
        ))}
      </div>

      {/* Feed */}
      {visible.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-neutral-400">
            {filter === "todos"
              ? "Aún no hay recursos publicados."
              : `No hay recursos en esta categoría todavía.`}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((r) => (
            <ResourceCard key={r.id} resource={r} isAdmin={isAdmin} onDeleted={() => handleDeleted(r.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  activeColor,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  activeColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors border"
      style={
        active
          ? { backgroundColor: activeColor ?? "var(--brand-pink)", borderColor: "transparent", color: activeColor ? "#1a1a1a" : "white" }
          : { backgroundColor: "white", borderColor: "#e5e5e5", color: "#737373" }
      }
    >
      {label}
    </button>
  );
}

function ResourceCard({
  resource,
  isAdmin,
  onDeleted,
}: {
  resource: Resource;
  isAdmin: boolean;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const meta = catMeta(resource.category);

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${resource.title}"?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resources/${resource.id}`, { method: "DELETE" });
      if (res.ok) onDeleted();
    } catch {
      // silently ignore
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-100 p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Category badge */}
          <span
            className="text-[10px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 flex-shrink-0"
            style={{ backgroundColor: meta.color, color: "#1a1a1a" }}
          >
            {meta.emoji} {meta.label}
          </span>
        </div>
        {isAdmin && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Eliminar recurso"
            className="text-[10px] text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {deleting ? "…" : "✕"}
          </button>
        )}
      </div>

      <p className="text-sm font-bold text-neutral-900 leading-snug">{resource.title}</p>

      {resource.description && (
        <p className="text-xs text-neutral-500 leading-relaxed">{resource.description}</p>
      )}

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-70"
        style={{ color: "var(--brand-pink)" }}
      >
        ver recurso →
      </a>
    </div>
  );
}
