import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteCommunityComment, updateCommunityComment } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { commentId } = await params;
  const deleted = deleteCommunityComment(commentId, session.user.id);
  if (!deleted) {
    return NextResponse.json({ error: "No puedes eliminar este comentario." }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ postId: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { commentId } = await params;

  let body: { content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const content = String(body.content ?? "").trim();
  if (!content) return NextResponse.json({ error: "El contenido no puede estar vacío." }, { status: 400 });
  if (content.length > 500) return NextResponse.json({ error: "Máximo 500 caracteres." }, { status: 400 });

  const updated = updateCommunityComment(commentId, session.user.id, content);
  if (!updated) {
    return NextResponse.json({ error: "No puedes editar este comentario." }, { status: 403 });
  }
  return NextResponse.json({ ok: true, content });
}
