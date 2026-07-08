import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getUserById,
  getAllUsers,
  hasJournalForDate,
  hasWeeklyCompletion,
  getExtraCompletionsForUser,
  getJournalDatesForUser,
} from "@/lib/db";
import { getChallengesForWeek } from "@/lib/challenges";
import {
  getTodayUTCString,
  getCurrentWeek,
  getMotivationalPhrase,
  getCourseStartString,
} from "@/lib/course";
import { Star, PinkStar } from "@/components/star";
import LogoutButton from "./logout-button";
import JournalCard from "./journal-card";
import WeeklyCard from "./weekly-card";
import ExtraChallengeCard from "./extra-challenge-card";
import CalendarTab from "./calendar-tab";
import RankingTab from "./ranking-tab";
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

  const journalDates = getJournalDatesForUser(user.id);
  const courseStartStr = getCourseStartString();

  const allUsers = getAllUsers();

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
    <CalendarTab
      completedDates={journalDates}
      courseStartDate={courseStartStr}
    />
  );

  const rankingContent = (
    <RankingTab
      users={allUsers.map((u) => ({
        id: u.id,
        full_name: u.full_name,
        points_total: u.points_total,
      }))}
      currentUserId={user.id}
    />
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
              The Brand Camp · 7ma Edición
            </p>
            <p className="mt-0.5 text-xl font-bold lowercase leading-tight">
              {user.full_name}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{ backgroundColor: "var(--brand-yellow)" }}
            >
              <Star size={13} />
              <span className="text-xs font-bold text-neutral-900">
                {user.points_total} pts
              </span>
            </div>
            <LogoutButton />
          </div>
        </div>
        <p className="mt-3 text-xs font-normal text-neutral-400 italic">{phrase}</p>
      </header>

      <TabsLayout
        inicio={inicioContent}
        calendario={calendarioContent}
        ranking={rankingContent}
      />
    </div>
  );
}
