"use server";

import { revalidatePath } from "next/cache";
import { writeFileSync } from "node:fs";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { addJournalCompletion, addWeeklyCompletion, addExtraCompletion } from "@/lib/db";
import { POINTS } from "@/lib/challenges";
import { getTodayUTCString, getCurrentWeek } from "@/lib/course";

async function getAuthUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("No autenticado");
  return session.user.id;
}

export async function markJournalComplete() {
  const userId = await getAuthUserId();
  const today = getTodayUTCString();
  addJournalCompletion(userId, today, POINTS.JOURNAL_DAILY);
  revalidatePath("/dashboard");
}

export async function markWeeklyComplete() {
  const userId = await getAuthUserId();
  const week = getCurrentWeek();
  addWeeklyCompletion(userId, week, POINTS.WEEKLY_HOTMART);
  revalidatePath("/dashboard");
}

export async function markExtraComplete(formData: FormData) {
  const userId = await getAuthUserId();
  const challengeId = formData.get("challengeId") as string;
  const file = formData.get("evidence") as File | null;

  if (!challengeId) throw new Error("Challenge ID requerido");
  if (!file || file.size === 0) throw new Error("La foto de evidencia es obligatoria");

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const allowedExt = ["jpg", "jpeg", "png", "gif", "webp", "heic"];
  if (!allowedExt.includes(ext)) throw new Error("Formato de imagen no válido");

  const filename = `${randomUUID()}.${ext}`;
  const uploadsDir = join(process.cwd(), "public", "uploads");
  mkdirSync(uploadsDir, { recursive: true });

  const bytes = await file.arrayBuffer();
  writeFileSync(join(uploadsDir, filename), Buffer.from(bytes));

  addExtraCompletion(userId, challengeId, filename, POINTS.EXTRA_CHALLENGE);
  revalidatePath("/dashboard");
}
