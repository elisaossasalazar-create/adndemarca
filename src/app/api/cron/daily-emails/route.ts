import { NextResponse } from "next/server";
import {
  getAllUsers,
  hasJournalForDate,
  hasWeeklyCompletion,
  hasAnyExtraForWeek,
} from "@/lib/db";
import { getChallengesForWeek, POINTS } from "@/lib/challenges";
import { getTodayUTCString, getCurrentWeek, getCourseStartDate } from "@/lib/course";
import { sendEmail } from "@/lib/email";
import {
  journalReminderEmail,
  hotmartReminderEmail,
  extrasMotivationEmail,
} from "@/lib/email-templates";

// Protegido por CRON_SECRET — llamar con:
// curl -X POST https://tudominio.com/api/cron/daily-emails \
//      -H "Authorization: Bearer $CRON_SECRET"
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("Authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Solo enviar durante el periodo del curso
  const courseStart = getCourseStartDate();
  const now = new Date();
  if (now < courseStart) {
    return NextResponse.json({
      ok: true,
      message: "El curso no ha comenzado todavía",
      sent: 0,
      skipped: 0,
    });
  }

  const today = getTodayUTCString();
  const week = getCurrentWeek();
  const weekChallengeIds = getChallengesForWeek(week).map((c) => c.id);
  const users = getAllUsers();

  const results: Array<{ email: string; scenario: string; status: string }> = [];

  for (const user of users) {
    const journalDone = hasJournalForDate(user.id, today);
    const weeklyDone = hasWeeklyCompletion(user.id, week);
    const anyExtraDone = hasAnyExtraForWeek(user.id, weekChallengeIds);

    let scenario: "journal" | "hotmart" | "extras" | "none";
    let emailContent: { subject: string; html: string } | null = null;

    if (!journalDone) {
      scenario = "journal";
      emailContent = journalReminderEmail(user.full_name, POINTS.JOURNAL_DAILY);
    } else if (!weeklyDone) {
      scenario = "hotmart";
      emailContent = hotmartReminderEmail(user.full_name, week, POINTS.WEEKLY_HOTMART);
    } else if (!anyExtraDone) {
      scenario = "extras";
      emailContent = extrasMotivationEmail(user.full_name, POINTS.EXTRA_CHALLENGE);
    } else {
      scenario = "none";
    }

    if (emailContent) {
      try {
        await sendEmail({ to: user.email, ...emailContent });
        results.push({ email: user.email, scenario, status: "sent" });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error desconocido";
        results.push({ email: user.email, scenario, status: `error: ${message}` });
      }
    } else {
      results.push({ email: user.email, scenario, status: "skipped" });
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const errors = results.filter((r) => r.status.startsWith("error")).length;

  return NextResponse.json({ ok: true, sent, skipped, errors, results });
}
