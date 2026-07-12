import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getUserById,
  getAllUsers,
  hasJournalForDate,
  hasWeeklyCompletion,
  getExtraCompletionsForUser,
  getJournalDatesForUser,
  getCommunityPosts,
  getResources,
  type User,
  type ExtraCompletion,
  type CommunityPostWithComments,
  type Resource,
} from "@/lib/db";
import { getChallengesForWeek } from "@/lib/challenges";
import {
  getTodayUTCString,
  getCurrentWeek,
  getCourseStartString,
} from "@/lib/course";
import { Star, PinkStar } from "@/components/star";
import LogoutButton from "./logout-button";
import JournalCard from "./journal-card";
import WeeklyCard from "./weekly-card";
import ExtraChallengeCard from "./extra-challenge-card";
import CalendarTab from "./calendar-tab";
import RankingTab from "./ranking-tab";
import CommunityTab from "./community-tab";
import ResourcesTab from "./resources-tab";
import TabsLayout from "./tabs-layout";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // ── Get user (first DB call / initialises the singleton) ──────────────────
  let user: User | undefined;
  let dbInitError: string | null = null;
  try {
    user = getUserById(session.user.id);
  } catch (e) {
    dbInitError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error("[Dashboard] getUserById failed:", e);
  }

  if (dbInitError) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 max-w-lg w-full">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-3">
            The Brand Camp · ADN de Marca
          </p>
          <h1 className="text-lg font-bold lowercase text-neutral-900 mb-3">
            error al cargar el dashboard
          </h1>
          <pre className="text-xs font-mono bg-neutral-50 rounded-xl px-4 py-3 text-red-600 whitespace-pre-wrap break-all mb-4">
            {dbInitError}
          </pre>
          <p className="text-xs text-neutral-500">
            Captura este mensaje y compártelo para que podamos resolverlo.
          </p>
        </div>
      </div>
    );
  }

  if (!user) redirect("/login");

  // ── Load remaining dashboard data ─────────────────────────────────────────
  const today = getTodayUTCString();
  const week = getCurrentWeek();

  let journalDone = false;
  let weeklyDone = false;
  let extraCompletions: ExtraCompletion[] = [];
  let journalDates: string[] = [];
  let allUsers: User[] = [];
  let communityPosts: CommunityPostWithComments[] = [];
  let resourcesList: Resource[] = [];
  let dataError: string | null = null;

  try {
    journalDone = hasJournalForDate(user.id, today);
    weeklyDone = hasWeeklyCompletion(user.id, week);
    extraCompletions = getExtraCompletionsForUser(user.id);
    journalDates = getJournalDatesForUser(user.id);
    allUsers = getAllUsers();
    communityPosts = getCommunityPosts();
    resourcesList = getResources();
  } catch (e) {
    dataError = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    console.error("[Dashboard] data loading failed:", e);
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 p-8 max-w-lg w-full">
          <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400 mb-3">
            The Brand Camp · ADN de Marca
          </p>
          <h1 className="text-lg font-bold lowercase text-neutral-900 mb-3">
            error al cargar los datos
          </h1>
          <pre className="text-xs font-mono bg-neutral-50 rounded-xl px-4 py-3 text-red-600 whitespace-pre-wrap break-all mb-4">
            {dataError}
          </pre>
          <p className="text-xs text-neutral-500">
            Captura este mensaje y compártelo para que podamos resolverlo.
          </p>
        </div>
      </div>
    );
  }

  const completedIds = new Set(extraCompletions.map((c) => c.challenge_id));
  const evidenceMap = Object.fromEntries(
    extraCompletions.map((c) => [c.challenge_id, c.evidence_filename])
  );
  const weekChallenges = getChallengesForWeek(week);
  const courseStartStr = getCourseStartString();

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

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = !!adminEmail && user.email.toLowerCase() === adminEmail;

  const recursosContent = (
    <ResourcesTab
      initialResources={resourcesList}
      isAdmin={isAdmin}
    />
  );

  const comunidadContent = (
    <CommunityTab
      initialPosts={communityPosts}
      currentUserId={user.id}
      currentWeek={week}
      isAdmin={isAdmin}
    />
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex justify-center sm:py-6 sm:px-4">
    <div className="w-full sm:max-w-2xl flex flex-col bg-white text-neutral-900 sm:rounded-3xl sm:shadow-sm sm:border sm:border-neutral-100 overflow-hidden">
      <header className="px-6 py-4 border-b border-neutral-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-neutral-400">
              The Brand Camp · 7ma Edición
            </p>
            <p className="mt-0.5 text-xl font-bold lowercase leading-tight">
              hola estrellita, {user.full_name}
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
        <div className="mt-3 text-xs sm:text-sm font-normal text-neutral-500 leading-relaxed">
          <span className="font-medium text-neutral-700">Recuerda que:</span>
          <ul className="mt-1 list-none space-y-1 pl-0">
            <li className="flex items-start gap-1.5"><Star size={11} className="mt-0.5 flex-shrink-0" />la acción trae claridad</li>
            <li className="flex items-start gap-1.5"><Star size={11} className="mt-0.5 flex-shrink-0" />no tengo que estar listo, tengo que estar dispuesto</li>
            <li className="flex items-start gap-1.5"><Star size={11} className="mt-0.5 flex-shrink-0" />Dios no se equivoca con las ideas, dones o talentos que me dió</li>
          </ul>
        </div>
      </header>

      <TabsLayout
        inicio={inicioContent}
        calendario={calendarioContent}
        ranking={rankingContent}
        comunidad={comunidadContent}
        recursos={recursosContent}
      />
    </div>
    </div>
  );
}
