import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getAllUsersWithStats } from "@/lib/db";
import { getEffectivePoints } from "@/lib/points.server";
import { updatePointSettings, adjustPoints, removeUser } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) redirect("/dashboard");

  const users = getAllUsersWithStats();

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
          <h1 className="mt-3 text-2xl font-bold text-neutral-900">Panel de Administración</h1>
          <p className="mt-1 text-sm text-neutral-500">ADN de Marca · 7ma Edición</p>
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
                  className="bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-neutral-700 transition-colors"
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
                <tbody>
                  {users.map((user, i) => (
                    <tr
                      key={user.id}
                      className={`border-b border-neutral-100 last:border-0 ${i % 2 === 0 ? "" : "bg-neutral-50/50"}`}
                    >
                      <td className="px-4 py-3 font-medium text-neutral-900">{user.full_name}</td>
                      <td className="px-4 py-3 text-neutral-500">{user.email}</td>
                      <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{user.social_handle}</td>
                      <td className="px-4 py-3 text-right font-semibold text-neutral-900">{user.points_total}</td>
                      <td className="px-4 py-3 text-right text-neutral-500 hidden md:table-cell">{user.journal_count}</td>
                      <td className="px-4 py-3 text-right text-neutral-500 hidden md:table-cell">{user.weekly_count}/5</td>
                      <td className="px-4 py-3 text-right text-neutral-500 hidden md:table-cell">{user.extra_count}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          {/* Adjust points */}
                          <form action={adjustPoints} className="flex items-center gap-1">
                            <input type="hidden" name="userId" value={user.id} />
                            <input
                              type="number"
                              name="delta"
                              placeholder="±pts"
                              className="w-16 border border-neutral-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            />
                            <button
                              type="submit"
                              className="text-xs bg-neutral-100 hover:bg-neutral-200 px-2 py-1 rounded-lg transition-colors"
                              title="Ajustar puntos"
                            >
                              ±
                            </button>
                          </form>
                          {/* Delete user */}
                          <form action={removeUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                              title="Eliminar participante"
                            >
                              ✕
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
