"use client";

import { useState } from "react";
import { adjustPoints, resetExtraCompletion } from "./actions";
import DeleteUserButton from "./delete-user-button";

interface AdminUserRow {
  id: string;
  full_name: string;
  email: string;
  social_handle: string;
  phone: string;
  points_total: number;
  created_at: string;
  journal_count: number;
  weekly_count: number;
  extra_count: number;
}

interface ExtraCompletion {
  id: string;
  user_id: string;
  challenge_id: string;
  evidence_filename: string;
  created_at: string;
}

interface ChallengeInfo {
  id: string;
  week: number;
  title: string;
}

interface Props {
  users: AdminUserRow[];
  extrasByUser: Record<string, ExtraCompletion[]>;
  challenges: ChallengeInfo[];
}

export default function AdminUserRows({ users, extrasByUser, challenges }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const challengeMap = Object.fromEntries(challenges.map((c) => [c.id, c]));

  return (
    <>
      {users.map((user, i) => {
        const isExpanded = expandedId === user.id;
        const extras = extrasByUser[user.id] ?? [];

        return (
          <tbody key={user.id}>
            <tr className={`border-b border-neutral-100 ${i % 2 === 0 ? "" : "bg-neutral-50/50"} ${isExpanded ? "border-b-0" : ""}`}>
              <td className="px-4 py-3 font-medium text-neutral-900">
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : user.id)}
                  className="flex items-center gap-1.5 text-left hover:text-neutral-600 transition-colors"
                >
                  <span className="text-neutral-300 text-[10px]">{isExpanded ? "▲" : "▼"}</span>
                  {user.full_name}
                </button>
              </td>
              <td className="px-4 py-3 text-neutral-500">{user.email}</td>
              <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell">{user.social_handle}</td>
              <td className="px-4 py-3 text-right font-semibold text-neutral-900">{user.points_total}</td>
              <td className="px-4 py-3 text-right text-neutral-500 hidden md:table-cell">{user.journal_count}</td>
              <td className="px-4 py-3 text-right text-neutral-500 hidden md:table-cell">{user.weekly_count}/5</td>
              <td className="px-4 py-3 text-right text-neutral-500 hidden md:table-cell">{user.extra_count}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
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
                  <DeleteUserButton userId={user.id} userName={user.full_name} />
                </div>
              </td>
            </tr>

            {isExpanded && (
              <tr className={`border-b border-neutral-100 ${i % 2 === 0 ? "" : "bg-neutral-50/50"}`}>
                <td colSpan={8} className="px-4 pb-4 pt-2">
                  {extras.length === 0 ? (
                    <p className="text-xs text-neutral-400 italic">Ningún reto extra completado aún.</p>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {extras.map((ec) => {
                        const ch = challengeMap[ec.challenge_id];
                        const weekLabel = ch ? `S${ch.week}` : ec.challenge_id;
                        const title = ch?.title ?? ec.challenge_id;
                        return (
                          <div key={ec.id} className="flex flex-col gap-1.5 w-32">
                            <a
                              href={`/api/files/${ec.evidence_filename}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={`/api/files/${ec.evidence_filename}`}
                                alt={title}
                                className="w-32 h-24 object-cover rounded-xl border border-neutral-100 hover:opacity-90 transition-opacity"
                                onError={(e) => {
                                  const img = e.currentTarget;
                                  img.style.display = "none";
                                  const placeholder = img.nextElementSibling as HTMLElement | null;
                                  if (placeholder) placeholder.style.display = "flex";
                                }}
                              />
                              <div
                                className="w-32 h-24 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 items-center justify-center text-[10px] text-neutral-400 text-center px-2"
                                style={{ display: "none" }}
                              >
                                foto no disponible
                              </div>
                            </a>
                            <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">{weekLabel}</p>
                            <p className="text-xs text-neutral-700 leading-tight lowercase">{title}</p>
                            <form action={resetExtraCompletion}>
                              <input type="hidden" name="completionId" value={ec.id} />
                              <input type="hidden" name="userId" value={ec.user_id} />
                              <button
                                type="submit"
                                className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
                                title="Eliminar esta entrega para que la persona pueda volver a subir"
                                onClick={(e) => {
                                  if (!confirm("¿Eliminar esta entrega? La persona podrá volver a subir evidencia.")) e.preventDefault();
                                }}
                              >
                                ↺ resetear
                              </button>
                            </form>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        );
      })}
    </>
  );
}
