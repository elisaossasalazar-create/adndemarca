// Fecha de inicio del curso — ajustar en .env o aquí directamente
// Formato ISO: "YYYY-MM-DD"
const RAW_START = process.env.COURSE_START_DATE ?? "2026-07-07";

function parseDateUTC(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function getCourseStartDate(): Date {
  return parseDateUTC(RAW_START);
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
  "Pasar a la acción todos los días vale más que tener el plan perfecto.",
  "Tu marca se construye en los momentos en que decides hacerlo, no en los que lo planeas.",
  "La consistencia es el diferencial que la mayoría no tiene.",
  "Hoy es exactamente el día correcto para empezar.",
  "Las marcas que perduran se construyen con autenticidad, no con perfección.",
  "Cada reto completado es una versión más real de tu marca.",
  "No necesitas saberlo todo. Solo necesitas hacer algo hoy.",
  "Tu audiencia está esperando exactamente lo que tú eres.",
  "Las marcas fuertes se forjan en la práctica diaria.",
  "El mejor contenido viene de quien se anima a mostrarse de verdad.",
];

export function getMotivationalPhrase(): string {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % PHRASES.length;
  return PHRASES[dayIndex];
}
