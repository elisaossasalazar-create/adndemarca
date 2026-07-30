// Fecha de inicio del curso — ajustar en .env o aquí directamente
// Formato ISO: "YYYY-MM-DD"
const RAW_START = process.env.COURSE_START_DATE ?? "2026-07-14";

// Colombia is UTC-5; use this offset so journal dates reflect the local calendar
// day the participant is actually living, not the UTC day on the server.
const COLOMBIA_OFFSET_MS = 5 * 60 * 60 * 1000;

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
  const nowColombia = new Date(Date.now() - COLOMBIA_OFFSET_MS);
  return nowColombia.toISOString().slice(0, 10);
}

export function getCurrentWeek(): number {
  const start = getCourseStartDate();
  const now = new Date();
  const todayMs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
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
