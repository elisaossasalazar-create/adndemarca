import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserById, createCommunityComment } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = getUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const { postId } = await params;

  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const content = String(body.content ?? "").trim();
  if (!content) {
    return NextResponse.json({ error: "El comentario no puede estar vacío." }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "El comentario es muy largo (máx. 500 caracteres)." }, { status: 400 });
  }

  const comment = createCommunityComment(postId, session.user.id, user.full_name, content);

  return NextResponse.json({ ok: true, comment });
}
