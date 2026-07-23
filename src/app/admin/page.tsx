import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllUsersWithStats, getAllExtraCompletions } from "@/lib/db";
import { getEffectivePoints } from "@/lib/points.server";
import { updatePointSettings } from "./actions";
import { ALL_CHALLENGES } from "@/lib/challenges";
import AdminUserRows from "./user-rows";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail || session.user.email?.toLowerCase() !== adminEmail) redirect("/dashboard");

  const users = getAllUsersWithStats();
  const allExtras = getAllExtraCompletions();
  const extrasByUser: Record<string, typeof allExtras> = {};
  for (const ec of allExtras) {
    (extrasByUser[ec.user_id] ??= []).push(ec);
  }
  const challengeInfo = ALL_CHALLENGES.map((c) => ({ id: c.id, week: c.week, title: c.title }));

  const pts = getEffectivePoints();
  const journalPoints = pts.JOURNAL_DAILY;
  const weeklyPoints = pts.WEEKLY_HOTMART;
  const extraPoints = pts.EXTRA_CHALLENGE;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-10">
          <a
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            ← Dashboard
          </a>
          <div className="mt-3 flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold lowercase text-neutral-900">panel de administración</h1>
            <a
              href="/api/admin/backup"
              download
              className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-xs font-semibold text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 transition-colors whitespace-nowrap"
            >
              ↓ backup .db
            </a>
          </div>
          <p className="mt-1 text-xs tracking-[0.2em] uppercase text-neutral-400">The Brand Camp · ADN de Marca · 7ma Edición</p>
        </div>

        {/* ── Configuración de puntos ── */}
        <section className="mb-12">
          <h2 className="text-base font-semibold text-neutral-900 mb-4">Configuración de puntos</h2>
          <div className="border border-neutral-200 rounded-2xl p-6">
            <form action={updatePointSettings}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide">
                    Journaling diario
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="points_journal"
                      defaultValue={journalPoints}
                      min={1}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <span className="text-xs text-neutral-400 whitespace-nowrap">pts</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide">
                    Reto Hotmart semanal
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="points_weekly"
                      defaultValue={weeklyPoints}
                      min={1}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <span className="text-xs text-neutral-400 whitespace-nowrap">pts</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1 uppercase tracking-wide">
                    Reto extra
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="points_extra"
                      defaultValue={extraPoints}
                      min={1}
                      className="w-full border border-neutral-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                    <span className="text-xs text-neutral-400 whitespace-nowrap">pts</span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  className="text-white text-sm font-bold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "var(--brand-pink)" }}
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* ── Participantes ── */}
        <section>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="text-base font-semibold text-neutral-900">Participantes</h2>
            <span className="text-sm text-neutral-400">{users.length} registradas</span>
          </div>

          {users.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">
              Aún no hay participantes registradas.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50">
                    <th className="text-left px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide hidden sm:table-cell">@Red social</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide">Pts</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">Journal</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">Hotmart</th>
                    <th className="text-right px-4 py-3 font-medium text-neutral-500 text-xs uppercase tracking-wide hidden md:table-cell">Extras</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <AdminUserRows
                  users={users}
                  extrasByUser={extrasByUser}
                  challenges={challengeInfo}
                />
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
