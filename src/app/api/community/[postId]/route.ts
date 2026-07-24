import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteCommunityPost, deleteCommunityPostByOwner, updateCommunityPost } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { postId } = await params;
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const isAdmin = !!adminEmail && session.user.email?.toLowerCase() === adminEmail;

  if (isAdmin) {
    deleteCommunityPost(postId);
    return NextResponse.json({ ok: true });
  }

  const deleted = deleteCommunityPostByOwner(postId, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "No puedes eliminar esta publicación." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { postId } = await params;

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "El contenido no puede estar vacío." }, { status: 400 });
  if (content.length > 1000) return NextResponse.json({ error: "Máximo 1000 caracteres." }, { status: 400 });

  const updated = updateCommunityPost(postId, session.user.id, content);
  if (!updated) {
    return NextResponse.json({ error: "No puedes editar esta publicación." }, { status: 403 });
  }
  return NextResponse.json({ ok: true, content });
}
