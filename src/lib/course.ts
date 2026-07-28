// Fecha de inicio del curso — ajustar en .env o aquí directamente
// Formato ISO: "YYYY-MM-DD"
const RAW_START = process.env.COURSE_START_DATE ?? "2026-07-14";

function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function getCourseStartDate(): Date {
  return parseDateUTC(RAW_START);
}

export function getCourseStartString(): string {
  return RAW_START;
}

export function getTodayUTCString(): string {
  return new Date().toISOString().slice(0, 10);
}

// Week boundaries are anchored to Colombia midnight (UTC-5) so Sunday feels
// like Sunday for the primary audience regardless of server clock timezone.
const COLOMBIA_OFFSET_MS = 5 * 60 * 60 * 1000;

export function getCurrentWeek(): number {
  const start = getCourseStartDate();
  // Shift "now" to Colombia local time, then read its calendar date in UTC
  const nowColombia = new Date(Date.now() - COLOMBIA_OFFSET_MS);
  const todayMs = Date.UTC(nowColombia.getUTCFullYear(), nowColombia.getUTCMonth(), nowColombia.getUTCDate());
  const startMs = start.getTime();

  if (todayMs < startMs) return 1;

  // Weeks start on Sundays. Find the first Sunday >= start + 7 days (= start of week 2).
  const week2Base = new Date(startMs + 7 * 24 * 60 * 60 * 1000);
  const dow = week2Base.getUTCDay(); // 0 = Sun
  const daysToSun = dow === 0 ? 0 : 7 - dow;
  const week2StartMs = week2Base.getTime() + daysToSun * 24 * 60 * 60 * 1000;

  if (todayMs < week2StartMs) return 1;

  const diffDays = Math.floor((todayMs - week2StartMs) / (24 * 60 * 60 * 1000));
  return Math.min(Math.floor(diffDays / 7) + 2, 5);
}

const PHRASES = [
  "acción sobre perfección",
  "da el paso y aparecerá la escalera",
  "Dios no se equivocó con las ideas, dones o talentos que me dió",
];

export function getMotivationalPhrase(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % PHRASES.length;
  return PHRASES[dayIndex];
}
