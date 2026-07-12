import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteCommunityPost } from "@/lib/db";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Solo el admin puede eliminar publicaciones." }, { status: 403 });
  }

  const { postId } = await params;
  deleteCommunityPost(postId);

  return NextResponse.json({ ok: true });
}
