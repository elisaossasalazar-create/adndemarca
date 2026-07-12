import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteResource } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!adminEmail || session.user.email?.toLowerCase() !== adminEmail) {
    return NextResponse.json({ error: "Solo el admin puede eliminar recursos." }, { status: 403 });
  }

  const { id } = await params;
  deleteResource(id);

  return NextResponse.json({ ok: true });
}
