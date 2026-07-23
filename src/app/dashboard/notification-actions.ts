"use server";

import { auth } from "@/auth";
import { markAllNotificationsRead } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;
  markAllNotificationsRead(session.user.id);
  revalidatePath("/dashboard");
}
