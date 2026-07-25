import { NextResponse } from "next/server";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import { resetUserPassword } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!session?.user?.email || !adminEmail || session.user.email.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { userId?: string; newPassword?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const { userId, newPassword } = body;
  if (!userId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Mínimo 6 caracteres" }, { status: 400 });
  }

  const hash = await bcrypt.hash(newPassword, 10);
  resetUserPassword(userId, hash);
  return NextResponse.json({ ok: true });
}
