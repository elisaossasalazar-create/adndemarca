"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { setSetting, adjustUserPointsDelta, deleteUser } from "@/lib/db";

async function requireAdmin(): Promise<void> {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!session?.user?.email || !adminEmail || session.user.email !== adminEmail) {
    redirect("/dashboard");
  }
}

export async function updatePointSettings(formData: FormData) {
  await requireAdmin();

  const journal = parseInt(formData.get("points_journal") as string);
  const weekly = parseInt(formData.get("points_weekly") as string);
  const extra = parseInt(formData.get("points_extra") as string);

  if (journal > 0) setSetting("points_journal", String(journal));
  if (weekly > 0) setSetting("points_weekly", String(weekly));
  if (extra > 0) setSetting("points_extra", String(extra));

  revalidatePath("/admin");
}

export async function adjustPoints(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  const delta = parseInt(formData.get("delta") as string);

  if (!userId || isNaN(delta) || delta === 0) return;

  adjustUserPointsDelta(userId, delta);
  revalidatePath("/admin");
}

export async function removeUser(formData: FormData) {
  await requireAdmin();

  const userId = formData.get("userId") as string;
  if (!userId) return;

  deleteUser(userId);
  revalidatePath("/admin");
}
