import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getUserById,
  hasJournalForDate,
  hasWeeklyCompletion,
  getExtraCompletionsForUser,
} from "@/lib/db";
import { getChallengesForWeek } from "@/lib/challenges";
import { getTodayUTCString, getCurrentWeek, getMotivationalPhrase } from "@/lib/course";
import LogoutButton from "./logout-button";
import JournalCard from "./journal-card";
import WeeklyCard from "./weekly-card";
import ExtraChallengeCard from "./extra-challenge-card";
import TabsLayout from "./tabs-layout";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = getUserById(session.user.id);
  if (!user) redirect("/login");

  const today = getTodayUTCString();
  const week = getCurrentWeek();

  const journalDone = hasJournalForDate(user.id, today);
  const weeklyDone = hasWeeklyCompletion(user.id, week);
  const extraCompletions = getExtraCompletionsForUser(user.id);
  const completedIds = new Set(extraCompletions.map((c) => c.challenge_id));
  const evidenceMap = Object.fromEntries(
    extraCompletions.map((c) => [c.challenge_id, c.evidence_filename])
  );
  const weekChallenges = getChallengesForWeek(week);
  const phrase = getMotivationalPhrase();

  const inicioContent = (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <JournalCard done={journalDone} />
      <WeeklyCard done={weeklyDone} week={week} />

      <div className="mt-2">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-400">
          Retos extra · Semana {week}
        </p>
        <div className="flex flex-col gap-3">
          {weekChallenges.map((challenge) => (
            <ExtraChallengeCard
              key={challenge.id}
              challenge={challenge}
              done={completedIds.has(challenge.id)}
              evidenceFilename={evidenceMap[challenge.id]}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const calendarioContent = (
    <div className="flex flex-col items-center py-16 text-center text-neutral-400">
      <p className="text-sm">El calendario llega en la próxima iteración.</p>
    </div>
  );

  const rankingContent = (
    <div className="flex flex-col items-center py-16 text-center text-neutral-400">
      <p className="text-sm">El ranking llega en la próxima iteración.</p>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-100 px-6 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-neutral-400">
              ADN de Marca · 7ma Edición
            </p>
            <p className="mt-0.5 text-lg font-semibold leading-tight">
              {user.full_name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 rounded-full bg-neutral-900 px-3 py-1">
              <span className="text-xs font-semibold text-white">
                {user.points_total} pts
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
        <p className="mt-3 text-xs text-neutral-500 italic">{phrase}</p>
      </header>

      <TabsLayout
        inicio={inicioContent}
        calendario={calendarioContent}
        ranking={rankingContent}
      />
    </div>
  );
}
