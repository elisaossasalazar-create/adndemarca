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

export function getCurrentWeek(): number {
  const start = getCourseStartDate();
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 1;
  const week = Math.floor(diffDays / 7) + 1;
  return Math.min(Math.max(week, 1), 5);
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
